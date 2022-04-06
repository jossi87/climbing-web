const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const additionalPulgins = [
    new ReactRefreshWebpackPlugin(),
]

additionalPulgins.forEach(plugin => common.plugins.push(plugin));

 module.exports = merge(common, {
   mode: 'development',
   devtool: 'eval-source-map',
   stats: "minimal",

   devServer: {
    static: "./build/static",
    port: 3000,
    hot: true,
    historyApiFallback: {
      disableDotRule: true,
    },
  },
  
 });