"use strict";

expect.addSnapshotSerializer({
  test: val => typeof val === 'string',
  print: val => val,
});
