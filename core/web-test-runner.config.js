const fs = require("fs");

const snowpackPlugin = require("@snowpack/web-test-runner-plugin");
const harnessPlugin = require("./api/harness");

process.env.NODE_ENV = "test";

// This file is (perhaps confusingly) currently used by _downstream consumers_
// who are running _their own_ tests via the `patience` command.

module.exports = {
    middleware: [
        function loadAsJS(context, next) {
            // Snowpack expects *.ts files to be requested as *.js
            if (context.url.includes(".ts")) {
                context.url = context.url.replace(".ts", ".js");
            }
            return next();
        },
    ],
    plugins: [
        snowpackPlugin(),
        harnessPlugin,
    ],
    testRunnerHtml: testFramework => {
        const html = fs.readFileSync("./framework/index.html", "utf8");
        return html.replace("${testFramework}", testFramework);
    },
};
