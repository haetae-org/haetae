# @haetae/core

## 0.0.19

### Patch Changes

- [`4ea13ec`](https://github.com/haetae-org/haetae/commit/4ea13ecdb332fdce1b2714be0f2b9502c27a1739) Thanks [@jjangga0214](https://github.com/jjangga0214)! - BREAKING CHANGE: Rename `LocalFileStore.recordRemoval.leaveOnlyLastestPerEnv` to `LocalFileStore.recordRemoval.keepOnlyLatest`

## 0.0.18

### Patch Changes

- [`15c2b32`](https://github.com/haetae-org/haetae/commit/15c2b3250ed54b813bc9587ebfbd202324490795) Thanks [@jjangga0214](https://github.com/jjangga0214)! - BREAKING CHANGE: Set `"node": ">=20"` for engine.

- Updated dependencies [[`15c2b32`](https://github.com/haetae-org/haetae/commit/15c2b3250ed54b813bc9587ebfbd202324490795)]:
  - @haetae/common@0.0.5

## 0.0.17

### Patch Changes

- [`c9847c3`](https://github.com/haetae-org/haetae/commit/c9847c3bc6a84711ad17c4cf9b69c504ccb1ca6c) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Set `esm: true` for tsNode.register

## 0.0.16

### Patch Changes

- Updated dependencies [[`55f520f`](https://github.com/haetae-org/haetae/commit/55f520f374b411b40e7efac04d6edb6a1751cd23)]:
  - @haetae/common@0.0.4

## 0.0.15

### Patch Changes

- [`67e40ad`](https://github.com/haetae-org/haetae/commit/67e40adc6df3d65f64b79af55cc2e0ef1ad1f08c) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: `formRecordOptions` is removed and `formRecord` is renamed to `createRecord`. `invokeEnv` and `invokeRun` are changed. `invokeRootRecordData` and `invokeRootEnv` is newly introduced.

- [`f514ae4`](https://github.com/haetae-org/haetae/commit/f514ae4ecc95201fda2fc86abfb5ccfea4402057) Thanks [@jjangga0214](https://github.com/jjangga0214)! - -

  - `envHash` and `hashEnv` are newly introduced.
  - **BREAKING CHANGE**: `compareEnvs` is removed.

- [`abe2f2d`](https://github.com/haetae-org/haetae/commit/abe2f2d19adc38fd9eec8b8573b9a78691ef3528) Thanks [@jjangga0214](https://github.com/jjangga0214)! - `reserveRecordData` and `ReserveRecordDataOptions` are newly introduced.

  **BREAKING CHANGE**: `CommandFromConfig` is removed in favor of new `InvokeEnvOptions` and `InvokeRunOptions`. Options for `invokeEnv` and `invokeRun` have changed.

- [`b7f6294`](https://github.com/haetae-org/haetae/commit/b7f6294c640add6c2633ad782eb24df84c55f882) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: `defaultStoreFile`, `storeFilename`,`SetStoreFilenameOptions`,`setStoreFilename`,`getStoreFilename`, `HaetaeConfig.recordRemoval`, `HaetaeConfig.storeFile`, `HaetaePreConfig.recordRemoval`, `HaetaePreConfig.storeFile`, `initNewStore`,`GetStoreOptions`,`getStore`,`GetRecordsOptions`,`getRecords`, `GetRecordOptions`, `GetRecordsOptions`, `getRecords`, `SaveStoreOptions`, `saveStore`, `DeleteStoreOptions`, `deleteStore` are removed and (some of them are) replaced by the new store system. `HaetaeStore` is renamed to `LocalFileStore`.

## 0.0.14

### Patch Changes

- [`475aaa8`](https://github.com/haetae-org/haetae/commit/475aaa82d4850932b248ff69491d75ee9c0c0ed1) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: `HaetaePreConfig` does not have generics any more.

- [`475aaa8`](https://github.com/haetae-org/haetae/commit/475aaa82d4850932b248ff69491d75ee9c0c0ed1) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: A string constant `defaultConfigFile` is replaced by an contant array `defaultConfigFiles`. From now on, `haetae.config.js`, `haetae.config.mjs`, `haetae.config.ts`, `haetae.config.mts` are automatically searched. For typescript file, a peer dependency `ts-node` should be installed first.

- [`475aaa8`](https://github.com/haetae-org/haetae/commit/475aaa82d4850932b248ff69491d75ee9c0c0ed1) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: Types of env and _Record Data_ should extend `Record<string, unknown>` from now on. (Anything was allowed before.)

- [`475aaa8`](https://github.com/haetae-org/haetae/commit/475aaa82d4850932b248ff69491d75ee9c0c0ed1) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: `fallback` option is replaced by `initWhenNotFound` in `GetStoreOptions`.

- [`475aaa8`](https://github.com/haetae-org/haetae/commit/475aaa82d4850932b248ff69491d75ee9c0c0ed1) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: `setCurrentCommand`, `setConfigFilename`, `setStoreFilename` receives `options` object as an argument, respectively `SetCurrentCommandOptions`, `SetConfigFilenameOptions`, `SetStoreFilenameOptions`.

- [`475aaa8`](https://github.com/haetae-org/haetae/commit/475aaa82d4850932b248ff69491d75ee9c0c0ed1) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: `RecordDataOptions` and `ChangedFilesOptions` do not receive `PromiseOr` anymore.

- [`475aaa8`](https://github.com/haetae-org/haetae/commit/475aaa82d4850932b248ff69491d75ee9c0c0ed1) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: The packages become [Pure ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).

- Updated dependencies [[`475aaa8`](https://github.com/haetae-org/haetae/commit/475aaa82d4850932b248ff69491d75ee9c0c0ed1), [`475aaa8`](https://github.com/haetae-org/haetae/commit/475aaa82d4850932b248ff69491d75ee9c0c0ed1)]:
  - @haetae/common@0.0.3

## 0.0.13

### Patch Changes

- [`b026892`](https://github.com/haetae-org/haetae/commit/b026892d1400203f62698868a505237ef3b36a0d) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: `FilenameOption` is removed in favor of `GetConfigOptions` and `DeleteStoreOptions`.

* [`a9a3308`](https://github.com/haetae-org/haetae/commit/a9a3308a5ac6f75c8c1d2ccda6546cc6fcd8166a) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Fixed `configure`'s transforming `<command>.env` in a wrong way when it's given as non-function object/value.

* Updated dependencies [[`b84cebe`](https://github.com/haetae-org/haetae/commit/b84cebe811e93bdc7c8f626f3f54168dd402cbf7), [`b84cebe`](https://github.com/haetae-org/haetae/commit/b84cebe811e93bdc7c8f626f3f54168dd402cbf7), [`32687c8`](https://github.com/haetae-org/haetae/commit/32687c8712554934846422f6422b7409670e024c)]:
  - @haetae/common@0.0.2

## 0.0.12

### Patch Changes

- [`930e0d5`](https://github.com/haetae-org/haetae/commit/930e0d5f9516b4fdfa0ff76ee8a521ec0aabf492) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: `GetConfigOptions` is renamed to `FilenameOption`

* [`930e0d5`](https://github.com/haetae-org/haetae/commit/930e0d5f9516b4fdfa0ff76ee8a521ec0aabf492) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: `mapStore` and `MapStoreOptions` is renamed to `addRecord` and `AddRecordOptions`.

- [`a862b02`](https://github.com/haetae-org/haetae/commit/a862b02234f9743120439773c54a8cdfb42e3b2e) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: `configure` returns `storeFile` as an absolute path.

* [`a862b02`](https://github.com/haetae-org/haetae/commit/a862b02234f9743120439773c54a8cdfb42e3b2e) Thanks [@jjangga0214](https://github.com/jjangga0214)! - `storeFilename` becomes module state and can be set/get by `setStoreFilename` and `getStoreFilename`.

- [`a862b02`](https://github.com/haetae-org/haetae/commit/a862b02234f9743120439773c54a8cdfb42e3b2e) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: Default path of store file is `.haetae/store.json` instead of `haetae.store.json`.

## 0.0.11

### Patch Changes

- [`c60afa9`](https://github.com/haetae-org/haetae/commit/c60afa9c0f9c7809afcd0ee8682d41e0a8623673) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE**: Every path is converted/returned with slash(`/`) as a delimiter, which means, on Windows, legacy Windows delimiter(`\`) is not returned. However, you can still put the legacy style path as a argument or config field.

## 0.0.10

### Patch Changes

- [`add1591`](https://github.com/haetae-org/haetae/commit/add15916fc532d644c6957d0c97d79feea406584) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE** `compareEnvs` does not receive Promise as arguments from now on. It's also now a synchronous function.

- [`56a82ef`](https://github.com/haetae-org/haetae/commit/56a82ef7f8398670c39176149212d07090109aa4) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Introduced `recordRemoval` option in config. This is yo automatically remove unnecessary records. `age` and/or `count` can be configured.

## 0.0.9

### Patch Changes

- [`301bfc3`](https://github.com/haetae-org/haetae/commit/301bfc3dca164bcfdd9eca92105d6be3c9accdc4) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE** Renamed `mapRecord` to `formRecord`. Renamed `MapRecordOptions` to `FormRecordOptions`.

- [`20a0449`](https://github.com/haetae-org/haetae/commit/20a04496ef23ded57fe2d68beea2536dabc4669d) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE** `packageVersion` and `packageName` is removed in favor of new export `pkg`.

- [`bd6f33d`](https://github.com/haetae-org/haetae/commit/bd6f33d7c066bc08912d3659c0607901acbb86ce) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Introduced `deleteStore`.

## 0.0.8

### Patch Changes

- [`f22727d`](https://github.com/haetae-org/haetae/commit/f22727d146e9038246b546a33d350579eceee453) Thanks [@jjangga0214](https://github.com/jjangga0214)! - **BREAKING CHANGE** root `env` and `recordData` are to be mapper function that takes env/recordData as an argument from command's `env` and `run` and then returns the final result to be stored.

## 0.0.7

### Patch Changes

- [`b1a4a86`](https://github.com/haetae-org/haetae/commit/b1a4a86bc725fb3f3e5ba71cb7422455e272cf2a) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Let `env` be object or function.

- [`23eb1f3`](https://github.com/haetae-org/haetae/commit/23eb1f3dad8e55e178c6375064b41b5a2e33fe6e) Thanks [@jjangga0214](https://github.com/jjangga0214)! - (BREAKING CHANGE) Moved `$HAETAE_CONFIG_FILE` handling from `@haetae/core` to `@haetae/cli`. From now on, `@haetae/core` does not detect `$HAETAE_CONFIG_FILE` automatically.

- [`afa12ee`](https://github.com/haetae-org/haetae/commit/afa12eee27560856fa40754f9d04aaa3bf920c1d) Thanks [@jjangga0214](https://github.com/jjangga0214)! - (BREAKING CHANGE) Introduced `HaetaeRecordData`.

- [`1b325c1`](https://github.com/haetae-org/haetae/commit/1b325c1e5de124fbbd09cd3910cf77b30164f990) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Provide generics for `env` and `recordData`.

- [`1b325c1`](https://github.com/haetae-org/haetae/commit/1b325c1e5de124fbbd09cd3910cf77b30164f990) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Now global default env and recordData can be configured.

- [`b1a4a86`](https://github.com/haetae-org/haetae/commit/b1a4a86bc725fb3f3e5ba71cb7422455e272cf2a) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Record's `time` is now unix timestamp by miliseconds.

## 0.0.6

### Patch Changes

- [`18cc10f`](https://github.com/haetae-org/haetae/commit/18cc10fe6504e2ba7c13c40e78237bbe20abc07b) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Exported new function `compareEnvs`.

- [`2519c75`](https://github.com/haetae-org/haetae/commit/2519c75646778e9f882755f7185bb737ae589b67) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Export `packageName` and `packageVersion`.

- [`18cc10f`](https://github.com/haetae-org/haetae/commit/18cc10fe6504e2ba7c13c40e78237bbe20abc07b) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Fixed env comparison issue. Now record is not duplicated for the same env.

## 0.0.5

### Patch Changes

- [`f90049f`](https://github.com/haetae-org/haetae/commit/f90049f79d288815f9ee4122ded81a3df9191b23) Thanks [@jjangga0214](https://github.com/jjangga0214)! - Fixed default store file path resolution.
