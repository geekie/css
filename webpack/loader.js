"use strict";

const babel = require("@babel/core");
const loaderUtils = require("loader-utils");
const babelPlugin = require("../babel");

module.exports = function(source) {
  if (!/StyleSheet\.create/.test(source)) {
    return source;
  }

  const options = loaderUtils.getOptions(this) || {};
  options.prettify = this.mode !== "production";

  const { code, metadata } = babel.transform(source, {
    filename: this.resourcePath,
    babelrc: false,
    configFile: false,
    plugins: [[babelPlugin, options]]
  });

  if (!metadata.gkcss || !metadata.gkcss.css) {
    return source;
  }

  this[__dirname] && this[__dirname](metadata.gkcss.css.split("\n"));

  for (const dependency of metadata.gkcss.dependencies) {
    this.addDependency(dependency);
  }

  this.callback(null, code, null);
};
