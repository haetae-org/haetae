import upath from 'upath'
import assert from 'assert/strict'
import fs from 'fs'
import memoizee from 'memoizee'
import serialize from 'serialize-javascript'
import { produce } from 'immer'
import deepEqual from 'deep-equal'
import { findUpSync } from 'find-up'
import { dirname } from 'dirname-filename-esm'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ms from 'ms' // TODO: rm ts-ignore once https://github.com/vercel/ms/issues/189 is resolved.
import { parsePkg, PromiseOr } from '@haetae/common'

export const pkg = parsePkg({
  name: '@haetae/core',
  rootDir: dirname(import.meta),
})

let currentCommand: string | undefined

export interface SetCurrentCommandOptions {
  command: string
}

export const setCurrentCommand = ({ command }: SetCurrentCommandOptions) => {
  currentCommand = command
}

export const getCurrentCommand = (): string => {
  if (!currentCommand) {
    throw new Error(
      `currentCommand has invalid value or not set: ${currentCommand}`,
    )
  }
  return currentCommand
}

export const defaultConfigFiles = [
  'haetae.config.js',
  'haetae.config.mjs',
  'haetae.config.ts',
]

let configFilename: string | undefined

export const getConfigFilename = (): string => {
  assert(!!configFilename, 'configFilename is not set yet.')
  return configFilename
}

export interface SetConfigFilenameOptions {
  filename?: string
  cwd?: string
}

export const setConfigFilename = ({
  filename,
  cwd = process.cwd(),
}: SetConfigFilenameOptions = {}) => {
  if (filename) {
    // eslint-disable-next-line no-param-reassign
    filename = upath.resolve(cwd, filename)
    assert(
      fs.existsSync(filename),
      `Path to config file(${filename}) is non-existent path.`,
    )
    configFilename = filename
  } else {
    const candidates = defaultConfigFiles
      .map((f) =>
        findUpSync(f, {
          cwd,
        }),
      )
      .map((f) => upath.resolve(f))
      .filter((v) => v)
    candidates.sort((a, b) => {
      const aDepth = upath.dirname(a).length
      const bDepth = upath.dirname(b).length
      if (aDepth > bDepth) {
        // The deeper becomes the former
        return -1
      }
      if (aDepth < bDepth) {
        // The shallower becomes the latter
        return 1
      }
      // If depth is equal, extension decides the order.
      const extenstions = defaultConfigFiles.map((f) => upath.extname(f))
      const aExtIndex = extenstions.indexOf(upath.extname(a))
      const bExtIndex = extenstions.indexOf(upath.extname(b))

      return aExtIndex - bExtIndex
    })
    if (candidates.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      configFilename = candidates[0]
    } else {
      throw new Error('Cannot find the configuration file.')
    }
  }
}

// todo: set/get current config dirname
export const getConfigDirname = () => upath.dirname(getConfigFilename())

export const defaultStoreFile = '.haetae/store.json'

let storeFilename: string | undefined

export interface SetStoreFilenameOptions {
  filename: string
  rootDir?: string
}

export const setStoreFilename = ({
  filename,
  rootDir = getConfigDirname(),
}: SetStoreFilenameOptions) => {
  // eslint-disable-next-line no-param-reassign
  filename = upath.normalize(filename)

  if (!upath.isAbsolute(filename)) {
    // eslint-disable-next-line no-param-reassign
    filename = upath.join(rootDir, filename)
  }

  const extension = upath.extname(filename)
  assert(
    !extension || extension === '.json',
    `Extension of the store file "${filename}" is not .json.`,
  )
  if (extension !== '.json') {
    // eslint-disable-next-line no-param-reassign
    filename = upath.join(storeFilename, defaultStoreFile)
  }

  storeFilename = filename
}

export const getStoreFilename = (): string => {
  if (storeFilename) {
    return storeFilename
  }
  return upath.join(getConfigDirname(), defaultStoreFile)
}

export interface HaetaeRecord<D = unknown, E = unknown> {
  data: D | null
  env: E | null
  time: number
}

