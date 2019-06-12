"use strict";

const createMarkupForStyles = require("./src/style");
const dangerousStyleValue = require("./src/style/dangerousStyleValue");
const walk = require("./src/walkObject");
const hash = require("./src/hash");

let rules = [];
let classnamesCache = new Map();
let propIds = new Map();

module.exports = {
  process,
  toCSS: () => rules.join("\n"),
  flush() {
    const css = rules.join("\n");
    rules = [];
    classnamesCache = new Map();
    return css;
  },
  reset() {
    rules = [];
    classnamesCache = new Map();
    propIds = new Map();
  }
};

function process(src, prettify) {
  const classnames = [];

  for (const [media, selector, prop, value] of walk(src, true)) {
    const cacheKey = media + selector + prop + value;

    if (classnamesCache.has(cacheKey)) {
      classnames.push(classnamesCache.get(cacheKey));
      continue;
    }

    const [classname, rule] = makeRule(media, selector, prop, value, prettify);
    classnamesCache.set(cacheKey, classname);
    classnames.push(classname);
    rules.push(rule);
  }

  return classnames.join(" ");
}

function makeRule(media, selector, prop, value, prettify) {
  const cacheKey = media + selector + prop;
  if (!propIds.has(cacheKey)) {
    propIds.set(cacheKey, propIds.size.toString(36));
  }

  let id;
  if (prettify) {
    const _value = dangerousStyleValue(prop, value);
    let cleanValue = classnamify(_value);
    if (!cleanValue) {
      cleanValue = hash(_value);
    }

    id = [media, selector, prop]
      .map(classnamify)
      .filter(Boolean)
      .concat(
        /[^_a-zA-Z0-9-]/.test(value)
          ? hash(value.toString())
          : dangerousStyleValue(prop, value)
      )
      .join("-");
  } else {
    id = hash(dangerousStyleValue(prop, value));
  }

  const classname = `gkcss${propIds.get(cacheKey)}-${id}`;

  const markup = createMarkupForStyles({ [prop]: value });
  let rule = `.${classname}${selector}{${markup}}`;
  if (media) {
    rule = `${media}{${rule}}`;
  }

  return [classname, rule];
}

function classnamify(str) {
  return str.replace(/^[^\d\w-_]+|[^\d\w]+$/g, "").replace(/[^\d\w-_]+/g, "_");
}
