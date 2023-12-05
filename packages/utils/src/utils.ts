import { PromiseOr, toAbsolutePath } from '@haetae/common'
import * as core from '@haetae/core'
import { globby, Options as GlobbyOptions } from 'globby'
import hasha from 'hasha'
import upath from 'upath'
import { $ as $$ } from 'execa'

export interface GlobOptions extends Omit<GlobbyOptions, 'cwd'> {
  rootDir?: string // A facade option for `globbyOptions.cwd`
}

export async function glob(
  patterns: readonly string[],
  { rootDir = core.getConfigDirname(), ...options }: GlobOptions = {},
): Promise<string[]> {
  // eslint-disable-next-line no-param-reassign
  rootDir = toAbsolutePath({ path: rootDir, rootDir: core.getConfigDirname })
  // Why `walkUpCountMax` is needed? REF: https://github.com/sindresorhus/globby/issues/168
  const walkUpCountMax = { value: 0 }
  // eslint-disable-next-line no-param-reassign
  patterns = patterns
    .map((p) => upath.normalizeSafe(p))
    .map((p) => {
      const walkUpCount =
        (p.match(/^\.{2}\//g) || []).length + // starts with '../'
        (p.match(/\/\.{2}\//g) || []).length // '/../'
      if (walkUpCountMax.value < walkUpCount) {
        walkUpCountMax.value = walkUpCount
      }
      return upath.resolve(rootDir, p)
    })

  const res = await globby(patterns, {
    cwd: upath.resolve(rootDir, '../'.repeat(walkUpCountMax.value)),
    ...options,
  })
  return [...new Set(res.map((f) => upath.resolve(rootDir, f)))]
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const _glob = glob

export interface HashOptions {
  algorithm?: hasha.AlgorithmName // "md5" | "sha1" | "sha256" | "sha512"
  rootDir?: string
  glob?: boolean
}

// TODO: glob patterns and directories
export async function hash(
  files: readonly string[],
  {
    algorithm = 'sha256',
    rootDir = core.getConfigDirname(),
    glob = true,
  }: HashOptions = {},
): Promise<string> {
  // eslint-disable-next-line no-param-reassign
  rootDir = toAbsolutePath({ path: rootDir, rootDir: core.getConfigDirname })
  if (glob) {
    // eslint-disable-next-line no-param-reassign
    files = await _glob(files, { rootDir })
  }
  const hashes = await Promise.all(
    [...files] // Why copy by destructing the array? => To avoid modifying the original array when `sort()`.
      .sort()
      .map((file) => upath.resolve(rootDir, file))
      .map((file) => hasha.fromFile(file, { algorithm })),
  )
  return hasha.async(hashes.join('\n'), { algorithm })
}

export const $ = $$({
  stdio: 'inherit',
  cwd: (() => {
    try {
      return core.getConfigDirname()
    } catch {
      return process.cwd()
    }
  })(),
})
