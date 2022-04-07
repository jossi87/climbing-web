const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");

// let target = "web";
const plugins = [
  new HtmlWebpackPlugin({
    template: "./src/index.html",
    filename: "index.html",
    inject: true
  }),
  new MiniCssExtractPlugin({
    filename: 'static/[name].css'
  }),
  new CleanWebpackPlugin({
    cleanOnceBeforeBuildPatterns: [
      '**/*',
      '!favicon.ico*',
      '!google1588c034b4869b96.html',
      '!gpl-3.0.txt',
      '!png/**',
      '!pdf/**'
  ],

  })
];

const stylesHandler = MiniCssExtractPlugin.loader;

module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: 'static/[name].bundle.js',
    chunkFilename: 'static/[name].[contenthash].js',
    path: path.resolve(__dirname, "build"),
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: [ /node_modules\/(?!(@react-leaflet|react-leaflet)\/)/i, /node_modules/,],
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: stylesHandler,
            options: {
              publicPath: "/build/static/"
            }
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
