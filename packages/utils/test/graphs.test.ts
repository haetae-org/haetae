import { graph, dependsOn, mergeGraphs, deps } from '../src/graphs.js'

describe('graph', () => {
  test('basic usage', async () => {
    const result = await graph({
      rootDir: '/<rootDir>',
      edges: [
        {
          dependents: ['path/to/a.ts'],
          dependencies: ['path/to/b.ts', 'path/to/c.ts'],
        },
      ],
      glob: false,
    })

    expect(result).toStrictEqual({
      '/<rootDir>/path/to/a.ts': new Set([
        '/<rootDir>/path/to/b.ts',
        '/<rootDir>/path/to/c.ts',
      ]),
      '/<rootDir>/path/to/b.ts': new Set([]),
      '/<rootDir>/path/to/c.ts': new Set([]),
    })
  })

  // Testing this is to check if infinite loop is prevented
  test('circular dependency', async () => {
    const result = await graph({
      rootDir: '/',
      edges: [
        {
          dependents: ['a'],
          dependencies: ['b'],
        },
        {
          dependents: ['b'],
          dependencies: ['c'],
        },
        {
          dependents: ['c'],
          dependencies: ['a'],
        },
      ],
      glob: false,
    })

    expect(result).toStrictEqual({
      '/a': new Set(['/b']),
      '/b': new Set(['/c']),
      '/c': new Set(['/a']),
    })
  })

  test('advanced usage', async () => {
    const result = await graph({
      rootDir: '/<rootDir>',
      edges: [
        {
          dependents: ['path/to/a.ts', 'path/to/b.ts'],
          dependencies: ['path/to/c.ts', 'path/to/d.ts', 'path/to/e.ts'],
        },
        {
          dependents: ['path/to/b.ts', 'path/to/c.ts'],
          dependencies: ['path/to/f.ts', 'path/to/g.ts'],
        },
      ],
      glob: false,
    })
    expect(result).toStrictEqual({
      '/<rootDir>/path/to/a.ts': new Set([
        '/<rootDir>/path/to/c.ts',
        '/<rootDir>/path/to/d.ts',
        '/<rootDir>/path/to/e.ts',
      ]),
      '/<rootDir>/path/to/b.ts': new Set([
        '/<rootDir>/path/to/c.ts',
        '/<rootDir>/path/to/d.ts',
        '/<rootDir>/path/to/e.ts',
        '/<rootDir>/path/to/f.ts',
        '/<rootDir>/path/to/g.ts',
      ]),
      '/<rootDir>/path/to/c.ts': new Set([
        '/<rootDir>/path/to/f.ts',
        '/<rootDir>/path/to/g.ts',
      ]),
      '/<rootDir>/path/to/d.ts': new Set([]),
      '/<rootDir>/path/to/e.ts': new Set([]),
      '/<rootDir>/path/to/f.ts': new Set([]),
      '/<rootDir>/path/to/g.ts': new Set([]),
    })
  })
})

describe('mergeGraphs', () => {
  test('basic usage', async () => {
    const result1 = await graph({
      rootDir: '/',
      edges: [
        {
          dependents: ['a', 'b'],
          dependencies: ['c', 'd', 'e'],
        },
      ],
      glob: false,
    })
    const result2 = await graph({
      rootDir: '/',
      edges: [
        {
          dependents: ['a'],
          dependencies: ['e', 'f'],
        },
      ],
      glob: false,
    })
    const result3 = await graph({
      rootDir: '/',
      edges: [
        {
          dependents: ['b'],
          dependencies: ['a', 'f'],
        },
      ],
      glob: false,
    })
    expect(mergeGraphs([result1, result2, result3])).toStrictEqual({
      '/a': new Set(['/c', '/d', '/e', '/f']),
      '/b': new Set(['/c', '/d', '/e', '/a', '/f']),
      '/c': new Set([]),
      '/d': new Set([]),
      '/f': new Set([]),
      '/e': new Set([]),
    })
  })
})

