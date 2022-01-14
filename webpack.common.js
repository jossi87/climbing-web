const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin').default;

module.exports = {
  entry: [
    './src/index.tsx'
  ],
  module: {
    rules: [
      { test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules\/(?!(@react-leaflet|react-leaflet)\/)/i,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
          }
        }
      },
      { test: /\.css$/, use: [
        {loader: MiniCssExtractPlugin.loader},
        {loader: 'css-loader'}
      ]},
      { test: /\.(jpg|png|gif|woff|eot|ttf|svg)/, type: 'asset/resource' }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
       template: './src/index.html',
       filename: '../index.html'
    }),
    new MiniCssExtractPlugin({
      filename:'style.[contenthash].css'
    }),
  ],
  output: {
    path: __dirname + '/build/static',
    publicPath: '/static/',
    filename: '[name].[contenthash].js',
    chunkFilename: "chunk-[name].[chunkhash].js",
  }
};
