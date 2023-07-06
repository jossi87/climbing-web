const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const { merge } = require("webpack-merge");
const prod = require("./webpack.prod.js");
const { EnvironmentPlugin } = require("webpack");

module.exports = merge(prod, {
  plugins: [
    new EnvironmentPlugin({ REACT_APP_ENV: "production" }),
    new BundleAnalyzerPlugin(),
  ],
});
