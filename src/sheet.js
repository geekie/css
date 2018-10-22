/**
 * forked from cxs
 * https://github.com/cxs-css/cxs
 */

"use strict";

const hash = require("./hash");

let rules = [];
let classnames = new Map();
let ids = new Map();
let prettyIds = new Map();

module.exports = {
  process,
  toCSS() {
    return rules.sort().join("\n");
  },
  get rules() {
    return rules;
  },
  flush() {
    const curr = rules;
    rules = [];
    return curr;
  },
  reset() {
    classnames = new Map();
    ids = new Map();
    prettyIds = new Map();
    rules = [];
  }
};

function process(obj, child = "", media = "", options) {
  const result = [];

  for (const key of Object.keys(obj)) {
    let value = obj[key];
    if (value == null || typeof value === "boolean" || value === "") {
      continue;
    }

    if (typeof value === "object") {
      const _media = key.startsWith("@") ? key : null;
      const _child = _media ? child : child + key;
      result.push(process(value, _child, _media || media, options));
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

    const classname = getName(key, child, media, value, options);
    classnames.set(cacheKey, classname);
    rules.push(withMedia(rule(classname + child, key, value), media));

    result.push(classname);
  }

  return result.join(" ");
}

function getName(prop, child, media, value, options) {
  const cacheKey = hash(prop + child + media);
  if (!ids.has(cacheKey)) {
    let prefix = ids.size;
    if (options && options.prettyClassNames) {
      prefix = prettyIdentifier([media, child, prop].filter(x => x).join('_'));
      prefix = `p${prefix.length}_${prefix}`;
    }

    ids.set(cacheKey, prefix);
  }

  const suffix = (options && options.prettyClassNames)
    ? prettyIdentifier(value.toString())
    : hash(value.toString());

  return `gk${ids.get(cacheKey)}_${suffix}`;
}

function prettyIdentifier(value) {
  const cssIdentifier = value.replace(/[^_a-zA-Z0-9-]/g, '_');
  if (!prettyIds.has(cssIdentifier) || prettyIds.get(cssIdentifier) === value) {
    prettyIds.set(cssIdentifier, value);
    return cssIdentifier;
  } else {
    // too bad. The sanitized css string constructed from this value collides
    // with another sanitized css string constructed from another value. Simply
    // append a hash to ensure uniqueness
    return cssIdentifier + '_' + hash(value);
  }
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
