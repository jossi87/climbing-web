const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const { EnvironmentPlugin } = require("webpack");

module.exports = merge(common, {
  mode: "production",
  plugins: [new EnvironmentPlugin({ REACT_APP_ENV: "production" })],
});
