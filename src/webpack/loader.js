"use strict";

const babel = require("@babel/core");
const loaderUtils = require("loader-utils");
const sheet = require("../sheet");
const plugin = require("../babel/plugin");

const parserOpts = {
  // https://babeljs.io/docs/en/next/babel-parser.html#plugins
  plugins: [
    // ECMAScript proposals
    "asyncGenerators",
    "bigInt",
    "classProperties",
    "classPrivateProperties",
    "classPrivateMethods",
    ["decorators", { decoratorsBeforeExport: true }],
    "doExpressions",
    "dynamicImport",
    "exportDefaultFrom",
    "exportNamespaceFrom",
    "functionBind",
    "functionSent",
    "importMeta",
    "logicalAssignment",
    "nullishCoalescingOperator",
    "numericSeparator",
    "objectRestSpread",
    "optionalCatchBinding",
    "optionalChaining",
    ["pipelineOperator", { proposal: "minimal" }],
    "throwExpressions",

    // Language extensions
    "jsx"
  ]
};

module.exports = function(source) {
  if (!/StyleSheet\.create/.test(source)) {
    return source;
  }

  const options = loaderUtils.getOptions(this);
  const { code, metadata } = babel.transform(source, {
    filename: this.resourcePath,
    babelrc: false,
    configFile: false,
    plugins: [[plugin, options]],
    parserOpts
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

  this.callback(null, code, null, { HERE: true });
};
