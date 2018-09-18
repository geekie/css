/**
 * forked from cxs
 * https://github.com/cxs-css/cxs
 */

"use strict";

const hash = require("./hash");

let rules = [];
let classnames = new Map();
let ids = new Map();

module.exports = {
  process,
  toCSS() {
    return rules.sort().join("\n");
  },
  get rules() {
    return rules;
  },
  flush() {
    rules = [];
  },
  reset() {
    classnames = new Map();
    ids = new Map();
    rules = [];
  }
};

function process(obj, child = "", media = "") {
  const result = [];

  for (const key of Object.keys(obj)) {
    let value = obj[key];
    if (value == null || typeof value === "boolean" || value === "") {
      continue;
    }

    if (typeof value === "object") {
      const _media = key.startsWith("@") ? key : null;
      const _child = _media ? child : child + key;
      result.push(process(value, _child, _media || media));
      continue;
    }

    // Based on React's dangerousStyleValue
    if (
      typeof value === "number" &&
      value !== 0 &&
      !(isUnitlessNumber.hasOwnProperty(key) && isUnitlessNumber[key])
    ) {
      value = value + "px";
    } else {
      value = ("" + value).trim();
    }

    const cacheKey = key + value + child + media;

    if (classnames.has(cacheKey)) {
      result.push(classnames.get(cacheKey));
      continue;
    }

    const classname = getName(key, child, media, value);
    classnames.set(cacheKey, classname);
    rules.push(withMedia(rule(classname + child, key, value), media));

    result.push(classname);
  }

  return result.join(" ");
}

function getName(prop, child, media, value) {
  const cacheKey = hash(prop + child + media);
  if (!ids.has(cacheKey)) {
    ids.set(cacheKey, ids.size);
  }
  return `gk${ids.get(cacheKey)}_${hash(value.toString())}`;
}

function rule(className, prop, value) {
  prop = prop.replace(/[A-Z]|^ms-/g, "-$&").toLowerCase();
  return `.${className}{${prop}:${value}}`;
}

function withMedia(rule, media) {
  return media ? `${media}{${rule}}` : rule;
}

/**
 * Based on React's CSSProperty.js
 */
const isUnitlessNumber = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridArea: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,

  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true
};

/**
 * @param {string} prefix vendor-specific prefix, eg: Webkit
 * @param {string} key style name, eg: transitionDuration
 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
 * WebkitTransitionDuration
 */
function prefixKey(prefix, key) {
  return prefix + key.charAt(0).toUpperCase() + key.substring(1);
}

/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 */
const prefixes = ["Webkit", "ms", "Moz", "O"];

// Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
// infinite loop, because it iterates over the newly added props too.
for (const prop of Object.keys(isUnitlessNumber)) {
  prefixes.forEach(function(prefix) {
    isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
  });
}