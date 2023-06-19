const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const { EnvironmentPlugin } = require("webpack");

module.exports = merge(common, {
  mode: "development",
  devtool: "eval-source-map",
  stats: "minimal",

  devServer: {
    static: ["./build/static", "./build/"],
    port: 3000,
    hot: true,
    historyApiFallback: {
      disableDotRule: true,
    },
  },

  plugins: [
    new ReactRefreshWebpackPlugin(),
    new EnvironmentPlugin({ REACT_APP_ENV: "development" }),
  ],
});
