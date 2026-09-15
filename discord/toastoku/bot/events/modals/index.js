const fs = require("fs");
const path = require("path");

const modalFiles = fs.readdirSync(__dirname).filter(f => f.endsWith(".js") && f !== "index.js");

const modalHandlers = modalFiles.map(file => require(`./${file}`));

module.exports = modalHandlers;
