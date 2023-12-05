import { configure, $, git, js, utils } from 'haetae'

export default configure({
  commands: {
    test: {
      run: async () => {
        // An array of changed files
        const changedFiles = await git.changedFiles()
        // console.log(changedFiles)
        // An array of test files that (transitively) depend on changed files
        const affectedTestFiles = await js.dependOn({
          dependents: ['**/*.test.js'], // glob pattern
          // dependents: await utils.glob(['**/*.test.js']), // glob pattern
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
