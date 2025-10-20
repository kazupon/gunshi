# Contributing Guide

- [Contributing Guide](#contributing-guide)
  - [Issue Reporting Guidelines](#issue-reporting-guidelines)
  - [Pull Request Guidelines](#pull-request-guidelines)
    - [Work Step Example](#work-step-example)
  - [Development Setup](#development-setup)
    - [Commonly used NPM scripts](#commonly-used-npm-scripts)

## Issue Reporting Guidelines

- The issue list of this repo is **exclusively** for bug reports and feature requests. Non-conforming issues will be closed immediately.

- Try to search for your issue, it may have already been answered or even fixed in the main branch.

- Check if the issue is reproducible with the latest stable version of `gunshi`. If you are using a pre-release, please indicate the specific version you are using.

- It is **required** that you clearly describe the steps necessary to reproduce the issue you are running into. Issues with no clear repro steps will not be triaged. If an issue labeled `status: need more repro codes or info` receives no further input from the issue author for more than 5 days, it will be closed.

- For bugs that involves build setups, you can create a reproduction repository with steps in the README.

- If your issue is resolved but still open, don’t hesitate to close it. In case you found a solution by yourself, it could be helpful to explain how you fixed it.

## Pull Request Guidelines

- Checkout a topic branch from the `main` branch.

- It's OK to have multiple small commits as you work on the PR - we will let GitHub automatically squash it before merging.

- If adding new feature:
  - Provide convincing reason to add this feature. Ideally you should open a suggestion issue first and have it greenlighted before working on it.

- If fixing a bug:
  - Provide detailed description of the bug in the PR.

### Work Step Example

- Create your topic branch from `master`: `git branch my-new-topic origin/main`
- Add codes and pass lint!
- Commit your changes: `git commit -am 'Add some topic'`
- Push to the branch: `git push origin my-new-topic`
- Submit a pull request to `main` branch of `kazupon/gunshi` repository !

## Development Setup

After cloning the repo, run:

```sh
pnpm install
```

### Commonly used NPM scripts

```sh
# lint source codes
pnpm lint

# code format and lint fix
pnpm fix
```

There are some other scripts available in the `scripts` section of the `package.json` file.

**Please make sure to have this pass successfully before submitting a PR.** Although the lint will be run against your PR on the CI server, it is better to have it working locally beforehand.
