const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const additionalPulgins = [
]

additionalPulgins.forEach(plugin => common.plugins.push(plugin));

 module.exports = merge(common, {
   mode: 'production',
 });