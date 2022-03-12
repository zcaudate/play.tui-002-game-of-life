var webpack = require("webpack");

var path = require("path");

var jsx_rule = {
  "test":/\.jsx?$/,
  "use":[
    {"loader":"cache-loader"},
    {
    "loader":"@sucrase/webpack-loader",
    "options":{"transforms":["jsx"]}
  }
  ]
};

var RunNodeWebpackPlugin = require("run-node-webpack-plugin");

var WebpackNodeExternals = require("webpack-node-externals");

var node_common_config = {
  "entry":"./src/main.js",
  "target":"node",
  "module":{"rules":[jsx_rule]},
  "externals":[WebpackNodeExternals()]
};

function node_dev_config({provide}){
  return Object.assign({},node_common_config,{
    "mode":"development",
    "output":{"path":path.join(__dirname,"dist"),"filename":"main.js"},
    "plugins":[
        new webpack.BannerPlugin(
          "require(\"source-map-support\").install();",
          {"raw":true,"entryOnly":false}
        ),
        provide ? new webpack.ProvidePlugin(provide) : null,
        new RunNodeWebpackPlugin()
      ].filter(function (x){
        return x;
      })
  });
}

var node_prod_config = Object.assign({},node_common_config,{
  "mode":"production",
  "output":{"path":path.join(__dirname,"dist"),"filename":"main.min.js"},
  "plugins":[]
});

var node_config = function (env){
  if(env.prod){
    return node_prod_config;
  }
  else{
    return node_dev_config({});
  }
};

module.exports = node_config