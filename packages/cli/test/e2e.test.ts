import { $ as $$ } from 'execa'
import { dirname } from 'dirname-filename-esm'
import upath from 'upath'

const $ = $$({
  stdio: 'pipe',
})

const examples = upath.resolve(dirname(import.meta), '../../../examples')

describe('test', () => {
  // eslint-disable-next-line jest/no-hooks
  beforeAll(async () => {
    await $`pnpm --filter "haetae" build`
  })

  test('cjs-js', async () => {
    const { stdout } = await $({
      cwd: `${examples}/cjs-js`,
    })`pnpm haetae helloworld`
    expect(stdout).toContain('Command helloworld is successfully executed.')
  })
  test('cjs-ts-1', async () => {
    const { stdout } = await $({
      cwd: `${examples}/cjs-ts-1`,
    })`pnpm haetae helloworld`
    expect(stdout).toContain('Command helloworld is successfully executed.')
  })
  test('cjs-ts-2', async () => {
    const { stdout } = await $({
      cwd: `${examples}/cjs-ts-2`,
    })`pnpm haetae helloworld`
    expect(stdout).toContain('Command helloworld is successfully executed.')
  })
  test('esm-js', async () => {
    const { stdout } = await $({
      cwd: `${examples}/esm-js`,
    })`pnpm haetae helloworld`
    expect(stdout).toContain('Command helloworld is successfully executed.')
  })
  test('esm-ts', async () => {
    const { stdout } = await $({
      cwd: `${examples}/esm-ts`,
    })`pnpm haetae helloworld`
    expect(stdout).toContain('Command helloworld is successfully executed.')
  })
  test('my-calculator', async () => {
    const { stdout } = await $({
      cwd: `${examples}/my-calculator`,
    })`pnpm haetae test`
    expect(stdout).toContain('Command test is successfully executed.')
  })
})
