var path = require('path')
var webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

module.exports = [{
  entry: './src/index.tsx',
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
    new webpack.DefinePlugin({__isBrowser__: "true"}), new BundleAnalyzerPlugin()
  ]
}]