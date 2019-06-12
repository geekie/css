"use strict";

module.exports = function createClassnames(process) {
  return function classnames() {
    const processed = new Map();
    let result = [];

    let curr;
    const args = flatten(Array.from(arguments));

    const styles = [];

    while (args.length > 0) {
      curr = args.pop();
      if (!curr) {
        continue;
      }

      if (typeof curr === "object") {
        // we're going through the arguments from right-to-left,
        // so we need to insert objects in the start
        styles.unshift(curr);
      } else if (typeof curr === "string") {
        const classnames = curr.split(/\s+/);
        for (let i = classnames.length - 1; i >= 0; i--) {
          const classname = classnames[i];
          const match = classname.match(/^gk[^-]+/);

          if (!match) {
            result.push(classname);
          } else if (!processed.has(match[0])) {
            processed.set(match[0], true);
            result.push(classname);
          }
        }
      }
    }

    if (styles.length) {
      const classname = process(styles);
      result.push(classname);
    }

    return result.sort().join(" ");
  };
};

function flatten(arr, result = []) {
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      flatten(arr[i], result);
    } else {
      result.push(arr[i]);
    }
  }

  return result;
}
