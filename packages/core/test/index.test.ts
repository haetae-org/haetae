import assert, { AssertionError } from 'assert/strict'
import { dirname } from 'dirname-filename-esm'
import {
  configure,
  setConfigFilename,
  localStore,
  createRecord,
  invokeEnv,
  invokeRun,
  invokeRootEnv,
  invokeRootRecordData,
} from '../src/index.js'

describe('localStore()', () => {
  test('when filename does not end with .json', () => {
    const store = localStore({ filename: '/path/to' })
    expect(store.localStore.filename).toBe('/path/to/store.json')
  })
  test('when filename ends with .json', () => {
    const store = localStore({ filename: '/path/to/store.json' })
    expect(store.localStore.filename).toBe('/path/to/store.json')
  })
  describe('when recordRemoval is given', () => {
    test('as undefined', () => {
      const store = localStore({ filename: '.' })
      expect(store.localStore.recordRemoval.age).toBe(Number.POSITIVE_INFINITY)
      expect(store.localStore.recordRemoval.count).toBe(
        Number.POSITIVE_INFINITY,
      )
    })
    test('without age', () => {
      const store = localStore({ filename: '.', recordRemoval: { count: 10 } })
      expect(store.localStore.recordRemoval.age).toBe(Number.POSITIVE_INFINITY)
      expect(store.localStore.recordRemoval.count).toBe(10)
    })
    test('without count', () => {
      const store = localStore({
        filename: '.',
        recordRemoval: { age: 60 * 60 * 24 * 30 },
      })
      expect(store.localStore.recordRemoval.age).toBe(60 * 60 * 24 * 30)
      expect(store.localStore.recordRemoval.count).toBe(
        Number.POSITIVE_INFINITY,
      )
    })
    test('with age and count', () => {
      const store = localStore({
        filename: '.',
        recordRemoval: { age: 60 * 60 * 24 * 30, count: 10 },
      })
      expect(store.localStore.recordRemoval.age).toBe(60 * 60 * 24 * 30)
      expect(store.localStore.recordRemoval.count).toBe(10)
    })
    test('with negative age or count', () => {
      expect(() =>
        localStore({
          filename: '.',
          recordRemoval: { age: -1 },
        }),
      ).toThrow(AssertionError)
      expect(() =>
        localStore({
          filename: '.',
          recordRemoval: { count: -1 },
        }),
      ).toThrow(AssertionError)
    })
    test('with zero age or count', () => {
      expect(() =>
        localStore({
          filename: '.',
          recordRemoval: { count: 0, age: 0 },
        }),
      ).not.toThrow(AssertionError)
    })
  })
})

describe('configure(), invoke*(), createRecord()', () => {
  // eslint-disable-next-line jest/require-hook
  setConfigFilename({
    filename: 'haetae.config.js',
    cwd: dirname(import.meta),
    checkExistence: false,
  })
  const store = localStore()
  const config = configure({
    env: (env, { store }) => {
      assert(['foo', 'bar'].includes(env.envKey as string))
      expect(store.hello).toBe('world')
      return {
        ...env,
        rootEnv: true,
      }
    },
    recordData: (data, { env, store }) => {
      expect(env.rootEnv).toBe(true)
      expect(['foo', 'bar']).toContain(env.envKey as string)
      expect(['foo', 'bar']).toContain(data.dataKey as string)
      expect(store.hello).toBe('world')
      return {
        ...data,
        ...env,
        rootRecordData: true,
      }
    },
    commands: {
      foo: {
        env: {
          envKey: 'foo',
        },
        run: async ({ env, store }) => {
          expect(env).toStrictEqual({ envKey: 'foo' })
          expect(store.hello).toBe('world')
          return { dataKey: 'foo' }
        },
      },
      bar: {
        env: async ({ store }) => {
          expect(store.hello).toBe('world')
          return {
            envKey: 'bar',
          }
        },
        run: ({ env, store }) => {
          expect(env).toStrictEqual({ envKey: 'bar' })
          expect(store.hello).toBe('world')
          return { dataKey: 'bar' }
        },
      },
    },
    store: {
      ...store,
      hello: 'world',
    },
  })
  test('when `env` is given as an object', async () => {
    await expect(
      invokeEnv({
        command: 'foo',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config,
      }),
    ).resolves.toStrictEqual({
      envKey: 'foo',
    })
  })
  test('when `env` is given as a function', async () => {
    await expect(
      invokeEnv({
        command: 'bar',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config,
      }),
    ).resolves.toStrictEqual({
      envKey: 'bar',
    })
  })
  test('when `run` is given as an async function', async () => {
    await expect(
      invokeRun({
        command: 'foo',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config,
      }),
    ).resolves.toStrictEqual({ dataKey: 'foo' })
  })
  test('when `run` is given as a synchrounous function', async () => {
    await expect(
      invokeRun({
        command: 'bar',
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config,
      }),
    ).resolves.toStrictEqual({ dataKey: 'bar' })
  })
  // eslint-disable-next-line jest/prefer-lowercase-title
  test('invokeRootEnv()', async () => {
    await expect(
      invokeRootEnv({
        env: { envKey: 'foo' },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config,
      }),
    ).resolves.toStrictEqual({ envKey: 'foo', rootEnv: true })
  })
  // eslint-disable-next-line jest/prefer-lowercase-title
  test('invokeRootRecordData()', async () => {
    await expect(
      invokeRootRecordData({
        env: { envKey: 'foo', rootEnv: true },
        recordData: { dataKey: 'foo' },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config,
      }),
    ).resolves.toStrictEqual({
      envKey: 'foo',
      dataKey: 'foo',
      rootRecordData: true,
      rootEnv: true,
    })
  })
  test('createRecord()', async () => {
    await expect(
      createRecord({
        env: { envKey: 'foo', rootEnv: true },
        recordData: { dataKey: 'foo' },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config,
      }),
    ).resolves.toStrictEqual({
      envKey: 'foo',
      dataKey: 'foo',
      rootRecordData: true,
      rootEnv: true,
    })
  })
})
