import fs from 'node:fs/promises'
import upath from 'upath'
import dependencyTree from '@jjangga0214/dependency-tree'
import { dirname } from 'dirname-filename-esm'
import filterAsync from 'node-filter-async'
import { findUp } from 'find-up'
import { parsePkg, toAbsolutePath } from '@haetae/common'
import * as core from '@haetae/core'
import * as utils from '@haetae/utils'

export {
  version,
  majorVersion,
  untilMinorVersion,
  untilPatchVersion,
  fullVersion,
} from './version.js'
export type { VersionOptions } from './version.js' // We should separate type export to avoid swc's complaining

export const pkg = parsePkg({
  name: '@haetae/javascript',
  rootDir: dirname(import.meta),
})

async function resolveEcosystemConfig(
  file: string | undefined,
  defaultFiles: string[],
  rootDir: string,
): Promise<string | undefined> {
  if (file) {
    try {
      await fs.access(file)
      return file
    } catch {
      throw new Error(`file not found: ${file}`)
    }
  } else {
    const founds = await Promise.all(
      defaultFiles.map((defaultFile) =>
        findUp(defaultFile, {
          cwd: rootDir,
        }),
      ),
    )
    for (const found of founds) {
      if (found) {
        return found
      }
    }
  }
}

interface GraphOptions {
  entrypoint: string
  tsConfig?: string
  webpackConfig?: string
  skipNodeModules?: boolean
  rootDir?: string
}

// Why async even though it doesn't use any async operation?
// That's to prevent breaking change from sync to async in the future.
export async function graph({
  entrypoint,
  tsConfig,
  webpackConfig,
  skipNodeModules = true,
  rootDir = core.getConfigDirname(),
}: GraphOptions): Promise<utils.DepsGraph> {
  /* eslint-disable no-param-reassign */
  rootDir = toAbsolutePath({ path: rootDir, rootDir: core.getConfigDirname })
  tsConfig = await resolveEcosystemConfig(tsConfig, ['tsconfig.json'], rootDir)
  webpackConfig = await resolveEcosystemConfig(
    webpackConfig,
    [
      'webpack.config.js',
      'webpack.config.mjs',
      'webpack.config.cjs',
      // 'webpack.config.ts', TODO: support webpack.config.ts
      // 'webpack.config.mts',
      // 'webpack.config.cts',
    ],
    rootDir,
  )
  /* eslint-enable no-param-reassign */

  const baseTree = dependencyTree({
    // All absolute paths by default
    directory: rootDir,
    filename: upath.resolve(rootDir, entrypoint),
    tsConfig,
    webpackConfig,
    filter: (file) =>
      skipNodeModules ? !file.includes('/node_modules/') : true,
  })
  const queue: dependencyTree.Tree[] = [baseTree]
  const rawGraph: Record<string, string[]> = {}
  for (const tree of queue) {
    for (const [dependent, subTree] of Object.entries(tree)) {
      // If not already visited
      if (!rawGraph[dependent]) {
        rawGraph[dependent] = Object.keys(subTree)
        queue.push(subTree)
      }
    }
  }
  const result: Record<string, Set<string>> = {}
  for (const [dependent, directDependencies] of Object.entries(rawGraph)) {
    result[dependent] = new Set(directDependencies)
  }
  return result
}

export interface DepsOptions {
  entrypoint: string
  tsConfig?: string
  webpackConfig?: string
  skipNodeModules?: boolean
  rootDir?: string
  additionalGraph?: utils.DepsGraph
}

export async function deps({
  entrypoint,
  tsConfig,
  webpackConfig,
  skipNodeModules,
  rootDir = core.getConfigDirname(),
  additionalGraph,
}: DepsOptions): Promise<string[]> {
  /* eslint-disable no-param-reassign */
  entrypoint = upath.resolve(rootDir, entrypoint)
  additionalGraph =
    additionalGraph || (await utils.graph({ edges: [], rootDir }))
  /* eslint-enable no-param-reassign */

  const jsGraph = await graph({
    entrypoint,
    tsConfig,
    webpackConfig,
    skipNodeModules,
    rootDir,
  })
  const mergedGraph = utils.mergeGraphs([jsGraph, additionalGraph])

  return utils.deps({ entrypoint, graph: mergedGraph, rootDir })
}

export interface DependsOnOptions {
  dependent: string
  dependencies: readonly string[]
  tsConfig?: string
  webpackConfig?: string
  skipNodeModules?: boolean
  rootDir?: string
  additionalGraph?: utils.DepsGraph
  glob?: boolean
}

export async function dependsOn({
  dependent,
  dependencies,
  tsConfig, // TODO: automatic default tsconfig.json resolution by find-up
  webpackConfig,
  skipNodeModules,
  rootDir = core.getConfigDirname(),
  additionalGraph, // MUST be a graph of absolute paths
  glob = true,
}: DependsOnOptions): Promise<boolean> {
  // eslint-disable-next-line no-param-reassign
  additionalGraph =
    additionalGraph || (await utils.graph({ edges: [], rootDir }))

  const dependents = []
  if (glob) {
    dependents.push(...(await utils.glob([dependent], { rootDir })))
  } else {
    dependents.push(dependent)
  }

  for (const d of dependents) {
    const jsGraph = await graph({
      entrypoint: d,
      rootDir,
      tsConfig,
      webpackConfig,
      skipNodeModules,
    })
    const mergedGraph = utils.mergeGraphs([jsGraph, additionalGraph])

    const res = await utils.dependsOn({
      dependent: d,
      dependencies,
      graph: mergedGraph,
      rootDir,
      glob,
    })
    if (res) {
      return true
    }
  }
  return false
}

export interface DependOnOptions {
  dependents: readonly string[]
  dependencies: readonly string[]
  tsConfig?: string
  webpackConfig?: string
  skipNodeModules?: boolean
  rootDir?: string
  additionalGraph?: utils.DepsGraph
  glob?: boolean
}

export async function dependOn({
  dependents,
  dependencies,
  rootDir = core.getConfigDirname(),
  glob = true,
  ...options
}: DependOnOptions): Promise<string[]> {
  /* eslint-disable no-param-reassign */
  if (glob) {
    dependents = await utils.glob(dependents, {
      rootDir,
    })
    dependencies = await utils.glob(dependencies, {
      rootDir,
    })
  }
  /* eslint-enable no-param-reassign */

  return filterAsync(dependents, (dependent) =>
    dependsOn({
      dependent,
      dependencies,
      rootDir,
      glob: false,
      ...options,
    }),
  )
}
