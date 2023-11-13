#!/usr/bin/env node
import assert from 'node:assert/strict'
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import signale from 'signale'
import chalk from 'chalk'
import clipboard from 'clipboardy'
import stripAnsi from 'strip-ansi'
import { dirname } from 'dirname-filename-esm'
import * as core from '@haetae/core'
import { parsePkg } from '@haetae/common'
import { getInfo } from './info.js'
import * as ui from './ui.js'

export const pkg = parsePkg({
  name: '@haetae/cli',
  rootDir: dirname(import.meta),
})

export async function run(): Promise<void> {
  let y
  try {
    y = await yargs(hideBin(process.argv))
      .version(pkg.version.value)
      .scriptName('haetae')
      .usage('$0 [options] <command>')
      .alias('h', 'help')
      .alias('v', 'version')
      .options({
        c: {
          alias: 'config',
          type: 'string',
          description: `Config file path. Default to an environment variable $HAETAE_CONFIG_FILE or finding one of ${core.defaultConfigFiles.join(
            ', ',
          )} by walking up parent directories.`,
        },
        r: {
          alias: 'record',
          type: 'boolean',
          description: 'All/partial Record(s)',
        },
        d: {
          alias: 'record-data',
          type: 'boolean',
          description: 'All/partial Record(s) data',
        },
        e: {
          alias: 'env',
          type: 'boolean',
          description: 'Current environment',
        },
        i: {
          alias: 'info',
          type: 'boolean',
          description: 'System, binary, dependencies information',
        },
        j: {
          alias: 'json',
          type: 'boolean',
          description: 'Print output in JSON format (for programmatic use)',
        },
        s: {
          alias: 'silent',
          type: 'boolean',
          description: 'Whether to print stdout',
        },
        'dry-run': {
          type: 'boolean',
          description: 'Skip storing record, but print the result',
        },
      })
      .conflicts('r', 'd')
      .conflicts('r ', 'e')
      .conflicts('r', 's')
      .conflicts('r', 'dry-run')
      .conflicts('d', 'e')
      .conflicts('d', 's')
      .conflicts('d', 'dry-run')
      .conflicts('e', 'dry-run')
      .conflicts('i', 'c')
      .conflicts('i', 'r')
      .conflicts('i', 'd')
      .conflicts('i', 'e')
      .conflicts('i', 's')
      .conflicts('i', 'dry-run')
      .conflicts('s', 'dry-run')
      .example([
        [
          `$0 -c ./${core.defaultConfigFiles[0]} <...>`,
          'Specify config file path.',
        ],
        [
          '$0 <command>',
          'Run the given command and save the new record to store file',
        ],
        ['$0 -r', 'Show all content of the store file'],
        ['$0 -r <command>', 'Show all records of the given command'],
        ['$0 -d <command>', 'Show all records data of the given command'],
        ['$0 -e <command>', 'Show current env of the given command'],
        [
          '$0 -r -e <command>',
          'Show a Record of current env of the given command',
        ],
        [
          '$0 -d -e <command>',
          'Show a Record Data of current env of the given command',
        ],
        [
          '$0 -i',
          'Show your system, binary, dependencies information needed for reporting an issue on GitHub repository',
        ],
      ])

    // `y` should be instantiated for type check. Do NOT create `argv` directly.
    const argv = await y.argv

    if (argv.i) {
      assert(argv._.length === 0, 'Option `-i` cannot be used with <command>.')
    }
    if (argv.e) {
      assert(argv._.length > 0, 'Option `-e` must be given with <command>.')
    }

    // 1. Set config file path

    // Throws error if config file does not exist.
    await core.setConfigFilename({
      filename: argv.c || process.env.HAETAE_CONFIG_FILE,
    })
    const config = await core.getConfig() // Loads config file

    // 2. Run
    if (argv._.length === 0) {
      // 2.1. When command is not given

      if (argv.i) {
        const info = await getInfo()
        if (argv.j) {
          ui.json.success(
            'You can paste this information when creating an issue from https://github.com/haetae-org/haetae/issues',
            info,
          )
        } else {
          signale.info(
            `${chalk.dim(
              'Your runtime information is copied to the clipboard without color code. Paste it when creating an issue.\n',
            )}${chalk.bold.blue('➜ ')}${chalk.underline.bold(
              'https://github.com/haetae-org/haetae/issues',
            )}\n`,
          )
          const message = ui.processInfo(info)
          clipboard.writeSync(stripAnsi(message))
          console.log(message)
        }
      } else {
        throw new Error('An option is invalid or <command> is not given.')
      }
    } else if (argv._.length === 1) {
      // 2.2. When a single command is given

      const command = argv._[0]
      assert(typeof command === 'string')
      // Set current command
      core.setCurrentCommand({
        command,
      })

      if (argv.r) {
        const record = await config.store.getRecord()
        ui.conditional({
          toJson: !!argv.j,
          message: `${chalk.dim(
            'Record matching with current environment is found for the command',
          )} ${chalk.bold.underline(command)}`,
          noResultMessage: `${chalk.dim(
            'No Record matching with current environment is found for the command',
          )} ${chalk.bold.underline(command)}`,
          result: record,
          render: ui.processRecord,
        })
      } else if (argv.d) {
        const record = await config.store.getRecord()
        const recordData = record?.data
        ui.conditional({
          toJson: !!argv.j,
          message: `${chalk.dim(
            'Record matching with current environment is found for the command',
          )} ${chalk.bold.underline(command)}`,
          noResultMessage: `${chalk.dim(
            'No Record Data matching with current environment is found for the command',
          )} ${chalk.bold.underline(command)}`,
          result: recordData,
          render: (result) => ui.asBlock(result),
        })
      } else if (argv.e) {
        const env = await core.invokeEnv()
        ui.conditional({
          toJson: !!argv.j,
          message: `${chalk.dim(
            'Current environment is successfully evaluated for the command',
          )} ${chalk.bold.underline(command)}`,
          noResultMessage: `${chalk.dim(
            'Env is defined in config (on command level or root level), but returned `undefined` for the command',
          )} ${chalk.bold.underline(command)}`,
          result: { env, envHash: await core.hashEnv(env) },
          render: (result) => ui.asBlock(result),
        })
      } else {
        const record = await core.createRecord()
        if (!argv.dryRun) {
          await config.store.addRecord({ record })
        }
        assert(
          !!record,
          'Oops! Something went wrong. The new Record is not found from the store even though the command was just executed.',
        )
        if (argv.s) {
          return
        }
        const message = `${chalk.dim('Command')} ${chalk.bold.underline(
          command,
        )} ${chalk.dim('is successfully executed.')}`
        if (argv.j) {
          ui.json.success(message, record)
        } else {
          signale.success(`${message}\n`)
          console.log(ui.processRecord(record))
        }
      }
    } else {
      // 2.3. When multiple commands are given
      throw new Error('Too many commands. Only one command is allowed.')
    }
  } catch (error) {
    const argv = await y?.argv
    if (argv?.j) {
      if (error instanceof Error) {
        ui.json.fatal(error.message, error.stack)
      } else if (typeof error === 'string') {
        ui.json.fatal(error, error)
      } else {
        ui.json.fatal('Error occurred.', error)
      }
    } else {
      signale.fatal(error)
    }
    process.exit(1)
  }
}
