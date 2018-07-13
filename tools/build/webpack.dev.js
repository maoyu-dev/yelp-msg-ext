const $ = require('./helpers');
const uglifyJSPlugin = require('uglifyjs-webpack-plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'node',
  entry: {
    'yelp-msg-ext-query-command': $.root('./src/yelp-msg-ext-query-command/index.ts')
  },
  output: {
    path: $.root('dist'),
    filename: '[name]/[name].js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'awesome-typescript-loader?declaration=false',
        exclude: [/\.(spec|e2e)\.ts$/]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: [
      'node_modules',
      'src'
    ]
  },
  plugins: [
    new copyWebpackPlugin([
      {
        from: 'src/host.json',
        to: 'host.json'
      },
      {
        context: 'src',
        from: '**/function.json',
        to: ''
      }
    ])
  ],
  node: {
    __filename: false,
    __dirname: false,
  }
};
