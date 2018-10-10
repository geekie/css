"use strict";

const plugin = require("./src/webpack/plugin");
plugin.loader = require.resolve("./src/webpack/loader");
module.exports = plugin;
