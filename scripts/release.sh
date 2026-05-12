#!/bin/bash

set -e

# Restore all git changes
git restore --source=HEAD --staged --worktree -- package.json pnpm-lock.yaml

# Update token
if [[ ! -z ${NPM_TOKEN} ]] ; then
  echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> ~/.npmrc
  echo "registry=https://registry.npmjs.org/" >> ~/.npmrc
  echo "always-auth=true" >> ~/.npmrc
  npm whoami
fi

TAG="latest"

# Release packages for npm registry
for PKG in packages/* ; do
  if [[ -d $PKG ]]; then
    if [[ $PKG == packages/docs ]]; then
      pnpm run build:docs
    fi
    pushd $PKG
    if [[ $PKG == packages/gunshi ]]; then
      cp -r ../../assets ./assets
      cp ../../README.md ./README.md
      cp ../../CHANGELOG.md ./CHANGELOG.md
      cp ../../LICENSE ./LICENSE
    fi
    echo "⚡ Publishing $PKG with tag $TAG"
    pnpm publish --access public --no-git-checks --tag $TAG
    popd > /dev/null
  fi
done

# Release packages for jsr registry
for PKG in packages/* ; do
  if [[ -d $PKG ]]; then
    if [[ $PKG == packages/docs ]]; then
      continue
    fi
    # Run jsr.ts and pnpm install from the workspace root so that pnpm reads
    # `pnpm-workspace.yaml` (notably `onlyBuiltDependencies`). Running these
    # from inside `$PKG` makes pnpm treat the install as if outside the
    # workspace context in CI, causing `ERR_PNPM_IGNORED_BUILDS` for esbuild
    # (pulled in transitively by the modified package.json).
    pnpx tsx ./scripts/jsr.ts --package $PKG --tag $TAG
    # DEBUG: dump pnpm config and cwd state to diagnose CI-only IGNORED_BUILDS
    echo "::group::DEBUG pnpm install context for $PKG"
    echo "pwd: $(pwd)"
    echo "ls workspace root:"
    ls -la pnpm-workspace.yaml package.json 2>&1 | head -5
    echo "pnpm config get onlyBuiltDependencies:"
    pnpm config get onlyBuiltDependencies 2>&1 || true
    echo "pnpm config list (filtered):"
    pnpm config list 2>&1 | grep -iE "build|approve|workspace" | head -20 || true
    echo "::endgroup::"
    pnpm install --no-frozen-lockfile --ignore-scripts
    pushd $PKG
    echo "⚡ Publishing $PKG for jsr registry"
    pnpx jsr publish -c jsr.json --allow-dirty
    popd > /dev/null
  fi
done
