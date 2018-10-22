"use strict";

const sheet = require("../src/sheet");
const prettySheet = {
  ...sheet,
  process: (obj, child, media) => sheet.process(obj, child, media, { prettyClassNames: true }),
};

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

test("splits classes [pretty]", () => {
  const style = prettySheet.process({
    color: "red",
    fontSize: "12px"
  });
  expect(style.split(/\s/)).toHaveLength(2);
  expect(prettySheet.toCSS()).toMatchInlineSnapshot(`
".gkp5_color_red{color:red}
.gkp8_fontSize_12px{font-size:12px}"
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

test("props are hashed when needed [pretty]", () => {
  const stylePlus = prettySheet.process({ content: "'+'" });
  const styleQuestion = prettySheet.process({ content: "'?'" });
  expect(prettySheet.toCSS()).toMatchInlineSnapshot(`
".gkp7_content_____ers99u{content:'?'}
.gkp7_content____{content:'+'}"
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

test("handles pseudo-selectors [pretty]", () => {
  const style = prettySheet.process({
    color: "red",
    ":hover": {
      textDecoration: "underline"
    }
  });

  expect(style).toMatchInlineSnapshot(`"gkp5_color_red gkp21__hover_textDecoration_underline"`);
  expect(prettySheet.toCSS()).toMatchInlineSnapshot(`
".gkp21__hover_textDecoration_underline:hover{text-decoration:underline}
.gkp5_color_red{color:red}"
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

test("handles media queries [pretty]", () => {
  const style = prettySheet.process({
    color: "green",
    "@media print": {
      color: "black"
    }
  });
  expect(style).toMatchInlineSnapshot(`"gkp5_color_green gkp18__media_print_color_black"`);
  expect(prettySheet.toCSS()).toMatchInlineSnapshot(`
".gkp5_color_green{color:green}
@media print{.gkp18__media_print_color_black{color:black}}"
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

test("handles number values [pretty]", () => {
  prettySheet.process({ paddingBottom: 1 });
  prettySheet.process({ paddingBottom: 2 });
  expect(prettySheet.toCSS()).toMatchInlineSnapshot(`
".gkp13_paddingBottom_1px{padding-bottom:1px}
.gkp13_paddingBottom_2px{padding-bottom:2px}"
`);
});

