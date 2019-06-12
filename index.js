"use strict";

const createMarkupForStyles = require("./src/style");
const createClassnames = require("./src/classnames");
const hash = require("./src/hash");
const walk = require("./src/walkObject");
const sheet = require("./src/sheet");

exports.StyleSheet = {
  create: obj => obj
};

exports.css = exports.classnames = createClassnames(process);

let cache = new Map();

function process(styles) {
  const src = {};
  styles.forEach(function(obj) {
    for (const [media, selector, style] of walk(obj)) {
      let dest = src;
      if (media) {
        dest = dest[media] = dest[media] || {};
      }
      if (selector) {
        dest = dest[selector] = dest[selector] || {};
      }
      Object.assign(dest, style);
    }
  });

  const id = hash(JSON.stringify(src));

  if (cache.has(id)) {
    return cache.get(id);
  }

  const classname = `css-${id}`;
  cache.set(id, classname);
  sheet.insert(getRules(src, classname));

  return classname;
}

function getRules(src, classname) {
  const rules = [];

  for (const [media, selector, style] of walk(src)) {
    let rule = createMarkupForStyles(style);
    if (!rule) {
      continue;
    }
    rule = `.${classname}${selector}{${rule}}`;
    if (media) {
      rule = `${media}{${rule}}`;
    }
    rules.push(rule);
  }

  return rules;
}

// for tests
exports.reset = function reset() {
  cache = new Map();
  sheet.reset();
}
