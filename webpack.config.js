var path = require('path')
var webpack = require('webpack')
var nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: [
    './src/index.tsx'
  ],
  module: {
    rules: [
      { test: /\.tsx?$/, exclude: /node_modules/, use: 'ts-loader' }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  output: {
    path: __dirname + '/build/js',
    publicPath: '/js/',
    filename: 'bundle.js'
  }
};
