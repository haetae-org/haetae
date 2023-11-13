# Haetae

Incremental tasks - test, lint, build, and more - for any environment.

[![license](https://img.shields.io/badge/license-MIT-ff4081.svg?style=flat-square&labelColor=black)](./LICENSE)
[![test](https://img.shields.io/badge/test-jest-7c4dff.svg?style=flat-square&labelColor=black)](./jest.config.js)
[![code style:airbnb](https://img.shields.io/badge/code_style-airbnb-448aff.svg?style=flat-square&labelColor=black)](https://github.com/airbnb/javascript)
[![code style:prettier](https://img.shields.io/badge/code_style-prettier-18ffff.svg?style=flat-square&labelColor=black)](https://prettier.io/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-ffab00.svg?style=flat-square&labelColor=black)](https://conventionalcommits.org)
[![Commitizen friendly](https://img.shields.io/badge/Commitizen-cz_conventional_changelog-dd2c00.svg?style=flat-square&labelColor=black)](http://commitizen.github.io/cz-cli/)
![pr welcome](https://img.shields.io/badge/PRs-welcome-09FF33.svg?style=flat-square&labelColor=black)

## Why?

There're needs for automating, especially on CI, incremental tasks.

For examples,

- Linting only changed source files.
- Running only affected test files, either when the test file is changed or transitive dependency source file is changed, with language-specific automatic dependency graph detection.
- Triggering build only when a source file is changed. Or selectively building only changed source files and overriding existing build cache.
- Storing 'state' or 'result' for each task (Unless you save it, like if a test is failed or not, an "incremental" task becomes impossible in most scenarios.).
- Detecting changes by your customized criteria (e.g. git diff against to lastly pushed commit per branch.), and doing some very specialized tasks.

**Haetae** enables all kinds of incremental tasks, including test, lint, build, and more, with ease.

Haetae requires Node.js runtime.
Regardless of that, its purpose is for any languages, frameworks and platforms.
For now, it only officially supports javascript ecosystem.
However, more language supports are possibly to be added in the future.

## Getting Started

Refer to [haetae.dev](https://haetae.dev)

## License

[MIT License](license). Copyright © 2021, GIL B. Chan <github.com/jjangga0214> <bnbcmindnpass@gmail.com>

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fhaetae-org%2Fhaetae.svg?type=large&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fhaetae-org%2Fhaetae?ref=badge_large&issueType=license)
