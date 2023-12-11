/* eslint-disable import/no-extraneous-dependencies */
import semver from 'semver'
import { configure, $, git, js, utils, pkg } from 'haetae'

export default configure({
  commands: {
    myTest: {
      env: {
        NODE_ENV: process.env.NODE_ENV,
        jestConfig: await utils.hash(['../../jest.config.js']),
        jest: await js.majorVersion('jest'),
        branch: await git.branch(),
        os: process.platform,
        node: semver.major(process.version),
        haetae: pkg.version.major,
      },
      run: async () => {
        // An array of changed files
        const changedFiles = await git.changedFiles()
        // An array of test files that (transitively) depend on changed files
        const affectedTestFiles = await js.dependOn({
          dependents: ['**/*.test.js'], // glob pattern
          dependencies: changedFiles,
        })

        if (affectedTestFiles.length > 0) {
          // Equals to "pnpm jest /path/to/foo.test.ts /path/to/bar.test.ts ..."
          // Change 'pnpm jest' to your test runner.
          await $`pnpm jest ${affectedTestFiles}`
        }
      },
    },
  },
})
