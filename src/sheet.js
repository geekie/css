"use strict";

let tags = [];
let ctr = 0;

module.exports = { insert, reset };

function insert(rules) {
  if (!rules || !rules.length) {
    return;
  }

  let tag = currentTag();
  let sheet = getSheet(tag);

  if (sheet.insertRule) {
    for (const rule of rules) {
      try {
        sheet.insertRule(rule, sheet.cssRules.length);
        ctr++;
      } catch (e) {
        // Selector incompatible with browser
      }

      if (ctr % 40000 === 0) {
        tags.push(createTag());
        sheet = currentSheet();
      }
    }
  } else {
    tag.innerText = (tag.innerText || "") + rules.join("");
  }
}

function reset() {
  tags.forEach(tag => tag.parentNode.removeChild(tag));
  tags = [];
  ctr = 0;
}

function currentTag() {
  if (tags.length === 0) {
    tags.push(createTag());
  }

  return tags[tags.length - 1];
}

function getSheet(tag) {
  if (tag.sheet) {
    return tag.sheet;
  }

  for (let i = 0; i < document.styleSheets.length; i++) {
    if (document.styleSheets[i].ownerNode === tag) {
      return document.styleSheets[i];
    }
  }
}

function createTag() {
  const tag = document.createElement("style");
  tag.type = "text/css";
  tag.setAttribute("data-gkcss", "");
  tag.appendChild(document.createTextNode(""));
  (document.head || document.getElementsByTagName("head")[0]).appendChild(tag);
  return tag;
}
