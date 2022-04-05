const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack')
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const additionalPulgins = [
    new ReactRefreshWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
]

additionalPulgins.forEach(plugin => common.plugins.push(plugin));

 module.exports = merge(common, {
   mode: 'development',
   devtool: 'eval-source-map',
   devServer: {
    static: "./build/static",
    port: 3000,
    hot: true,
  },
 });