"use strict";

const path = require("path");

module.exports = {
  projects: [
    {
      testPathIgnorePatterns: ["<rootDir>/tests/webpack"],
      setupFilesAfterEnv: ["<rootDir>/tests/setup.js"]
    },
    {
      testEnvironment: "node",
      testPathIgnorePatterns: ["<rootDir>/tests/(?!webpack)"],
      setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
      watchPathIgnorePatterns: ["<rootDir>/tests/webpack/output"]
    }
  ]
};
