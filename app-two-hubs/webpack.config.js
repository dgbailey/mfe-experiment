const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const webpack = require('webpack');
require('dotenv').config({ path: '../.env' });

module.exports = {
  mode: 'development',
  devServer: {
    port: 4002,
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
        SENTRY_DSN_HOST: JSON.stringify(process.env.SENTRY_DSN_HOST),
        SENTRY_DSN_REMOTE1: JSON.stringify(process.env.SENTRY_DSN_REMOTE1),
        SENTRY_DSN_REMOTE2: JSON.stringify(process.env.SENTRY_DSN_REMOTE2),
        SENTRY_DSN_PING_SERVER: JSON.stringify(process.env.SENTRY_DSN_PING_SERVER),
      },
    }),
    new ModuleFederationPlugin({
      name: 'option2_host',
      remotes: {
        option2_remote1: 'option2_remote1@http://localhost:6001/remoteEntry.js',
        option2_remote2: 'option2_remote2@http://localhost:6002/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
        '@sentry/browser': { singleton: true, eager: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};