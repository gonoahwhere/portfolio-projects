const emojis = require('../config/emojis');

function resolveEmojis(str) {
    return str.replace(/\{(\w+)\}/g, (match, key) => emojis[key] ?? match);
}

module.exports = { resolveEmojis };