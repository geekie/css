"use strict";

const cn = require("../src/classnames");
const sheet = require("../src/sheet");

const styles = {
  a: "gk0_a gk1_a",
  b: "gk0_b gk1_b gk2_b",
  c: "gk0_c gk2_c"
};

test("order affects resulting classnames", () => {
  expect(cn(styles.a, styles.b)).toEqual("gk0_b gk1_b gk2_b");
  expect(cn(styles.b, styles.a)).toEqual("gk0_a gk1_a gk2_b");
});

test("works with nested arrays", () => {
  expect(cn([styles.a, [styles.b]], styles.c)).toEqual(
    cn(styles.a, styles.b, styles.c)
  );
});

test("simply adds non-gk classnames", () => {
  expect(cn(styles.a, "foo", "")).toEqual("foo gk0_a gk1_a");
});

test("removes falsy values", () => {
  expect(cn(false, "foo", undefined)).toEqual("foo");
});
