# cjs-ts

An example of using Haetae in CJS Typescript project.

[`$TS_NODE_COMPILER_OPTIONS`](https://typestrong.org/ts-node/docs/options/#compileroptions) is used.

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
