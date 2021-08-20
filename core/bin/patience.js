#!/usr/bin/env node

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const childProcess = require("child_process");
const path = require("path");

const cwd = process.cwd();

const testRunnerBinPath = require.resolve("@web/test-runner")
    .replace(/test-runner.*$/, "test-runner/dist/bin.js");

try {
    const result = childProcess.spawnSync("npx", [
        "ts-node",
        "--cwd-mode",
        testRunnerBinPath,
        // Tests to run, e.g. `*.ts`
        // TODO: Handle multiple file paths or provide a nice error message
        path.join(cwd, process.argv[2]),
        // TODO: Work out the best way to manage parallel orchestration
        "--concurrency",
        "1",
        // Any remaining args are passed through
        ...process.argv.slice(3),
    ], {
        stdio: "inherit",
        // Run as if we're in the core directory
        cwd: path.dirname(require.resolve("@matrix-org/patience/package.json")),
        // Expose test directory for referencing in the Snowpack config
        env: Object.assign({
            PATIENCE_TEST_DIR: cwd,
        }, process.env),
    });
    process.exitCode = result.status;
} catch (e) {
    console.error(e);
    process.exitCode = 1;
}
