const webpack = require("webpack");

const path = require("path");

const jsx_rule = {
  test: /\.jsx?$/,
  use: [
    { loader: "cache-loader" },
    {
      loader: "@sucrase/webpack-loader",
      options: { transforms: ["jsx"] },
    },
  ],
};

const RunNodeWebpackPlugin = require("run-node-webpack-plugin");

const WebpackNodeExternals = require("webpack-node-externals");

const node_common_config = {
  entry: "./src/main.js",
  target: "node",
  module: { rules: [jsx_rule] },
  externals: [WebpackNodeExternals()],
};

const node_dev_config = {
  ...node_common_config,
  mode: "development",
  output: { path: path.join(__dirname, "dist"), filename: "main.js" },
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    new webpack.BannerPlugin('require("source-map-support").install();', {
      raw: true,
      entryOnly: false,
    }),
    new RunNodeWebpackPlugin(),
  ],
};

const node_prod_config = {
  ...node_common_config,
  mode: "production",
  output: { path: path.join(__dirname, "dist"), filename: "main.min.js" },
  plugins: [new webpack.IgnorePlugin(/\.(css|less)$/)],
};

const node_config = function (env) {
  if (env.prod) {
    return node_prod_config;
  } else {
    return node_dev_config;
  }
};

module.exports=node_config;