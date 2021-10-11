const fs = require("fs");

const proxy = require("koa-proxies");

const vitePlugin = require("vite-web-test-runner-plugin");
const { chromeLauncher } = require("@web/test-runner");
const harnessPlugin = require("./api/harness");

process.env.NODE_ENV = "test";

// This file is (perhaps confusingly) currently used by _downstream consumers_
// who are running _their own_ tests via the `patience` command.

module.exports = {
    middleware: [
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
        vitePlugin(),
        harnessPlugin,
    ],
    testRunnerHtml: testFramework => {
        let html = fs.readFileSync("./framework/index.html", "utf8");
        html = html.replace("${testFramework}", testFramework);
        html = html.replace("ignore", "module");
        return html;
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
