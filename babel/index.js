"use strict";

const mast = require("match-ast");
const atomic = require("../atomic");

const evaluate = require("./evaluate");

const isStyleSheetCreate = mast.isCallExpression({
  callee: mast.isMemberExpression({
    object: mast.isIdentifier("StyleSheet"),
    property: mast.isIdentifier("create")
  }),
  arguments: [mast.isObjectExpression()]
});

module.exports = function plugin(babel) {
  const { types: t } = babel;

  return {
    name: "@geekie/css/babel",
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push(
        // ECMAScript proposals
        "asyncGenerators",
        "bigInt",
        "classProperties",
        "classPrivateProperties",
        "classPrivateMethods",
        ["decorators", { decoratorsBeforeExport: true }],
        "doExpressions",
        "dynamicImport",
        "exportDefaultFrom",
        "exportNamespaceFrom",
        "functionBind",
        "functionSent",
        "importMeta",
        "logicalAssignment",
        "nullishCoalescingOperator",
        "numericSeparator",
        "objectRestSpread",
        "optionalCatchBinding",
        "optionalChaining",
        ["pipelineOperator", { proposal: "minimal" }],
        "throwExpressions",

        // Language extensions
        "jsx"
      );
    },
    visitor: {
      Program: {
        enter(_, state) {
          state.dependencies = [];
          state.changed = false;
        },
        exit(p, state) {
          state.file.metadata = {
            gkcss: {
              dependencies: state.dependencies,
              css: state.css
            }
          };
        }
      },
      CallExpression(path, state) {
        const node = path.node;

        if (!isStyleSheetCreate(node)) {
          return;
        }

        const objPath = path.get("arguments.0");
        const { value: styles, dependencies } = evaluate(
          objPath,
          state.file.opts.filename,
          state.opts && state.opts.globals
        );
        const props = [];
        for (const key of Object.keys(styles)) {
          props.push(
            t.objectProperty(
              t.identifier(key),
              t.stringLiteral(
                atomic.process(styles[key], /* prettify */ state.opts.prettify)
              )
            )
          );
        }

        state.css = atomic.flush();
        path.replaceWith(t.objectExpression(props));
        [].push.apply(state.dependencies, dependencies);
      }
    }
  };
};
