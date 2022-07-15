import path from 'path'
import fs from 'fs'
import {
  getConfigDirname,
  getRecord,
  HaetaeRecord,
  HaetaePreRecord,
} from '@haetae/core'
import { glob, exec } from '@haetae/utils'

// todo: git submodule test

export const { name: packageName, version: packageVersion } = (() => {
  const content = fs.readFileSync(
    path.join(__dirname, '..', 'package.json'),
    'utf8',
  )
  return JSON.parse(content)
})()

export type GitPatchedHaetaeRecord = HaetaeRecord & {
  [name: string]: { commit: string }
}

/**
 * Check if git is installed on the system.
 */
export async function isInstalled({ rootDir = getConfigDirname() } = {}) {
  try {
    await exec('git --version', {
      cwd: rootDir,
    })
    return true
  } catch {
    return false
  }
}

/**
 * Check if this is a git repository.
 */
export async function isInitialized({ rootDir = getConfigDirname() } = {}) {
  try {
    const res = await exec('git rev-parse --is-inside-work-tree', {
      cwd: rootDir,
    })
    return res.trim() === 'true'
  } catch {
    return false
  }
}

export interface RecordOptions {
  commit?: string | Promise<string | undefined | null | void>
}

export async function record({
  commit = process.env.HAETAE_GIT_GITSHA ||
    exec('git rev-parse --verify HEAD', { cwd: getConfigDirname() })
      .then((res) => res.trim())
      .catch(() => {}),
}: RecordOptions): Promise<HaetaePreRecord> {
  if (!(await commit)) {
    throw new Error('Cannot get commit ID of HEAD.')
  }
  return {
    [packageName]: {
      commit,
    },
  }
}

export interface ChangedFilesOptions extends RecordOptions {
  rootDir?: string
  includeUntracked?: boolean
  includeIgnored?: boolean
  fallback?: () => string[] | Promise<string[]> | never
}

/**
 * @returns
 *   - an array of changed filename.
 *   - an empth array if no change was made
 *   - every filenames if `commit` is not given
 * @memoized
 */
export const changedFiles = async ({
  commit = process.env.HAETAE_GIT_COMMIT ||
    getRecord().then(
      (r) => ((r as GitPatchedHaetaeRecord) || {})[packageName]?.commit,
    ),
  rootDir = getConfigDirname(),
  includeUntracked = true,
  includeIgnored = false,
  fallback = () =>
    // list of every files when commit ID is not given or cannot be found on record
    glob(['**'], {
      rootDir,
    }),
}: ChangedFilesOptions = {}): Promise<string[]> => {
  if (!(await isInstalled())) {
    throw new Error('git is not installed on the system, or $PATH is not set.')
  }
  if (!(await isInitialized())) {
    throw new Error('git is not initialized. This is not a git repository.')
  }

  // When there is no record,
  // or the record does not have commit
  if (!(await commit)) {
    return fallback()
  }

  const res = (
    await exec(`git diff --name-only ${commit}`, {
      cwd: rootDir,
    })
  )
    .trim()
    .split('\n')

  if (includeUntracked) {
    // untracked changes
    res.push(
      ...(
        await exec(
          `git ls-files --others${includeIgnored ? '' : ' --exclude-standard'}`,
          {
            cwd: rootDir,
          },
        )
      )
        .trim()
        .split('\n'),
    )
  }

  return res.map((filename) => path.join(rootDir, filename))
}

export interface BranchOptions {
  rootDir?: string
}

export async function branch({
  rootDir = getConfigDirname(),
}: BranchOptions = {}) {
  const res = await exec('git branch --show-current', {
    cwd: rootDir,
  })
  return res.trim()
}
