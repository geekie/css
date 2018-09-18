"use strict";

module.exports = function css() {
  const processed = new Map();
  let result = [];

  for (let i = arguments.length - 1; i >= 0; i--) {
    let classnames = arguments[i];

    if (!classnames) {
      continue;
    }

    if (typeof classnames === "string") {
      classnames = classnames.split(/\s+/);
    }

    classnames.forEach(function(classname) {
      const match = classname.match(/^gk\d+/);

      if (!match) {
        result.unshift(classname);
      } else if (!processed.has(match[0])) {
        processed.set(match[0], true);
        result.push(classname);
      }
    });
  }

  return result.join(" ");
};
