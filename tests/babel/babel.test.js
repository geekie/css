"use strict";

const babel = require("@babel/core");
const fs = require("fs");
const path = require("path");
const atomic = require("../../atomic");
const plugin = require("../../babel");

function compile(input) {
  const { code, metadata } = babel.transform(input, { plugins: [plugin] });
  return { code, metadata };
}

beforeEach(atomic.reset);

const separator = "\n      ↓ ↓ ↓ ↓ ↓ ↓\n\n";

const files = fs
  .readdirSync(path.resolve(__dirname, "fixtures"))
  .filter(f => /\.js$/.test(f));

describe.each(files)("%s", filename => {
  const realpath = path.resolve(__dirname, path.join("fixtures", filename));

  test.each(["prod", "dev"])("(%s)", env => {
    const source = fs.readFileSync(realpath);
    const { code: output, metadata } = babel.transform(source, {
      filename: realpath,
      plugins: [[plugin, { prettify: env === "dev" }]]
    });
    expect(source + separator + output).toMatchSnapshot("compiled");
    expect(metadata.gkcss.css).toMatchSnapshot("css");
    expect(metadata.gkcss.dependencies).toMatchSnapshot("dependencies");
  });
});
