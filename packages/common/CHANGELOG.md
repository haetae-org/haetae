# @haetae/common

## 0.0.5

### Patch Changes

- [`15c2b32`](https://github.com/haetae-org/haetae/commit/15c2b3250ed54b813bc9587ebfbd202324490795) Thanks [@jjangga0214](https://github.com/jjangga0214)! - BREAKING CHANGE: Set `"node": ">=20"` for engine.

## 0.0.4

### Patch Changes

- [`55f520f`](https://github.com/haetae-org/haetae/commit/55f520f374b411b40e7efac04d6edb6a1751cd23) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Publish what should be published before.

## 0.0.3

### Patch Changes

- [`475aaa8`](https://github.com/haetae-org/haetae/commit/475aaa82d4850932b248ff69491d75ee9c0c0ed1) Thanks [@jjangga0214](https://github.com/jjangga0214)! - `toAbsolutePath` receives `rootDir` as `string | (() => string)`.

- [`475aaa8`](https://github.com/haetae-org/haetae/commit/475aaa82d4850932b248ff69491d75ee9c0c0ed1) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: The packages become [Pure ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

## 0.0.2

### Patch Changes

- [`b84cebe`](https://github.com/haetae-org/haetae/commit/b84cebe811e93bdc7c8f626f3f54168dd402cbf7) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Fixed an issue that `toAbsolutePath` joins `options.rootDir` to `options.file` even when the `options.file` is already an absolute path. From now on, `options.file` is returned as-is if it's an absolute path already.

* [`b84cebe`](https://github.com/haetae-org/haetae/commit/b84cebe811e93bdc7c8f626f3f54168dd402cbf7) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Added a new function `parsePkg` and interfaces `ParsePkgOptions` and `Pkg`.

- [`32687c8`](https://github.com/haetae-org/haetae/commit/32687c8712554934846422f6422b7409670e024c) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: `ToAbsolutePathOptions`'s `file` is renamed to `path`.
