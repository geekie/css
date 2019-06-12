"use strict";

module.exports = function* walk(src, yieldForEveryProp) {
  let obj;
  const queue = [[src, /* selector */ "", /* media */ ""]];

  while (queue.length) {
    const [src, selector, media] = queue.shift();

    for (const key of Object.keys(src)) {
      let value = src[key];

      if (value == null || typeof value === "boolean") {
        continue;
      }

      if (typeof value === "object") {
        if (key.indexOf("@media") === 0) {
          queue.push([value, selector, key]);
        } else {
          queue.push([value, selector + key, media]);
        }

        continue;
      }

      if (yieldForEveryProp) {
        yield [media, selector, key, value];
      } else {
        obj = obj || {};
        obj[key] = value;
      }
    }

    if (!yieldForEveryProp && obj) {
      yield [media, selector, obj];
      obj = undefined;
    }
  }
};
