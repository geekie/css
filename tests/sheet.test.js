"use strict";

const sheet = require("../src/sheet");

beforeEach(() => {
  sheet.reset();
});

test("splits classes", () => {
  const style = sheet.process({
    color: "red",
    fontSize: "12px"
  });
  expect(style.split(/\s/)).toHaveLength(2);
  expect(sheet.toCSS()).toMatchInlineSnapshot(`
".gk0_5scuol{color:red}
.gk1_1fwxnve{font-size:12px}"
`);
});

test("props are hashed", () => {
  const redStyle = sheet.process({ color: "red" });
  const blueStyle = sheet.process({ color: "blue" });
  expect(redStyle.split("_")[0]).toEqual(blueStyle.split("_")[0]);
  expect(sheet.toCSS()).toMatchInlineSnapshot(`
".gk0_13q2bts{color:blue}
.gk0_5scuol{color:red}"
`);
});

test("handles pseudo-selectors", () => {
  const style = sheet.process({
    color: "red",
    ":hover": {
      textDecoration: "underline"
    }
  });

  expect(style).toMatchInlineSnapshot(`"gk0_5scuol gk1_8stvzk"`);
  expect(sheet.toCSS()).toMatchInlineSnapshot(`
".gk0_5scuol{color:red}
.gk1_8stvzk:hover{text-decoration:underline}"
`);
});

test("handles media queries", () => {
  const style = sheet.process({
    color: "green",
    "@media print": {
      color: "black"
    }
  });
  expect(style).toMatchInlineSnapshot(`"gk0_bf54id gk1_11x86a4"`);
  expect(sheet.toCSS()).toMatchInlineSnapshot(`
".gk0_bf54id{color:green}
@media print{.gk1_11x86a4{color:black}}"
`);
});

test("handles number values", () => {
  sheet.process({ paddingBottom: 1 });
  sheet.process({ paddingBottom: 2 });
  expect(sheet.toCSS()).toMatchInlineSnapshot(`
".gk0_t94yts{padding-bottom:1px}
.gk0_yh40bf{padding-bottom:2px}"
`);
});
