"use strict";

const path = require("path");
const { RawSource } = require("webpack-sources");
const sheet = require("../sheet");

function Plugin(filename) {
  this.filename = filename;
}

Plugin.prototype.apply = function(compiler) {
  compiler.hooks.thisCompilation.tap("CSSPlugin", compilation => {
    compilation.hooks.normalModuleLoader.tap(
      "CSSPlugin",
      (loaderContext, module) => {
        loaderContext["@geekie/css"] = function() {
          module["@geekie/css"] = true;
        };
      }
    );

    compilation.hooks.additionalChunkAssets.tap("CSSPlugin", chunks => {
      const source = new RawSource(sheet.toCSS());
      if (!source.size()) {
        return;
      }

      const file = compilation.getPath(this.filename);
      compilation.assets[file] = source;

      for (const chunk of chunks) {
        for (const module of chunk.modulesIterable) {
          if (module["@geekie/css"]) {
            chunk.files.push(file);
            break;
          }
        }
      }
    });
  });
};

Plugin.loader = function(options) {
  return { loader: require.resolve("./loader"), options };
};

module.exports = Plugin;