export interface HaetaeStore<D = unknown, E = unknown> {
  version: string
  commands: {
    [command: string]: HaetaeRecord<D, E>[]
  }
}

export type HaetaeCommandEnv<E = unknown> = () => void | PromiseOr<
  E | null | undefined
>

export type HaetaePreCommandEnv<E = unknown> =
  | HaetaeCommandEnv<E>
  | PromiseOr<E | null | undefined>

export interface HaetaePreCommand<D = unknown, E = unknown> {
  run: () => void | PromiseOr<D | null | undefined>
  env?: HaetaePreCommandEnv<E>
}

export interface HaetaeCommand<D = unknown, E = unknown> {
  run: () => void | PromiseOr<D | null | undefined>
  env: HaetaeCommandEnv<E>
}

export type RootEnv<E = unknown> = (
  envFromCommand: E | null,
) => PromiseOr<E | null>

export type RootRecordData<D = unknown> = (
  recordDataFromCommand: D | null,
) => PromiseOr<D | null>

export interface HaetaePreConfig<D = unknown, E = unknown> {
  commands: {
    [command: string]: HaetaePreCommand<D, E>
  }
  env?: RootEnv<E>
  recordData?: RootRecordData<D>
  recordRemoval?: {
    age?: string | number // by milliseconds if number // e.g. 90 * 24 * 60 * 60 * 1000 => 90days
    count?: number // e.g. 10 => Only leave equal to or less than 10 records
  }
  // It should be an absolute or relative path (relative to config file path)
  storeFile?: string
}

export interface HaetaeConfig<D = unknown, E = unknown> {
  commands: {
    [command: string]: HaetaeCommand<D, E>
  }
  env: RootEnv<E>
  recordData: RootRecordData<D>
  recordRemoval: {
    age: number
    count: number
  }
  storeFile: string
}

export function configure<D = unknown, E = unknown>({
  commands,
  env = (envFromCommand) => envFromCommand,
  recordData = (recordDataFromCommand) => recordDataFromCommand,
  recordRemoval: {
    age = Number.POSITIVE_INFINITY,
    count = Number.POSITIVE_INFINITY,
  } = {},
  storeFile = defaultStoreFile,
}: HaetaePreConfig<D | unknown, E | unknown>): HaetaeConfig<D, E> {
  /* eslint-disable no-param-reassign */
  if (typeof age === 'string') {
    age = ms(age) as number // TODO: rm ts-ignore once https://github.com/vercel/ms/issues/189 is resolved.
    assert(
      // `undefined` if invalid string
      age === 0 || !!age,
      `'recordRemoval.age' is given as an invalid string. Refer to https://github.com/vercel/ms for supported value.`,
    )
  }
  // Convert it to a function if not
  assert(
    typeof env === 'function',
    `'env' is misconfigured. It should be a function.`,
  )
  assert(
    typeof recordData === 'function',
    `'recordData' is misconfigured. It should be a function.`,
  )
  assert(
    typeof storeFile === 'string',
    `'storeFile' is misconfigured. It should be string.`,
  )
  assert(
    age >= 0,
    `'recordRemoval.age' is misconfigured. It should be zero or positive value.`,
  )
  assert(
    count >= 0,
    `'recordRemoval.age' is misconfigured. It should be zero or positive value.`,
  )

  // If store file is already set before, `storeFile` in config would be ignored.
  if (!storeFilename) {
    setStoreFilename({
      filename: storeFile,
    })
  }

  for (const command in commands) {
    if (Object.prototype.hasOwnProperty.call(commands, command)) {
      // Convert it to a function if not
      if (typeof commands[command].env !== 'function') {
        const value = commands[command].env as ReturnType<HaetaeCommandEnv<E>>
        commands[command].env = () => value
      }

      assert(
        typeof commands[command].run === 'function',
        `commands.${command}.run is invalid. It should be a function.`,
      )
    }
  }

  /* eslint-enable no-param-reassign */
  return {
    commands: commands as HaetaeConfig<D, E>['commands'],
    env: env as RootEnv<E>,
    recordData: recordData as RootRecordData<D>,
    recordRemoval: {
      age,
      count,
    },
    storeFile: getStoreFilename(),
  }
}

