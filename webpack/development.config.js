module.exports = {
  mode : "development",

  chunkFilename : "[name].[chunkhash].js",
  mediaFilename : "[name].[hash:20].[ext]",

  // A full SourceMap is emitted as a separate file.
  // It adds a reference comment to the bundle so development tools know where to find it.
  // You should configure your server to disallow access to the Source Map file for normal users!
  devtool : "source-map",
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    // Externally reachable
    host : "0.0.0.0",
    devMiddleware: {
      writeToDisk: true
    }
  },

  publicPath: 'http://localhost:8080/'
};
