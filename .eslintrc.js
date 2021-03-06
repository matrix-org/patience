module.exports = {
    plugins: [
        "matrix-org",
        "react",
    ],
    env: {
        es2020: true,
        browser: true,
        node: true,
    },
    parserOptions: {
        sourceType: "module",
    },
    overrides: [
        {
            files: [
                "**/*.ts",
                "**/*.tsx",
            ],
            extends: [
                "plugin:matrix-org/typescript",
            ],
            settings: {
                react: {
                    pragma: "h",
                },
            },
            rules: {
                "quotes": ["error", "double"],

                // React rules adapted from eslint-plugin-matrix-org
                // Rules for hooks removed to avoid extra dependencies

                "max-len": ["warn", {
                    // Ignore pure JSX lines
                    ignorePattern: "^\\s*<",
                    ignoreComments: true,
                    code: 120,
                }],

                // This just uses the React plugin to help ESLint known when
                // variables have been used in JSX
                "react/jsx-uses-vars": ["error"],
                // Don't mark React as unused if we're using JSX
                "react/jsx-uses-react": ["error"],

                // Components in JSX should always be defined
                "react/jsx-no-undef": ["error"],

                // Assert spacing before self-closing JSX tags, and no spacing before
                // or after the closing slash, and no spacing after the opening
                // bracket of the opening tag or closing tag.
                // https://github.com/yannickcr/eslint-plugin-react/blob/HEAD/docs/rules/jsx-tag-spacing.md
                "react/jsx-tag-spacing": ["error"],

                // Empty interfaces are useful for declaring new names
                "@typescript-eslint/no-empty-interface": ["off"],

                // Always use `import type` for type-only imports
                "@typescript-eslint/consistent-type-imports": ["error"],
            },
        },
        {
            files: [
                "**/*.js",
            ],
            extends: [
                "plugin:matrix-org/javascript",
            ],
            rules: {
                "quotes": ["error", "double"],
            },
        },
    ],
};
