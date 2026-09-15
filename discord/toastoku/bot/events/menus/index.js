const fs = require("fs");
const path = require("path");

const menuFiles = fs.readdirSync(__dirname).filter(f => f.endsWith(".js") && f !== "index.js");

const menuHandlers = menuFiles.map(file => require(`./${file}`));

module.exports = menuHandlers;
