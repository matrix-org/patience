import path from "path";

import { defineConfig, searchForWorkspaceRoot } from "vite";

const {
    PATIENCE_TEST_DIR: testDir,
    PATIENCE_TEST_FILES: testFiles,
} = process.env;

const fsAllow = [
    searchForWorkspaceRoot(process.cwd()),
];
// Allow test directory if running tests via `patience` command
if (testDir) {
    fsAllow.push(testDir);
}

const optimizeDepsEntries = [
    // Always optimise Patience itself, as Vite default would have done.
    "index.html",
];
if (testDir && testFiles) {
    const rootDir = path.join(process.cwd(), "framework");
    const frameworkRelativeTestDir = path.relative(rootDir, testDir);
    optimizeDepsEntries.push(path.join(frameworkRelativeTestDir, testFiles));
}

let testPrefix = "";
if (testDir) {
    // Tests are requested by their relative path with upward steps removed
    const testRelPath = path.relative(process.cwd(), testDir);
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
        hmr: !testDir,
    },
    build: {
        outDir: "./build",
        minify: false,
        sourcemap: true,
    },
    optimizeDeps: {
        entries: optimizeDepsEntries,
    },
    plugins: [
        {
            name: "patience:mount-tests",
            enforce: "pre",
            resolveId(source) {
                // Resolve test directory if running tests via `patience` command
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
