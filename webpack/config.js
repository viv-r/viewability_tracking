const configuration = {
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    module: {
        rules: [{
            test: /\.tsx?/,
            loader: "awesome-typescript-loader",
            options: {
                configFileName: "tsconfig.json"
            }
        }],
    },
    watch: true,
    bail: true,
    stats: {
        errorDetails: true
    }
};

module.exports = configuration;
