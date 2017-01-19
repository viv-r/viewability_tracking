const configuration = require("./config");

module.exports = Object.assign({}, configuration, {
    entry: "./src/client.tsx",
    output: {
        filename: "./out/client.js"
    },
});
