const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    mode: 'development',
    // added
    output: {
        path: "/mnt/c/Users/m4fav/Downloads/dist/js",
        filename: "[name].js",
    },
});