import path from "path";

import { defineConfig, searchForWorkspaceRoot } from "vite";

const fsAllow = [
    searchForWorkspaceRoot(process.cwd()),
];
// Allow test directory if running tests via `patience` command
if (process.env.PATIENCE_TEST_DIR) {
    fsAllow.push(process.env.PATIENCE_TEST_DIR);
}

let testPrefix = "";
if (process.env.PATIENCE_TEST_DIR) {
    // Tests are requested by their relative path with upward steps removed
    const testRelPath = path.relative(process.cwd(), process.env.PATIENCE_TEST_DIR);
    testPrefix = "/" + testRelPath.replace(/\.\.[/\\]/g, "");
}

export default defineConfig({
    root: "./framework",
    resolve: {
        alias: {
            "react": "preact/compat",
            "react-dom": "preact/compat",
        },
    },
    clearScreen: false,
    server: {
        port: 7284,
        strictPort: true,
        fs: {
            allow: fsAllow,
            strict: true,
        },
        proxy: {
            "/client/element-web": {
                target: "https://develop.element.io",
                changeOrigin: true,
                rewrite: path => path.replace("/client/element-web", ""),
            },
            "/client/hydrogen": {
                target: "https://hydrogen.element.io",
                changeOrigin: true,
                rewrite: path => path.replace("/client/hydrogen", ""),
            },
        },
        // Only use HMR for development of Patience itself
        hmr: !process.env.PATIENCE_TEST_DIR,
    },
    build: {
        outDir: "./build",
        minify: false,
        sourcemap: true,
    },
    plugins: [
        {
            name: "patience:mount-tests",
            enforce: "pre",
            resolveId(source) {
                // Resolve test directory if running tests via `patience` command
                const testDir = process.env.PATIENCE_TEST_DIR;
                if (testDir) {
                    if (source.startsWith(testPrefix)) {
                        return source.replace(testPrefix, testDir);
                    }
                }
                return null;
            },
        },
    ],
});
