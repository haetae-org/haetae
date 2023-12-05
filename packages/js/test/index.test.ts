import upath from 'upath'
import { dirname } from 'dirname-filename-esm'
import * as utils from '@haetae/utils'
import { dependsOn, graph } from '../src/index.js'

// TODO: add tests for other various environments
const rootDir = upath.join(dirname(import.meta), '../../../test-project')

/*
  Actually, test for `graph()` is not so much necessary because the function `dependsOn()` relies on `graph()`.
  Test of `dependsOn()` also does transitive test of `graph()`.
 */
describe('graph', () => {
  test('basic usage', async () => {
    const result = await graph({
      entrypoint: 'packages/foo/src/index.ts',
      rootDir,
    })
    expect(result).toStrictEqual({
      [`${rootDir}/packages/foo/src/index.ts`]: new Set([
        `${rootDir}/packages/foo/src/hello.ts`,
      ]),
      [`${rootDir}/packages/foo/src/hello.ts`]: new Set([]),
    })
  })
  test('circular dependencies', async () => {
    const result = await graph({
      entrypoint: 'packages/bar/src/a.ts',
      rootDir,
    })
    expect(result).toStrictEqual({
      [`${rootDir}/packages/bar/src/a.ts`]: new Set([
        `${rootDir}/packages/bar/src/b.ts`,
      ]),
      [`${rootDir}/packages/bar/src/b.ts`]: new Set([
        `${rootDir}/packages/bar/src/c.ts`,
      ]),
      [`${rootDir}/packages/bar/src/c.ts`]: new Set([
        `${rootDir}/packages/bar/src/a.ts`,
      ]),
    })
  })
  // TODO: uncomment this test once `path mapping` is resolved by PR: https://github.com/dependents/node-dependency-tree/pull/138

  test('against test file', async () => {
    const result = await graph({
      entrypoint: 'packages/bar/test/unit/index.test.ts',
      rootDir,
    })
    expect(result).toStrictEqual({
      [`${rootDir}/packages/bar/test/unit/index.test.ts`]: new Set([
        `${rootDir}/packages/bar/src/index.ts`,
      ]),
      [`${rootDir}/packages/bar/src/index.ts`]: new Set([
        `${rootDir}/packages/foo/src/index.ts`,
      ]),
      [`${rootDir}/packages/foo/src/index.ts`]: new Set([
        `${rootDir}/packages/foo/src/hello.ts`,
      ]),
      [`${rootDir}/packages/foo/src/hello.ts`]: new Set([]),
    })
  })
  test('non-existent file', async () => {
    const result = await graph({
      entrypoint: 'packages/bar/src/non-existent.ts',
      rootDir,
    })
    expect(result).toStrictEqual({})
  })
})