// memoize to prevent duplicated registration
const registerTsNode = memoizee(async () => {
  try {
    // import optional peerDependency 'ts-node'
    // Register TypeScript compiler instance
    const tsNode = await import('ts-node')
    return tsNode.register()
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (error?.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        `To read a config file written in typescript, 'ts-node' is required. Please install it.\nError: ${error?.message}`,
      )
    }
    throw error
  }
})

// Load the TypeScript configuration
const importTs = async (filename: string) => {
  // Get registered TypeScript compiler instance
  const registeredCompiler = await registerTsNode()
  // [Service.enabled] REF: https://github.com/TypeStrong/ts-node/blob/45a3c750475cf60c30301ab36bb9a8bcd52ae875/src/index.ts#L1449-L1450
  const isTsNodeCompilerEnabled = registeredCompiler.enabled()
  registeredCompiler.enabled(true)
  const module = await import(filename)
  registeredCompiler.enabled(isTsNodeCompilerEnabled) // Restore it to the original state
  return module
}

export interface GetConfigOptions {
  filename?: string
}

export const getConfig = memoizee(
  async <D = unknown, E = unknown>({
    filename = getConfigFilename(),
  }: GetConfigOptions = {}): Promise<HaetaeConfig<D, E>> => {
    // eslint-disable-next-line no-param-reassign
    filename = upath.resolve(filename)
    const preConfigModule = await (filename.endsWith('.ts')
      ? importTs(filename)
      : import(filename))

    return configure<D, E>(preConfigModule.default || preConfigModule)
  },
  {
    normalizer: serialize,
  },
)

export function initNewStore<D = unknown, E = unknown>(): HaetaeStore<D, E> {
  return { version: pkg.version.value, commands: {} }
}

export interface GetStoreOptions<D = unknown, E = unknown> {
  filename?: string
  // When there's no store file yet.
  fallback?: ({
    filename,
    error,
  }: {
    filename: string
    error: Error
  }) => PromiseOr<HaetaeStore<D, E>> | never
}

export const getStore = memoizee(
  async <D = unknown, E = unknown>({
    filename = getStoreFilename(),
    fallback = () => initNewStore(),
  }: GetStoreOptions<D, E> = {}): Promise<HaetaeStore<D, E>> => {
    let rawStore

    try {
      rawStore = fs.readFileSync(await filename, {
        encoding: 'utf8',
      })
    } catch (error) {
      return fallback({ filename: await filename, error: error as Error })
    }
    const store = JSON.parse(rawStore)
    return store
  },
  {
    normalizer: serialize,
  },
)

export interface GetRecordsOptions<D = unknown, E = unknown> {
  command?: PromiseOr<string>
  store?: PromiseOr<HaetaeStore<D, E>>
}

export async function getRecords<D = unknown, E = unknown>({
  command = getCurrentCommand(),
  store = getStore(),
}: GetRecordsOptions<D, E> = {}): Promise<HaetaeRecord<D, E>[] | undefined> {
  return (await store).commands[await command] // `undefined` if non-existent
}

export interface CommandFromConfig<D = unknown, E = unknown> {
  command?: PromiseOr<string>
  config?: PromiseOr<HaetaeConfig<D, E>>
}

export const invokeEnv = memoizee(
  async <E = unknown>({
    command = getCurrentCommand(),
    config = getConfig(),
  }: CommandFromConfig<unknown, E> = {}): Promise<E | null> => {
    const haetaeCommand = (await config).commands[await command]
    assert(!!haetaeCommand, `Command "${await command}" is not configured.`)
    const env = await haetaeCommand.env()
    // eslint-disable-next-line unicorn/no-null
    return (await config).env(env === undefined ? null : env)
  },
  {
    normalizer: serialize,
  },
)

