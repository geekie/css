"use strict";

let tag;

function createTag() {
  const tag = document.createElement("style");
  tag.type = "text/css";
  tag.appendChild(document.createTextNode(""));
  (document.head || document.getElementsByTagName("head")[0]).appendChild(tag);
  return tag;
}

function insert(rules) {
  if (!tag) {
    tag = createTag();
  }

  const sheet = tag.styleSheet || tag.sheet;
  if (sheet.insertRule) {
    let c = sheet.cssRules.length;
    for (const rule of rules) {
      try {
        sheet.insertRule(rule, c++);
      } catch (e) {
        // Selector incompatible with browser
      }
    }
  } else {
    tag.innerText = (tag.innerText || "") + rules.join("");
  }
}

module.exports = {
  insert
};
