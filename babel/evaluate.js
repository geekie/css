"use strict";

const babel = require("@babel/core");
const generate = require("@babel/generator").default;
const t = require("@babel/types");
const template = require("@babel/template").default;
const fs = require("fs");
const Module = require("module");
const path = require("path");
const vm = require("vm");

const buildExport = template(`module.exports = EXPRESSION`);

function collectRequirements(path, requirements) {
  const binding = path.scope.getBinding(path.node.name);

  if (
    binding &&
    binding.kind !== "param" &&
    path.isReferenced() &&
    !requirements.some(req => req.path === binding.path)
  ) {
    let node = binding.path.node;

    switch (binding.kind) {
      case "const":
      case "let":
      case "var":
        node = t.variableDeclaration(binding.kind, [node]);
        break;
      case "module":
        node = t.importDeclaration([node], binding.path.parentPath.node.source);
        break;
    }

    requirements.push({
      path: binding.path,
      start: binding.path.node.start,
      node
    });

    path.traverse({
      Identifier(p) {
        collectRequirements(p, t, requirements);
      }
    });
  }
}

module.exports = function evaluate(path, filename, globals) {
  const result = path.evaluate();
  if (result.confident) {
    return {
      value: result.value,
      dependencies: []
    };
  }

  let requirements = [];
  if (path.isIdentifier()) {
    collectRequirements(path, requirements);
  } else {
    path.traverse({
      Identifier(p) {
        collectRequirements(p, requirements);
      }
    });
  }

  requirements.sort((a, b) => a.start - b.start);

  const imports = [];
  requirements = requirements.filter(req => {
    if (t.isImportDeclaration(req.node)) {
      imports.push(req);
      return false;
    }
    return true;
  });

  const code =
    generate(t.program(imports.map(req => req.node))).code +
    "\n" +
    generate(
      requirements.reduce(
        (acc, req) => t.blockStatement([req.node, acc]),
        t.blockStatement([buildExport({ EXPRESSION: path.node })])
      )
    ).code;

  const mod = new FakeModule(filename);
  globals && mod.__setGlobals(globals);
  mod.__compile(code);

  return {
    value: mod.exports,
    dependencies: mod.children.map(mod => mod.filename)
  };
};

function FakeModule(filename, parent) {
  this.id = this.filename = filename;
  this.children = [];
  this.paths = Module._nodeModulePaths(path.dirname(filename));
  this.exports = {};
  this.__cache = parent ? parent.__cache : {};
  this.__globals = parent ? parent.__globals : undefined;
}

FakeModule.prototype.__setGlobals = function(globals) {
  this.__globals = globals;
};

FakeModule.prototype.__load = function() {
  const source = fs.readFileSync(this.filename, "utf-8");

  if (/\.json$/.test(this.filename)) {
    this.exports = JSON.parse(source);
  } else {
    this.__compile(source);
  }
};

FakeModule.prototype.__compile = function(source) {
  const script = new vm.Script(
    babel.transform(source, {
      filename: this.filename,
      plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")]
    }).code,
    { filename: this.filename }
  );
  script.runInContext(
    vm.createContext(
      Object.assign(
        {
          module: this,
          exports: this.exports,
          require: this.__require.bind(this),
          process: {
            env: {
              NODE_ENV: process.env.NODE_ENV
            }
          },
          __filename: this.filename,
          __dirname: path.dirname(this.filename)
        },
        this.__globals
      )
    )
  );
};

FakeModule.prototype.__resolve = function(id) {
  return Module._resolveFilename(id, this);
};

FakeModule.prototype.__require = function(id) {
  const filename = this.__resolve(id);
  if (filename === id && !path.isAbsolute(id)) {
    throw Error(`Unable to import "${id}": native modules are not supported`);
  }

  let mod = this.__cache[filename];
  if (!mod) {
    this.__cache[filename] = mod = new FakeModule(filename, this);
    mod.__load();
  }

  if (!this.children.includes(mod)) {
    this.children.push(mod);
  }

  return mod.exports;
};
