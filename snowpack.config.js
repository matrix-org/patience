// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

const proxy = require("http2-proxy");

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    root: "./src",
    alias: {
        "react": "preact/compat",
        "react-dom": "preact/compat",
    },
    devOptions: {
        open: "none",
        port: 7284,
    },
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
