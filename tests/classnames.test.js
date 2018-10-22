"use strict";

const cn = require("../src/classnames");
const sheet = require("../src/sheet");

const styles = {
  a: "gk0_a gk1_a",
  b: "gk0_b gk1_b gk2_b",
  c: "gk0_c gk2_c"
};

const prettyStyles = {
  a: "gkp5_color_black gkp5_width_33px",
  b: "gkp5_color_blue gkp6_height_60px",
}

test("order affects resulting classnames", () => {
  expect(cn(styles.a, styles.b)).toEqual("gk0_b gk1_b gk2_b");
  expect(cn(styles.b, styles.a)).toEqual("gk0_a gk1_a gk2_b");
});

test("works with nested arrays", () => {
  expect(cn([styles.a, [styles.b]], styles.c)).toEqual(
    cn(styles.a, styles.b, styles.c)
  );
});

test("works with pretty classnames", () => {
  expect(cn(prettyStyles.a, prettyStyles.b)).toEqual(
    "gkp5_color_blue gkp5_width_33px gkp6_height_60px"
  );
  expect(cn(prettyStyles.b, prettyStyles.a)).toEqual(
    "gkp5_color_black gkp5_width_33px gkp6_height_60px"
  );
});

test("simply adds non-gk classnames", () => {
  expect(cn(styles.a, "foo", "")).toEqual("foo gk0_a gk1_a");
});

test("removes falsy values", () => {
  expect(cn(false, "foo", undefined)).toEqual("foo");
});
