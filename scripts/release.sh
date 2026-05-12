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
    # Use `pnpm exec` instead of `pnpx`. `pnpx` (= `pnpm dlx`) does a fresh
    # install of the binary into a temporary context that does NOT inherit the
    # workspace's `onlyBuiltDependencies`, so esbuild (a transitive dep of tsx
    # and of jsr) trips `ERR_PNPM_IGNORED_BUILDS`. `pnpm exec` runs the binary
    # already present in the workspace's node_modules, with no extra install.
    pnpm exec tsx ./scripts/jsr.ts --package $PKG --tag $TAG
    pnpm install --no-frozen-lockfile --ignore-scripts
    pushd $PKG
    echo "⚡ Publishing $PKG for jsr registry"
    pnpm exec jsr publish -c jsr.json --allow-dirty
    popd > /dev/null
  fi
done
