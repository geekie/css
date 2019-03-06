"use strict";

const sheet = require("../src/sheet");
const browser = require("../src/browser");

module.exports.createExports = function(options) {
  const exports = {};

  exports.StyleSheet = {
    create(styles) {
      const result = {};
      for (const key of Object.keys(styles)) {
        const originalClassName = ((options && options.addOriginalClassName) !== false) ? `_${key} ` : '';
        result[key] = originalClassName + sheet.process(styles[key], undefined, undefined, options);
      }
      browser.insert(sheet.flush());
      return result;
    }
  };
  exports.classnames = require("../src/classnames");
  exports.reset = function() {
    sheet.reset();
  };

  return exports;
}

