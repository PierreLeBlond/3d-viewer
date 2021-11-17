const path = require('path');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = require(`./${process.env.NODE_ENV}.config`);

module.exports = {
  mode: config.mode,

  entry: './src/index.ts',

  module: {
    rules: [
      {
        test: /\.(ts)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(exr)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.glsl$/,
        loader: 'webpack-glsl-loader'
      }
    ],
  },

  resolve: {
    extensions: ['*', '.ts', '.js']
  },

  // plugins: [
    // new BundleAnalyzerPlugin()
  // ],

  experiments: {
    outputModule: true,
  },

  output: {
    library: {
      type: 'module'
    },
    path: path.resolve(__dirname, '../dist'),
    publicPath: config.publicPath,
    filename: 'index.js',
    assetModuleFilename: `assets/${config.mediaFilename}`,
    chunkFilename : `chunks/${config.chunkFilename}`,
    clean: true
  },

  devtool: config.devtool,
  devServer: config.devServer,
};

