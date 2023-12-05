import { toAbsolutePath } from '@haetae/common'
import * as core from '@haetae/core'
import isEqual from 'lodash.isequal'
import multimatch from 'multimatch'
import filterAsync from 'node-filter-async'
import upath from 'upath'
import { glob } from './utils.js'

// eslint-disable-next-line @typescript-eslint/naming-convention
const _glob = glob

export interface DepsEdge {
  dependents: readonly string[]
  dependencies: readonly string[]
}

export interface GraphOptions {
  edges: readonly DepsEdge[]
  rootDir?: string
  glob?: boolean
}

export interface DepsGraph {
  [dependent: string]: Set<string> // dependencies[]
}

export async function graph({
  edges,
  rootDir = core.getConfigDirname(),
  glob = true,
}: GraphOptions): Promise<DepsGraph> {
  // eslint-disable-next-line no-param-reassign
  rootDir = toAbsolutePath({ path: rootDir, rootDir: core.getConfigDirname })
  const depsGraph: DepsGraph = {}

  for (let { dependents, dependencies } of edges) {
    if (glob) {
      dependents = await _glob(dependents, {
        rootDir,
      })
      dependencies = await _glob(dependencies, {
        rootDir,
      })
    } else {
      dependents = dependents.map((dep) => upath.resolve(rootDir, dep))
      dependencies = dependencies.map((dep) => upath.resolve(rootDir, dep))
    }

    for (const dependent of dependents) {
      depsGraph[dependent] = depsGraph[dependent] || new Set<string>()
      for (const dependency of dependencies) {
        depsGraph[dependency] = depsGraph[dependency] || new Set<string>()
        if (dependent !== dependency) {
          depsGraph[dependent].add(dependency)
        }
      }
    }
  }
  return depsGraph
}

export function mergeGraphs(graphs: DepsGraph[]): DepsGraph {
  const result: DepsGraph = {}
  for (const graph of graphs) {
    for (const [dependent, directDeps] of Object.entries(graph)) {
      result[dependent] = result[dependent] || new Set()
      for (const dep of directDeps) {
        result[dependent].add(dep)
      }
    }
  }
  return result
}

export interface DependsOnOptions {
  dependent: string
  dependencies: readonly string[]
  graph: DepsGraph
  rootDir?: string
  glob?: boolean
}

export async function dependsOn({
  dependent,
  dependencies,
  graph, // MUST be a graph of absolute paths
  rootDir = core.getConfigDirname(),
  glob = true,
}: DependsOnOptions): Promise<boolean> {
  /* eslint-disable no-param-reassign */
  rootDir = toAbsolutePath({ path: rootDir, rootDir: core.getConfigDirname })
  dependent = upath.resolve(rootDir, dependent)
  dependencies = [...dependencies].map((dep) => upath.resolve(rootDir, dep))
  /* eslint-enable no-param-reassign */

  const depsQueue = []
  if (glob) {
    depsQueue.push(...multimatch(Object.keys(graph), [dependent]))
  } else {
    depsQueue.push(dependent)
  }

  /*
   * To avoid infinite loop by circular dependencies,
   * `depsQueue` stores dependencies of dependencies.. and so on,
   * until either the loop ends or the function finds the matching dependency.
   */
  const checkedDeps = new Set<string>()
  for (const dependency of depsQueue) {
    if (!checkedDeps.has(dependency)) {
      checkedDeps.add(dependency)
      depsQueue.push(...(graph[dependency] || []))
      if (glob) {
        if (isEqual([dependency], multimatch([dependency], dependencies))) {
          return true
        }
      } else if (dependencies.includes(dependency)) {
        return true
      }
    }
  }
  return false
}

export interface DependOnOptions {
  dependents: readonly string[]
  dependencies: readonly string[]
  graph: DepsGraph
  rootDir?: string
  glob?: boolean
}

export async function dependOn({
  dependents,
  dependencies,
  graph,
  rootDir,
  glob,
}: DependOnOptions): Promise<string[]> {
  return filterAsync(dependents, (dependent) =>
    dependsOn({
      dependent,
      dependencies,
      graph,
      rootDir,
      glob,
    }),
  )
}

export interface DepsOptions {
  entrypoint: string
  graph: DepsGraph
  rootDir?: string
}

export function deps({
  entrypoint,
  graph,
  rootDir = core.getConfigDirname(),
}: DepsOptions): string[] {
  /* eslint-disable no-param-reassign */
  rootDir = toAbsolutePath({ path: rootDir, rootDir: core.getConfigDirname })
  entrypoint = upath.resolve(rootDir, entrypoint)
  /* eslint-enable no-param-reassign */

  const checkedDeps = new Set<string>() // To avoid infinite loop by circular dependencies.
  // `depsQueue` stores dependencies of dependencies.. and so on.
  const depsQueue = [entrypoint] // Preserving dependency order (breadth-first search)
  for (const dependency of depsQueue) {
    if (!checkedDeps.has(dependency)) {
      checkedDeps.add(dependency)
      depsQueue.push(...(graph[dependency] || []))
    }
  }
  checkedDeps.clear()
  // Remove duplicates while preserving order
  return depsQueue.filter((dep) => {
    if (checkedDeps.has(dep)) {
      return false
    }
    checkedDeps.add(dep)
    return true
  })
}
