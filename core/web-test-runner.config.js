const fs = require("fs");

const proxy = require("koa-proxies");

const snowpackPlugin = require("@snowpack/web-test-runner-plugin");
const { chromeLauncher } = require("@web/test-runner");
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
        proxy("/client/element-web", {
            target: "https://develop.element.io",
            changeOrigin: true,
            rewrite: path => path.replace("/client/element-web", ""),
        }),
        proxy("/client/hydrogen", {
            target: "https://hydrogen.element.io",
            changeOrigin: true,
            rewrite: path => path.replace("/client/hydrogen", ""),
        }),
    ],
    plugins: [
        snowpackPlugin(),
        harnessPlugin,
    ],
    testRunnerHtml: testFramework => {
        const html = fs.readFileSync("./framework/index.html", "utf8");
        return html.replace("${testFramework}", testFramework);
    },
    testFramework: {
        config: {
            timeout: 30000,
        },
    },
    browsers: [
        chromeLauncher({
            launchOptions: {
                args: process.env.CI ? [
                    "--no-sandbox",
                ] : [],
            },
        }),
    ],
};
