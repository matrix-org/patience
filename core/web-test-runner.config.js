const fs = require("fs");

process.env.NODE_ENV = "test";

// This file is (perhaps confusingly) currently used by _downstream consumers_
// who are running _their own_ tests via the `patience` command.

module.exports = {
    plugins: [require("@snowpack/web-test-runner-plugin")()],
    testRunnerHtml: testFramework => {
        const html = fs.readFileSync("./src/index.html", "utf8");
        return html.replace("${testFramework}", testFramework);
    },
};
