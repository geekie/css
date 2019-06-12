"use strict";

const atomic = require("../atomic");

beforeEach(atomic.reset);

describe("in prod", () => {
  test("splits classes", () => {
    const style = atomic.process({
      color: "red",
      fontSize: "12px"
    });
    expect(style).toMatchInlineSnapshot(`gkcss0-5scuol gkcss1-1fwxnve`);
    expect(atomic.flush()).toMatchInlineSnapshot(`
      .gkcss0-5scuol{color:red}
      .gkcss1-1fwxnve{font-size:12px}
    `);
  });

  test("classnames are cached", () => {
    const first = atomic.process({ color: "red" });
    const second = atomic.process({ color: "red" });
    expect(second).toEqual(first);
    expect(atomic.flush()).toMatchInlineSnapshot(`.gkcss0-5scuol{color:red}`);

    const third = atomic.process({ color: "red" });
    expect(third).toEqual(first);
    expect(atomic.flush()).toMatchInlineSnapshot(`.gkcss0-5scuol{color:red}`);
  });

  test("props are hashed", () => {
    const redStyle = atomic.process({ color: "red" });
    const blueStyle = atomic.process({ color: "blue" });
    expect(redStyle).toMatchInlineSnapshot(`gkcss0-5scuol`);
    expect(blueStyle).toMatchInlineSnapshot(`gkcss0-13q2bts`);
    expect(atomic.flush()).toMatchInlineSnapshot(`
      .gkcss0-5scuol{color:red}
      .gkcss0-13q2bts{color:blue}
    `);
  });

  test("ignores empty values", () => {
    const style = atomic.process({
      color: "red",
      fontSize: null,
      lineHeight: undefined,
      "@media print": {},
      "@media screen": {
        "&:hover": {
          color: false,
          backgroundColor: true
        }
      }
    });

    expect(style).toMatchInlineSnapshot(`gkcss0-5scuol`);
    expect(atomic.flush()).toMatchInlineSnapshot(`.gkcss0-5scuol{color:red}`);
  });

  test("handles pseudo-selectors", () => {
    const style = atomic.process({
      color: "red",
      ":hover": {
        textDecoration: "underline"
      }
    });

    expect(style).toMatchInlineSnapshot(`gkcss0-5scuol gkcss1-8stvzk`);
    expect(atomic.flush()).toMatchInlineSnapshot(`
      .gkcss0-5scuol{color:red}
      .gkcss1-8stvzk:hover{text-decoration:underline}
    `);
  });

  test("handles nested selectors", () => {
    const style = atomic.process({
      color: "red",
      "> *": {
        textDecoration: "none",
        ":hover": {
          textDecoration: "underline"
        }
      }
    });
    expect(style).toMatchInlineSnapshot(
      `gkcss0-5scuol gkcss1-glywfm gkcss2-8stvzk`
    );
    expect(atomic.flush()).toMatchInlineSnapshot(`
      .gkcss0-5scuol{color:red}
      .gkcss1-glywfm> *{text-decoration:none}
      .gkcss2-8stvzk> *:hover{text-decoration:underline}
    `);
  });

  test("handles media queries", () => {
    const style = atomic.process({
      color: "green",
      "@media print": {
        color: "black"
      }
    });
    expect(style).toMatchInlineSnapshot(`gkcss0-bf54id gkcss1-11x86a4`);
    expect(atomic.flush()).toMatchInlineSnapshot(`
      .gkcss0-bf54id{color:green}
      @media print{.gkcss1-11x86a4{color:black}}
    `);
  });

  test("handles number values", () => {
    const first = atomic.process({ paddingBottom: 1 });
    const second = atomic.process({ paddingBottom: 2 });
    expect(atomic.flush()).toMatchInlineSnapshot(`
      .gkcss0-t94yts{padding-bottom:1px}
      .gkcss0-yh40bf{padding-bottom:2px}
    `);
  });
});

describe("in dev", () => {
  function process(style) {
    return atomic.process(style, true);
  }

  test("splits classes", () => {
    const style = process({
      color: "red",
      fontSize: "12px"
    });
    expect(style).toMatchInlineSnapshot(
      `gkcss0-color-red gkcss1-fontSize-12px`
    );
    expect(atomic.flush()).toMatchInlineSnapshot(`
      .gkcss0-color-red{color:red}
      .gkcss1-fontSize-12px{font-size:12px}
    `);
  });

  test("props are hashed if necessary", () => {
    const plusStyle = process({ content: "'+'" });
    const exclStyle = process({ content: "'!'" });
    expect(plusStyle).toMatchInlineSnapshot(`gkcss0-content-1ups28k`);
    expect(exclStyle).toMatchInlineSnapshot(`gkcss0-content-1sgip1j`);
    expect(atomic.flush()).toMatchInlineSnapshot(`
      .gkcss0-content-1ups28k{content:'+'}
      .gkcss0-content-1sgip1j{content:'!'}
    `);
  });

  test("ignores empty values", () => {
    const style = process({
      color: "red",
      fontSize: null,
      lineHeight: undefined,
      "@media print": {},
      "@media screen": {
        "&:hover": {
          color: false,
          backgroundColor: true
        }
      }
    });

    expect(style).toMatchInlineSnapshot(`gkcss0-color-red`);
    expect(atomic.flush()).toMatchInlineSnapshot(
      `.gkcss0-color-red{color:red}`
    );
  });

  test("handles pseudo-selectors", () => {
    const style = process({
      color: "red",
      ":hover": {
        textDecoration: "underline"
      }
    });

    expect(style).toMatchInlineSnapshot(
      `gkcss0-color-red gkcss1-hover-textDecoration-underline`
    );
    expect(atomic.flush()).toMatchInlineSnapshot(`
      .gkcss0-color-red{color:red}
      .gkcss1-hover-textDecoration-underline:hover{text-decoration:underline}
    `);
  });

  test("handles clash in nested selectors", () => {
    const style = process({
      color: "red",
      "> *": {
        color: "red"
      }
    });
    expect(style).toMatchInlineSnapshot(`gkcss0-color-red gkcss1-color-red`);
    expect(atomic.flush()).toMatchInlineSnapshot(`
      .gkcss0-color-red{color:red}
      .gkcss1-color-red> *{color:red}
    `);
  });

  test("handles media queries", () => {
    const style = process({
      color: "green",
      "@media print": {
        color: "black"
      }
    });
    expect(style).toMatchInlineSnapshot(
      `gkcss0-color-green gkcss1-media_print-color-black`
    );
    expect(atomic.flush()).toMatchInlineSnapshot(`
      .gkcss0-color-green{color:green}
      @media print{.gkcss1-media_print-color-black{color:black}}
    `);
  });

  test("handles number values", () => {
    process({ paddingBottom: 1 });
    process({ paddingBottom: 2 });
    expect(atomic.flush()).toMatchInlineSnapshot(`
      .gkcss0-paddingBottom-1px{padding-bottom:1px}
      .gkcss0-paddingBottom-2px{padding-bottom:2px}
    `);
  });
});
