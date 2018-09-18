"use strict";

const babel = require("@babel/core");
const fs = require("fs");
const path = require("path");
const sheet = require("../../src/sheet");
const plugin = require("../../src/babel/plugin");

function compile(input) {
  const { code, metadata } = babel.transform(input, { plugins: [plugin] });
  return { code, metadata };
}

beforeEach(() => {
  sheet.reset();
});

const separator = "\n      ↓ ↓ ↓ ↓ ↓ ↓\n\n";

fs.readdirSync(path.resolve(__dirname, "fixtures")).forEach(filename => {
  if (!filename.match(/\.js$/)) {
    return;
  }

  const realpath = path.resolve(__dirname, path.join("fixtures", filename));

  test(filename, () => {
    const source = fs.readFileSync(realpath);
    const { code, metadata } = babel.transform(source, {
      filename: realpath,
      plugins: [plugin]
    });
    expect(source + separator + code).toMatchSnapshot("compiled");
    expect(sheet.toCSS()).toMatchSnapshot("css");
    expect(metadata.gkcss).toMatchSnapshot("metadata");
  });
});
