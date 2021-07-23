// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

const path = require("path");

const proxy = require("http2-proxy");

const mount = {
    // Mount the core under a subdirectory so it won't be clobbered by test
    // runners who take the root directory
    "./framework": "/framework",
};
// Mount test directory if running tests via `patience` command
if (process.env.PATIENCE_TEST_DIR) {
    const testDir = process.env.PATIENCE_TEST_DIR;
    mount[testDir] = "/" + path.basename(testDir);
}

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    root: "./framework",
    alias: {
        "react": "preact/compat",
        "react-dom": "preact/compat",
    },
    devOptions: {
        open: "none",
        port: 7284,
    },
    mount,
    routes: [
        {
            src: "/client/element-web.*",
            dest(req, res) {
                return proxy.web(req, res, {
                    protocol: "https",
                    hostname: "develop.element.io",
                    port: 443,
                    path: req.url.replace("/client/element-web", ""),
                });
            },
        },
    ],
    buildOptions: {
        out: "./build",
    },
};
