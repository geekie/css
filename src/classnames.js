"use strict";

function flatten(array) {}

module.exports = function classnames() {
  const processed = new Map();
  let result = [];

  let curr;
  const q = Array.from(arguments);
  while (q.length > 0) {
    curr = q.pop();
    if (!curr) {
      continue;
    }

    if (Array.isArray(curr)) {
      Array.prototype.push.apply(q, curr);
      continue;
    }

    const classnames = curr.split(/\s+/);
    for (let i = classnames.length - 1; i >= 0; i--) {
      const classname = classnames[i];
      const match = classname.match(/^gk\d+_/);
      let prefix = null;

      if (!match) {
        const prettyMatch = classname.match(/^gkp(\d+)_/);
        if (prettyMatch) {
          prefix = classname.substring(
            0,
            prettyMatch[0].length + parseInt(prettyMatch[1]),
          );
        }
      } else {
        prefix = match[0];
      }

      if (!prefix) {
        result.push(classname);
      } else if (!processed.has(prefix)) {
        processed.set(prefix, true);
        result.push(classname);
      }
    }
  }

  return result.sort().join(" ");
};
