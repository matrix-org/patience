module.exports = {
    plugins: [
        "matrix-org",
    ],
    extends: [
        "plugin:matrix-org/typescript",
    ],
    env: {
        browser: true,
        node: true,
    },
    rules: {
        "quotes": "off",
    },
};
