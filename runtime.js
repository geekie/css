"use strict";

const sheet = require("./src/sheet");
const browser = require("./src/browser");

module.exports.StyleSheet = {
  create(styles) {
    const result = {};
    for (const key of Object.keys(result)) {
      result[key] = sheet.process(styles[key]);
    }
    browser.insert(sheet.flush());
    return result;
  }
};
module.exports.classnames = require("./src/classnames");
