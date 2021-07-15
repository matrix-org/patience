// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    root: "./src",
    mount: {
        /* ... */
    },
    plugins: [
        /* ... */
    ],
    alias: {
        "react": "preact/compat",
        "react-dom": "preact/compat",
    },
    packageOptions: {
        /* ... */
    },
    devOptions: {
        open: "none",
        port: 7284,
    },
    buildOptions: {
        out: "./build",
    },
};