describe('dependsOn', () => {
  // TODO: uncomment this test once `path mapping` is resolved by PR: https://github.com/dependents/node-dependency-tree/pull/138

  test('through typescript path mapping', async () => {
    await expect(
      dependsOn({
        rootDir,
        dependent: 'packages/bar/test/unit/index.test.ts',
        dependencies: ['packages/bar/src/index.ts'],
      }),
    ).resolves.toBe(true)
  })

  test('from a same package', async () => {
    await expect(
      dependsOn({
        rootDir,
        dependent: 'packages/foo/src/index.ts',
        dependencies: ['packages/foo/src/hello.ts'],
      }),
    ).resolves.toBe(true)

    await expect(
      /*
       * `foo/test/integration/index.test.ts` file does not use path mapping,
       * unlike `foo/test/unit/index.test.ts`.
       */
      dependsOn({
        rootDir,
        dependent: 'packages/foo/test/integration/index.test.ts',
        dependencies: ['packages/foo/src/hello.ts'],
      }),
    ).resolves.toBe(true)
  })

  test('from a different package', async () => {
    await expect(
      dependsOn({
        rootDir,
        dependent: 'packages/foo/src/index.ts',
        dependencies: ['packages/bar/src/index.ts'],
      }),
    ).resolves.toBe(false)

    await expect(
      dependsOn({
        rootDir,
        dependent: 'packages/bar/src/index.ts',
        dependencies: ['packages/foo/src/hello.ts'],
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        rootDir,
        dependent: 'packages/bar/test/unit/index.test.ts',
        dependencies: ['packages/foo/src/hello.ts'],
      }),
    ).resolves.toBe(true)
  })

  test('itself', async () => {
    await expect(
      dependsOn({
        rootDir,
        dependent: 'packages/bar/src/index.ts',
        dependencies: ['packages/bar/src/index.ts'],
      }),
    ).resolves.toBe(true)
  })

  test('from a non-existent path', async () => {
    await expect(
      dependsOn({
        rootDir,
        dependent: 'path/to/non-existent.ts',
        dependencies: ['packages/foo/src/hello.ts'],
      }),
    ).resolves.toBe(false)
  })

  test('circular dependencies', async () => {
    await expect(
      dependsOn({
        rootDir,
        dependent: 'packages/bar/src/a.ts',
        dependencies: ['packages/bar/src/c.ts'],
      }),
    ).resolves.toBe(true)
    await expect(
      dependsOn({
        rootDir,
        dependent: 'packages/bar/src/a.ts',
        dependencies: ['packages/bar/src/b.ts'],
      }),
    ).resolves.toBe(true)
  })

  test('with synthetic additional dependencies when glob is false', async () => {
    const additionalGraph = await utils.graph({
      rootDir,
      edges: [
        {
          dependents: ['a'],
          dependencies: ['b'],
        },
        {
          dependents: ['c'],
          dependencies: ['a'],
        },
        {
          dependents: ['f'],
          dependencies: ['another', 'another2'],
        },
      ],
      glob: false,
    })

    const dependencies = ['f', 'b']
    const options = {
      dependencies,
      rootDir,
      additionalGraph,
      glob: false,
    }

    await expect(
      dependsOn({
        dependent: 'a',
        ...options,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'c',
        ...options,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'e',
        ...options,
      }),
    ).resolves.toBe(false)

    await expect(
      dependsOn({
        dependent: 'f',
        ...options,
      }),
    ).resolves.toBe(true)
  })

  test('with existing additional dependencies when glob is true', async () => {
    const additionalGraph = await utils.graph({
      rootDir,
      edges: [
        {
          dependents: ['packages/*/src/i*.ts'],
          dependencies: ['packages/*/additional-dependency-dummy.txt'],
        },
      ],
    })

    const options = {
      rootDir,
      additionalGraph,
      glob: true,
    }

    await expect(
      dependsOn({
        dependent: 'packages/foo/src/index.ts',
        dependencies: ['packages/foo/src/hello.ts'],
        ...options,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'packages/foo/src/index.ts',
        dependencies: ['packages/foo/bar/index.ts'],
        ...options,
      }),
    ).resolves.toBe(false)

    await expect(
      dependsOn({
        dependent: 'packages/foo/src/index.ts',
        dependencies: ['path/to/non-existent.ts'],
        ...options,
      }),
    ).resolves.toBe(false)

    await expect(
      dependsOn({
        dependent: 'path/to/non-existent.ts',
        dependencies: ['packages/foo/src/index.ts'],
        ...options,
      }),
    ).resolves.toBe(false)

    await expect(
      dependsOn({
        dependent: 'packages/*/src/i*.ts',
        dependencies: ['packages/*/additional-dependency-dummy.txt'],
        ...options,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'packages/**/*.ts',
        dependencies: ['packages/**/*.txt'],
        ...options,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'packages/foo/src/index.ts',
        dependencies: ['packages/*/additional-dependency-dummy.txt'],
        ...options,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'packages/bar/src/index.ts',
        dependencies: ['packages/*/additional-dependency-dummy.txt'],
        ...options,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'packages/bar/src/inonexisting.ts',
        dependencies: ['packages/*/additional-dependency-dummy.txt'],
        ...options,
      }),
    ).resolves.toBe(false)

    await expect(
      dependsOn({
        dependent: 'packages/*/src/i*.ts',
        dependencies: ['packages/foo/additional-dependency-dummy.txt'],
        ...options,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'packages/*/src/i*.ts',
        dependencies: ['packages/bar/additional-dependency-dummy.txt'],
        ...options,
      }),
    ).resolves.toBe(true)
    await expect(
      dependsOn({
        dependent: 'packages/foo/src/index.ts',
        dependencies: ['packages/foo/additional-dependency-dummy.txt'],
        ...options,
      }),
    ).resolves.toBe(true)
    await expect(
      dependsOn({
        dependent: 'packages/foo/src/index.ts',
        dependencies: ['packages/bar/additional-dependency-dummy.txt'],
        ...options,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'packages/bar/src/index.ts',
        dependencies: ['packages/foo/additional-dependency-dummy.txt'],
        ...options,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'packages/bar/src/index.ts',
        dependencies: ['packages/bar/additional-dependency-dummy.txt'],
        ...options,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'packages/bar/src/index.ts',
        dependencies: ['packages/*/additional-dependency-dummy.txt'],
        ...options,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'packages/*/src/*.ts',
        dependencies: ['path/to/non-existent.ts'],
        ...options,
      }),
    ).resolves.toBe(false)
  })
})