describe('deps', () => {
  // Promise
  const depsGraph = graph({
    rootDir: '/',
    edges: [
      {
        dependents: ['x', 'y'],
        dependencies: ['a', 'e'],
      },
      {
        dependents: ['a'],
        dependencies: ['b', 'c'],
      },
      {
        dependents: ['b'],
        dependencies: ['d'],
      },
      {
        dependents: ['d', 'e'],
        dependencies: ['f'],
      },
      {
        dependents: ['c', 'g'],
        dependencies: ['e', 'f'],
      },
      {
        dependents: ['h'],
        dependencies: ['i'],
      },
    ],
    glob: false,
  })
  test('basic usage', async () => {
    expect(
      deps({
        entrypoint: 'a',
        graph: await depsGraph,
        rootDir: '/',
      }),
    ).toStrictEqual(['/a', '/b', '/c', '/d', '/e', '/f'])
  })
})

describe('dependsOn', () => {
  // Promise
  const depsGraph = graph({
    rootDir: '/<rootDir>',
    edges: [
      {
        dependents: ['a'],
        dependencies: ['b', 'c'],
      },
      {
        dependents: ['c'],
        dependencies: ['d'],
      },
      {
        dependents: ['d', 'e'],
        dependencies: ['f'],
      },
      {
        dependents: ['g', 'h'],
        dependencies: ['h', 'g'],
      },
      {
        dependents: ['i'],
        dependencies: ['j'],
      },
      {
        dependents: ['j'],
        dependencies: ['k'],
      },
      {
        dependents: ['k'],
        dependencies: ['i'],
      },
    ],
    glob: false,
  })

  const options = (async () => ({
    graph: await depsGraph,
    rootDir: '/<rootDir>',
  }))()

  test('direct dependency', async () => {
    await expect(
      dependsOn({
        dependent: 'a',
        dependencies: ['c'],
        ...(await options),
        glob: false,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'a',
        dependencies: ['c'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: '*',
        dependencies: ['*'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'a',
        dependencies: ['*'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'c',
        dependencies: ['*'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(true)
  })

  test('transitive dependency', async () => {
    await expect(
      dependsOn({
        dependent: 'a',
        dependencies: ['x', 'f'],
        ...(await options),
        glob: false,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'a',
        dependencies: ['x', 'f'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: '{a,}',
        dependencies: ['{x,f}'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: '{a,}',
        dependencies: ['x', 'f'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'a',
        dependencies: ['{x,f}'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(true)
  })

  test('non-existent dependency', async () => {
    await expect(
      dependsOn({
        dependent: 'a',
        dependencies: ['non-existent'],
        ...(await options),
        glob: false,
      }),
    ).resolves.toBe(false)

    await expect(
      dependsOn({
        dependent: 'a',
        dependencies: ['non-existent'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(false)

    await expect(
      dependsOn({
        dependent: '*',
        dependencies: ['non-existent'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(false)
  })

  test('non-existent dependent', async () => {
    await expect(
      dependsOn({
        dependent: 'non-existent',
        dependencies: ['c'],
        ...(await options),
        glob: false,
      }),
    ).resolves.toBe(false)
    await expect(
      dependsOn({
        dependent: 'non-existent',
        dependencies: ['c'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(false)

    await expect(
      dependsOn({
        dependent: 'non-existent',
        dependencies: ['*'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(false)
  })

  test('circular dependency', async () => {
    await expect(
      dependsOn({
        dependent: 'g',
        dependencies: ['h'],
        ...(await options),
        glob: false,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'g',
        dependencies: ['h'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'i',
        dependencies: ['k'],
        ...(await options),
        glob: false,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'i',
        dependencies: ['k'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'k',
        dependencies: ['j'],
        ...(await options),
        glob: false,
      }),
    ).resolves.toBe(true)

    await expect(
      dependsOn({
        dependent: 'k',
        dependencies: ['j'],
        ...(await options),
        glob: true,
      }),
    ).resolves.toBe(true)
  })
})
