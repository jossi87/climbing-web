const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    './src/index.tsx'
  ],
  module: {
    rules: [
      { test: /\.tsx?$/, exclude: /node_modules/, use: 'ts-loader' },
      { test: /\.css$/, use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]},
      {test:/\.svg$/, use:'url-loader'},
      {test:/\.woff$/, use:'url-loader'},
      {test:/\.woff2$/, use:'url-loader'},
      {test:/\.[ot]tf$/, use:'url-loader'},
      {test:/\.eot$/, use:'url-loader'},
      {test:/\.png$/, use:'url-loader'},
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
  ],
  output: {
    path: __dirname + '/build/js',
    publicPath: '/js/',
    filename: 'bundle.[contenthash].js'
  }
};