export const invokeRun = async <D = unknown>({
  command = getCurrentCommand(),
  config = getConfig(),
}: CommandFromConfig<D, unknown> = {}): Promise<D | null> => {
  const haetaeCommand = (await config).commands[await command]
  assert(!!haetaeCommand, `Command "${await command}" is not configured.`)

  const recordData = await haetaeCommand.run()
  // eslint-disable-next-line unicorn/no-null
  return (await config).recordData(recordData === undefined ? null : recordData)
}

export interface GetRecordOptions<D = unknown, E = unknown>
  extends GetRecordsOptions<D, E> {
  env?: PromiseOr<E | null>
}

export function compareEnvs(one: unknown, theOther: unknown): boolean {
  let sOne
  let sTheOther
  try {
    sOne = JSON.stringify(one)
    sTheOther = JSON.stringify(theOther)
  } catch {
    throw new Error('`env` must be able to be stringified.')
  }

  return deepEqual(JSON.parse(sOne), JSON.parse(sTheOther), {
    strict: true,
  })
}

export async function getRecord<D = unknown, E = unknown>({
  command = getCurrentCommand(),
  env = invokeEnv({ command }),
  store = getStore(),
}: GetRecordOptions<D, E> = {}): Promise<HaetaeRecord<D, E> | undefined> {
  const records = await getRecords({ command, store })
  if (records) {
    for (const record of records) {
      if (compareEnvs(await env, record.env)) {
        return record
      }
    }
  }
  return undefined // `undefined` if non-existent
}

export interface FormRecordOptions<D = unknown, E = unknown> {
  data?: PromiseOr<D | null>
  env?: PromiseOr<E | null>
  time?: number
}

export async function formRecord<D = unknown, E = unknown>({
  data = invokeRun(),
  env = invokeEnv(),
  time = Date.now(),
}: FormRecordOptions<D, E> = {}): Promise<HaetaeRecord<D, E>> {
  return {
    data: await data,
    env: await env,
    time,
  }
}

export interface AddRecordOptions<D = unknown, E = unknown> {
  config?: PromiseOr<HaetaeConfig>
  command?: PromiseOr<string>
  store?: PromiseOr<HaetaeStore<D, E>>
  record?: PromiseOr<HaetaeRecord<D, E>>
}

export async function addRecord<D = unknown, E = unknown>({
  config = getConfig(),
  command = getCurrentCommand(),
  store = getStore(),
  record = formRecord({
    data: invokeRun({ command }),
    env: invokeEnv({ command }),
  }),
}: AddRecordOptions<D, E> = {}): Promise<HaetaeStore<D, E>> {
  return produce(await store, async (draft) => {
    /* eslint-disable @typescript-eslint/naming-convention, no-param-reassign */
    const _config = await config
    const _record = await record
    const _command = await command
    draft.version = pkg.version.value
    draft.commands = draft.commands || {}
    // Do NOT change the original array! (e.g. use `slice` instead of `splice`)
    // That's because the store object is memoized by shallow copy.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    draft.commands[_command] = [
      _record,
      ...(draft.commands[_command] || []).filter(
        (oldRecord) => !compareEnvs(_record.env, oldRecord.env),
      ),
    ].filter((r) => Date.now() - r.time < _config.recordRemoval.age)

    draft.commands[_command] = draft.commands[_command].slice(
      0,
      _config.recordRemoval.count,
    )

    /* eslint-enable @typescript-eslint/naming-convention,  no-param-reassign  */
    return draft
  })
}

export interface SaveStoreOptions {
  filename?: string
  store?: PromiseOr<HaetaeStore>
}

export async function saveStore({
  filename = getStoreFilename(),
  store = addRecord(),
}: SaveStoreOptions = {}): Promise<void> {
  fs.writeFileSync(
    await filename,
    `${JSON.stringify(await store, undefined, 2)}\n`, // trailing empty line
    {
      encoding: 'utf8',
    },
  )
  getStore.clear() // memoization cache clear
}

export interface DeleteStoreOptions {
  filename?: string
}

export async function deleteStore({
  filename = getStoreFilename(),
}: DeleteStoreOptions = {}): Promise<void> {
  fs.unlinkSync(await filename)
  getStore.clear() // memoization cache clear
}
