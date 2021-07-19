// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

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
    buildOptions: {
        out: "./build",
    },
};
