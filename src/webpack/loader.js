"use strict";

const babel = require("@babel/core");
const loaderUtils = require("loader-utils");
const sheet = require("../sheet");
const plugin = require("../babel/plugin");

module.exports = function(source) {
  const options = loaderUtils.getOptions(this);

  const { code, metadata } = babel.transform(source, {
    filename: this.resourcePath,
    plugins: [plugin]
  });

  if (!metadata.gkcss || !metadata.gkcss.changed) {
    return source;
  }

  if (this["@geekie/css"]) {
    this["@geekie/css"]();
  }

  for (const dependency of metadata.gkcss.dependencies) {
    this.addDependency(dependency);
  }

  this.callback(null, code, null, {HERE: true});
};
