"use strict";

const t = require("@babel/types");
const m = require("match-ast");
const sheet = require("../sheet");

const evaluate = require("./evaluate");

const isStyleSheetCreate = m.isCallExpression({
  callee: m.isMemberExpression({
    object: m.isIdentifier("StyleSheet"),
    property: m.isIdentifier("create")
  }),
  arguments: [m.isObjectExpression()]
});

module.exports = function plugin(babel) {
  return {
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
              changed: state.changed
            }
          };
        }
      },
      CallExpression: {
        exit(path, state) {
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
            const originalClassName = (state.opts && state.opts.addOriginalClassName) ? `._${key} ` : '';
            props.push(
              t.objectProperty(
                t.identifier(key),
                t.stringLiteral(originalClassName + sheet.process(styles[key], undefined, undefined, state.opts))
              )
            );
          }

          state.changed = true;
          path.replaceWith(t.objectExpression(props));
          [].push.apply(state.dependencies, dependencies);
        }
      }
    }
  };
};
