# cjs-ts-2

An example of using Haetae in CJS Typescript project.

A dedicated Typescript config *`tsconfig.haetae.json`* is used.

To execute, build the package [`heatae`](../../packages/haetae) first.

```bash
pnpm --filter "haetae" build
# And you should run "pnpm install" again
pnpm install
```

Then check if it works.

```bash
pnpm haetae helloworld
```
