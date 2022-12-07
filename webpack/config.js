import path from 'path';
import { fileURLToPath } from 'url';
// https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const BundleAnalyzerPlugin =
// require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const environmentConfig = await import(`./${process.env.NODE_ENV}.config.js`);

const config = {
  mode: environmentConfig.mode,

  entry: './src/index.ts',

  module: {
    rules: [
      { test: /\.(ts)$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.(exr)$/i, type: 'asset/resource' },
      { test: /\.glsl$/, loader: 'webpack-glsl-loader' }
    ],
  },

  resolve: { extensions: ['*', '.ts', '.js'] },

  // plugins: [
  // new BundleAnalyzerPlugin()
  // ],

  experiments: {
    outputModule: true,
  },

  output: {
    library: { type: 'module' },
    path: path.resolve(__dirname, '../dist'),
    publicPath: environmentConfig.publicPath,
    filename: 'index.js',
    assetModuleFilename: `assets/${environmentConfig.mediaFilename}`,
    chunkFilename: `chunks/${environmentConfig.chunkFilename}`,
    clean: true
  },

  devtool: environmentConfig.devtool,
  devServer: environmentConfig.devServer,
};

export default config;