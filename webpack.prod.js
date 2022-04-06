const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

const additionalPulgins = [
    new WorkboxWebpackPlugin.GenerateSW(),
]

additionalPulgins.forEach(plugin => common.plugins.push(plugin));

 module.exports = merge(common, {
   mode: 'production',
 });