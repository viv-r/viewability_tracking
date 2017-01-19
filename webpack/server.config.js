const configuration = require("./config");
const fs = require("fs");

module.exports = Object.assign({}, configuration, {
    entry: "./src/server.ts",
    target: "node",
    output: {
        filename: "./out/server.js"
    },
    externals: fs.readdirSync("./node_modules")
});
