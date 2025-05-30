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

# Release packages
for PKG in packages/* ; do
  if [[ -d $PKG ]]; then
    if [[ $PKG == packages/docs ]]; then
      continue
    fi
    pushd $PKG
    if [[ $PKG == packages/gunshi ]]; then
      cp -r ../../assets ./assets
      cp ../../README.md ./README.md
      cp ../../CHANGELOG.md ./CHANGELOG.md
      cp ../../LICENSE ./LICENSE
    fi
    TAG="latest"
    echo "⚡ Publishing $PKG with tag $TAG"
    pnpm publish --access public --no-git-checks --tag $TAG
    echo "⚡ Publishing $PKG for jsr registry"
    pnpx jsr publish -c jsr.json
    popd > /dev/null
  fi
done
