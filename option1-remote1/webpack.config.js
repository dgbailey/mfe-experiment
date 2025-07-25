const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const webpack = require('webpack');
require('dotenv').config({ path: '../.env' });

module.exports = {
  mode: 'development',
  devServer: {
    port: 5001,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization, sentry-trace, baggage',
      'Access-Control-Expose-Headers': 'sentry-trace, baggage',
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        SENTRY_DSN_REMOTE1: JSON.stringify(process.env.SENTRY_DSN_REMOTE1),
      },
    }),
    new ModuleFederationPlugin({
      name: 'option1_remote1',
      filename: 'remoteEntry.js',
      exposes: {
        './Component': './src/Component',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        '@sentry/browser': { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};