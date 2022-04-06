const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// let target = "web";
const plugins = [
  new HtmlWebpackPlugin({
    template: "./src/index.html",
    filename: "../index.html",
    inject: true
  }),
  new MiniCssExtractPlugin(),
];

const stylesHandler = MiniCssExtractPlugin.loader;

module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].[contenthash].js',
    path: path.resolve(__dirname, "build/static"),
    publicPath: "/static/",
    assetModuleFilename: "images/[hash][ext][query]",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: stylesHandler,
            options: { publicPath: "" },
          },
          "css-loader",
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpe?g|gif)$/i,
        type: "asset",
      },
    ],
  },
  plugins: plugins,
  optimization: {
    splitChunks: {
        chunks: "all",
    },
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", "jsx"],
  },
};
