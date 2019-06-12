/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";

const dangerousStyleValue = require("./dangerousStyleValue");
const hyphenateStyleName = require("./hyphenateStyleName");

const styleNameCache = {};
function processStyleName(styleName) {
  if (styleNameCache.hasOwnProperty(styleName)) {
    return styleNameCache[styleName];
  }
  const result = hyphenateStyleName(styleName);
  styleNameCache[styleName] = result;
  return result;
}

module.exports = function createMarkupForStyles(styles) {
  let serialized = "";
  let delimiter = "";
  for (const styleName of Object.keys(styles)) {
    const isCustomProperty = styleName.indexOf("--") === 0;
    const styleValue = styles[styleName];
    if (styleValue != null) {
      serialized += delimiter + processStyleName(styleName) + ":";
      serialized += dangerousStyleValue(
        styleName,
        styleValue,
        isCustomProperty
      );

      delimiter = ";";
    }
  }
  return serialized || null;
};
