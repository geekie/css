"use strict";

const del = require("del");
const fs = require("fs");
const path = require("path");
const plugin = require("../../webpack");
const webpack = require("webpack");

function compile(mode) {
  const config = {
    mode,
    entry: [path.resolve(__dirname, "./input/entry.js")],
    output: { path: path.join(__dirname, "output") },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: plugin.loader,
          options: {
            globals: {
              __DEV__: mode === "production"
            }
          }
        }
      ]
    },
    plugins: [new plugin("file.css")]
  };
  const compiler = webpack(config);

  return new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        reject(error);
      }

      const css = fs.readFileSync(
        path.resolve(__dirname, "output/file.css"),
        "utf-8"
      );

      del.sync([path.resolve(__dirname, "output")]);

      const { modules } = stats.toJson();
      resolve({ modules, css });
    });
  });
}

test("plugin works in dev", async () => {
  const { modules, css } = await compile("development");
  expect(css).toMatchInlineSnapshot(`
    .gkcss0-fontFamily-Lato{font-family:Lato}
    .gkcss1-fontSize-10px{font-size:10px}
    .gkcss2-color-green{color:green}
    .gkcss3-lineHeight-gp0g74{line-height:2.5}
    .gkcss4-width-200px{width:200px}
  `);
  expect(modules[1].source).toMatchInlineSnapshot(`
    import Colors from "./imports/colors";
    import * as Constants from "./imports/constants";
    import { LINE_HEIGHT } from "./imports/constants";

    function double(n) {
      return n * 2;
    }

    const FONT_FAMILY = "Lato";
    const styles = {
      foo: "gkcss0-fontFamily-Lato gkcss1-fontSize-10px gkcss2-color-green gkcss3-lineHeight-gp0g74",
      bar: "gkcss4-width-200px"
    };
  `);
});

test("plugin works in production", async () => {
  const { css } = await compile("production");
  expect(css).toMatchInlineSnapshot(`
    .gkcss0-vrafzl{font-family:Lato}
    .gkcss1-19bvopo{font-size:10px}
    .gkcss2-bf54id{color:green}
    .gkcss3-gp0g74{line-height:2.5}
    .gkcss4-12xxubj{width:100px}
  `);
});
