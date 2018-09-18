"use strict";

const cn = require("../src/classnames");
const sheet = require("../src/sheet");

const fooStyle = sheet.process({
  color: "red",
  fontSize: "12px"
});

const barStyle = sheet.process({
  color: "blue"
});

test("order affects resulting classname", () => {
  expect(cn(fooStyle, barStyle)).toMatchInlineSnapshot(
    `"gk0_13q2bts gk1_1fwxnve"`
  );
  expect(cn(barStyle, fooStyle)).toMatchInlineSnapshot(
    `"gk0_5scuol gk1_1fwxnve"`
  );
});

test("simply adds non-gk classnames", () => {
  expect(cn(fooStyle, "foo", barStyle)).toMatchInlineSnapshot(
    `"foo gk0_13q2bts gk1_1fwxnve"`
  );
});

test("removes falsy values", () => {
  expect(cn(false, "foo", undefined)).toEqual("foo");
});
