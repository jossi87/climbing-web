// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const webpack = require("webpack");

new webpack.EnvironmentPlugin(['NODE_ENV'])


// let target = "web";
const plugins = [
    new HtmlWebpackPlugin({
        template: './src/index.html',
    }),
    new MiniCssExtractPlugin(),
    new ReactRefreshWebpackPlugin(),
]

if (process.env.NODE_ENV == "production") {
    plugins.pop(2) // removes ReactRefresh when its production;
    plugins.push(new WorkboxWebpackPlugin.GenerateSW())
} 


const stylesHandler = MiniCssExtractPlugin.loader;



module.exports = {
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'build/static'),
        assetModuleFilename: "images/[hash][ext][query]",
        clean: true,
    },
    module: {
        rules: [
            { test: /\.(jsx?|tsx?)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
            //   options: {
            //     presets: [
            //       "@babel/preset-env",
            //       "@babel/preset-react",
            //       "@babel/preset-typescript",
            //     ],
            //   }
            }
          },
            {
                test: /\.css$/i,
                use: [
                    {
                    loader: stylesHandler,
                    options: { publicPath: "" }
                    },
                'css-loader'
            ],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpe?g|gif)$/i,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
    plugins: plugins,
    devtool: "source-map",
    resolve: {
        extensions: ['.tsx', '.ts', '.js', 'jsx'],
    },
    devServer: {
        static: "./build/static",
        port: 3000,
        hot: true,
    },
};
