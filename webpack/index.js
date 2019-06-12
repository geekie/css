"use strict";

const path = require("path");
const { RawSource } = require("webpack-sources");

module.exports = Plugin;

function Plugin(filename) {
  this._filename = filename;
}

Plugin.loader = require.resolve("./loader");

Plugin.prototype.apply = function(compiler) {
  compiler.hooks.thisCompilation.tap("GkCssPlugin", compilation => {
    let source;

    compilation.hooks.normalModuleLoader.tap(
      "GeekieCSSPlugin",
      (loaderContext, module) => {
        loaderContext[__dirname] = function(css) {
          module[__dirname] = css;
        };
      }
    );

    compilation.hooks.finishModules.tap("GkCssPlugin", modules => {
      let rules = flatten(modules.map(m => m[__dirname]).filter(Boolean));
      if (rules.length) {
        rules = Array.from(new Set(rules).values());
        source = new RawSource(rules.join("\n"));
      }
    });

    compilation.hooks.additionalChunkAssets.tap("GkCssPlugin", chunks => {
      if (!source || !source.size()) {
        return;
      }

      const file = compilation.getPath(this._filename);
      compilation.assets[file] = source;

      for (const chunk of chunks) {
        for (const module of chunk.modulesIterable) {
          if (module[__dirname]) {
            chunk.files.push(file);
            break;
          }
        }
      }

      source = undefined;
    });
  });
};

function flatten(arr, result = []) {
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      flatten(arr[i], result);
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}
