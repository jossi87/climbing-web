var path = require('path')
var webpack = require('webpack')
var nodeExternals = require('webpack-node-externals')

var browserConfig = {
  entry: './src/browser/index.js',
  output: {
    path: path.resolve(__dirname, 'build/js'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader' },
      { test: /\.jsx?$/, exclude: /node_modules/, use: {loader: 'babel-loader'} },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({__isBrowser__: "true"}),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
}

var serverConfig = {
  entry: './src/server/index.js',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: __dirname,
    filename: 'server.js',
    publicPath: '/'
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      { test: /\.jsx?$/, exclude: /node_modules/, use: {loader: 'babel-loader'} },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({__isBrowser__: "false"}),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
}

module.exports = [browserConfig, serverConfig]
