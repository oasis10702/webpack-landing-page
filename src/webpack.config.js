const path = require('path');
const I18nPlugin = require('i18n-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { getHtmlPlugins, getRobotsPlugins, getSitemapPlugin } = require('./utils/webpack');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const { routes } = require('./config/router');
const { languages } = require('./locales');

const devMode = process.env.NODE_ENV !== 'production';
const flavor = process.env.FLAVOR || 'local';
const host = process.env.HOST;
const flavorConfig = require(`./config/${flavor}`)(host);
const { PUBLIC_URL } = flavorConfig;
const buildPath = path.resolve(__dirname, '../build');
const minimizer = [
  new UglifyJsPlugin({
    cache: true,
    parallel: true,
    sourceMap: true
  }),
  new OptimizeCSSAssetsPlugin({})
];

module.exports = Object.keys(languages).map(language => ({
  mode: devMode ? 'development' : 'production',
  entry: ['@babel/polyfill', './src/js/index.js'],
  output: {
    filename: 'assets/js/[name].[hash].js',
    path: buildPath,
    publicPath: PUBLIC_URL
  },
  devtool: devMode ? 'inline-source-map' : 'source-map',
  devServer: {
    contentBase: buildPath,
    port: 5566,
    open: true
  },
  optimization: {
    minimize: !devMode,
    minimizer: devMode ? [] : minimizer
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader'
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [require('autoprefixer')()]
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: './assets/images',
          publicPath: '/assets/images'
        }
      }
    ]
  },
  plugins: [
    new I18nPlugin(languages[language]),
    new CopyWebpackPlugin([{ from: './src/assets', to: 'assets' }]),
    new ImageminPlugin({
      disable: process.env.NODE_ENV !== 'production',
      test: /\.(jpe?g|png|gif)$/i
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? 'assets/css/[name].css' : 'assets/css/[name].[hash].css'
    }),
    ...getHtmlPlugins(
      Object.keys(routes).map(key => ({
        path: routes[key].path,
        template: routes[key].template
      })),
      languages[language],
      flavorConfig,
      devMode
    ),
    getRobotsPlugins(PUBLIC_URL, flavor),
    getSitemapPlugin(buildPath, PUBLIC_URL, flavor)
  ].filter(Boolean)
}));
