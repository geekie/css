# `@geekie/css`

[![npm](https://badgen.net/npm/v/@geekie/css)](https://npmjs.org/@geekie/css)
[![License](https://badgen.net/badge/license/MIT/blue)](LICENSE)
[![Travis](https://badgen.net/travis/geekie/css)](https://travis-ci.com/geekie/css)
[![Codecov](https://badgen.net/codecov/c/github/geekie/css)](https://codecov.io/gh/geekie/css)
[![Prettier](https://badgen.net/badge/code%20style/prettier/ff69b4)](https://github.com/prettier/prettier)

A simple CSS-in-JS solution that extracts CSS files.

## About

This library was created at [Geekie] when we started porting parts of our RN app to a web version. We evaluated most existing libraries and none would accomplish all our requirements:

- extract final CSS to a static file
- an API very similar to RN styling
- support for dynamic styles

## Usage

A simple example of the API:

```js
import { StyleSheet, css } from "@geekie/css";

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: "bold"
  },
  bordered: {
    border: "1px solid #000"
  }
});

function Header({ children }) {
  return (
    <span className={css(styles.header, styles.bordered)}>{children}</span>
  );
}
```

When used with our Webpack plugin, the `StyleSheet.create()` call will be replaced by a simple object, where the keys are kept and each value is a string of [atomic classnames] separated by an space. Each classname correspond to a single style defined in the object passed to `StyleSheet.create`. See the following output for an illustration:

```js
import { css } from "@geekie/css";

// these classnames are just an example
const styles = {
  header: "gkcss0_a4bcdef gkcss1_b9cdk4l",
  bordered: "gkcss2_a84ifj"
};

function Header({ children }) {
  return (
    <span className={css(styles.header, styles.bordered)}>{children}</span>
  );
}
```

And the `css()` function will select one classname from each "type", to prevent non-deterministic behavior caused by the order of CSS rules order.

In the cases where the styles can't be computed statically, the `StyleSheet.create()` will simply return the first argument, and when the `css()` function receives an object as argument, it will fallback to add class dynamically, very similar to the [glamor] (and others) behavior. An example:

```js
css(
  // assume these are the output of a `StyleSheet.create()` call
  "gkcss0_a4bcdef gkcss1_b9cdk4l",
  "gkcss0_g83nvn",

  // these are dynamic styles
  { color: "red" },
  { fontFamily: "Verdana", color: "black" }
);
```

The call above will return:

<!-- prettier-ignore -->
```js
"gkcss0_g83nvn gkcss1_b9cdk4l css-839fn39"
```

And a corresponding CSS rule will be created:

```css
.css-839fn39 {
  font-family: Verdana;
  color: black;
}
```

## Webpack integration

In order to benefit from the build time CSS compilation, you need to use the companion loader and plugin. Example:

```js
// webpack.config.js

const GkCssPlugin = require("@geekie/css/webpack");

module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          // we recommend adding the loader as the last loader
          {
            loader: GkCssPlugin.loader,
            options: {
              globals: {
                // include any globals that may affect the CSS styles
                // so they can be evaluated statically
                __DEV__: process.env.NODE_ENV !== "production"
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // define the filename of the compiled CSS
    new GkCssPlugin("style.css")
  ]
};
```

## TODO

- Manage "conflicts" between general vs specific styles (e.g. `border` vs `border-left`)

[geekie]: https://www.geekie.com.br
