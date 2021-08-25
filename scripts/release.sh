#!/bin/bash

set -e

npm version patch -w core

pushd core
version=$(cat package.json | jq -r '.version')
# For the published version of the package, we copy the `main_lib` and
# `types_lib` fields to `main` and `types` (if they exist). This small bit of
# gymnastics allows us to use the TypeScript source directly for development
# without needing to build before linting or testing.
for i in main types
do
    lib_value=$(jq -r ".${i}_lib" package.json)
    if [ "$lib_value" != "null" ]; then
        jq ".$i = .${i}_lib" --indent 4 package.json > package.json.new && mv package.json.new package.json
    fi
done
git commit package.json -m "patience ${version}"
popd

npm publish -w core

pushd core
# When merging to develop, we need revert the `main` and `types` fields if we
# adjusted them previously.
for i in main types
do
    # If a `lib` value is present, it means we adjusted the field earlier at
    # publish time, so we should revert it now.
    if [ "$(jq -r ".${i}_lib" package.json)" != "null" ]; then
        # If there's a `src` value, use that, otherwise delete.
        # This is used to delete the `types` field and reset `main` back to the
        # TypeScript source.
        src_value=$(jq -r ".${i}_src" package.json)
        if [ "$src_value" != "null" ]; then
            jq ".$i = .${i}_src" --indent 4 package.json > package.json.new && mv package.json.new package.json
        else
            jq "del(.$i)" --indent 4 package.json > package.json.new && mv package.json.new package.json
        fi
    fi
done
git commit package.json -m "Resetting package fields for development"
popd

npm add "@matrix-org/patience@${version}" --save-exact -w examples
git commit package-lock.json examples/package.json -m "Upgrade to patience ${version}"
