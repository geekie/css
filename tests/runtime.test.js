"use strict";

const React = require("react");
const { render, unmountComponentAtNode } = require("react-dom");
const { css, reset } = require("../");

let container;

global.__DEV__ = true;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  unmountComponentAtNode(container);
  document.body.removeChild(container);
  container = null;
  reset();
});

test("applies the style", () => {
  const node = render(
    <div className={css({ backgroundColor: "#f00" })} />,
    container
  );
  expect(node).toMatchInlineSnapshot(`
    <div
      class=css-1rk6930
    />
  `);
  expect(window.getComputedStyle(node).backgroundColor).toEqual(
    "rgb(255, 0, 0)"
  );
});

test("it concatenates when passing other string", () => {
  const node = render(
    <div className={css("foobar", { backgroundColor: "#0f0" })} />,
    container
  );
  expect(node).toMatchInlineSnapshot(`
    <div
      class=css-1j3zyhl foobar
    />
  `);
  expect(window.getComputedStyle(node).backgroundColor).toEqual(
    "rgb(0, 255, 0)"
  );
});

test("it selects only the last atomic class by prefix", () => {
  const node = render(
    <div
      className={css("gkcssa8-fo0b4r", "gkcssa8-f0obar", {
        backgroundColor: "#0f0"
      })}
    />,
    container
  );
  expect(node).toMatchInlineSnapshot(`
    <div
      class=css-1j3zyhl gkcssa8-f0obar
    />
  `);
  expect(window.getComputedStyle(node).backgroundColor).toEqual(
    "rgb(0, 255, 0)"
  );
});

test("it merges styles correctly", () => {
  const node = render(
    <div
      className={css(
        { backgroundColor: "#0f0" },
        { backgroundColor: "#00f", color: "#ff0" }
      )}
    />,
    container
  );
  expect(node).toMatchInlineSnapshot(`
    <div
      class=css-bna9xv
    />
  `);
  expect(window.getComputedStyle(node).backgroundColor).toEqual(
    "rgb(0, 0, 255)"
  );
  expect(window.getComputedStyle(node).color).toEqual("rgb(255, 255, 0)");
});
