const fs = require("fs");
const path = require("path");
const fl = require('fluident');

const buttonHandlers = [];

const files = fs.readdirSync(__dirname)
  .filter(f => f.endsWith(".js") && f !== "index.js");

for (const file of files) {
  const handler = require(path.join(__dirname, file));
  if (typeof handler === "function") {
    buttonHandlers.push(handler);
  } else {
    console.warn(fl.yellow(`[WARN] Button file ${file} does not export a function.`));
  }
}

module.exports = buttonHandlers;
