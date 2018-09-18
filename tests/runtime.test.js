/**
 * @jest-environment jsdom
 */

"use strict";

const React = require("react");
const ReactDOM = require("react-dom");
const ReactTestUtils = require("react-dom/test-utils");

const { StyleSheet, classnames: cn, reset } = require("../");

function childStyle(node, p = null) {
  return window.getComputedStyle(node.childNodes[0], p);
}

let container;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
  reset();
});

test("works", () => {
  const styles = StyleSheet.create({
    bgGreen: {
      backgroundColor: "green"
    }
  });

  const node = ReactDOM.render(
    <div className={cn(styles.bgGreen)} />,
    container
  );

  expect(node.getAttribute("class")).toMatchInlineSnapshot(`"gk0_bf54id"`);
  expect(window.getComputedStyle(node).backgroundColor).toEqual("green");
});
