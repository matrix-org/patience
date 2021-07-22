process.env.NODE_ENV = "test";

// This file is (perhaps confusingly) currently used by _downstream consumers_
// who are running _their own_ tests via the `patience` command.

module.exports = {
    plugins: [require("@snowpack/web-test-runner-plugin")()],
};
