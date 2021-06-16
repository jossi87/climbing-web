const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: [
    './src/index.tsx'
  ],
  module: {
    rules: [
      { test: /\.tsx?$/, exclude: /node_modules/, use: 'ts-loader' },
      { test: /\.css$/, use: [
        {loader: MiniCssExtractPlugin.loader},
        {loader: 'css-loader'}
      ]},
      { test: /\.(jpg|png|gif|woff|eot|ttf|svg)/, use: 'file-loader' }
    ]
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx"]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
       template: './src/index.html',
       filename: '../index.html'
    }),
    new MiniCssExtractPlugin(),
  ],
  output: {
    path: __dirname + '/build/static',
    crossOriginLoading: "anonymous",
    publicPath: '/static/',
    chunkFilename: '[id].[hash].js',
    filename: '[name].[contenthash].js'
  }
};
