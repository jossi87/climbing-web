var path = require('path')
var webpack = require('webpack')
var nodeExternals = require('webpack-node-externals')

var browserConfig = {
  entry: './src/browser/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build/js'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: [".ts", ".tsx", ".json", ".js"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, exclude: /node_modules/, use: 'ts-loader' },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({__isBrowser__: "true"})
  ]
}

var serverConfig = {
  entry: './src/server/index.tsx',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: __dirname,
    filename: 'server.js',
    publicPath: '/'
  },
  resolve: {
    extensions: [".ts", ".tsx", ".json", ".js"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, exclude: /node_modules/, use: 'ts-loader' },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({__isBrowser__: "false"})
  ]
}

module.exports = [browserConfig, serverConfig]
