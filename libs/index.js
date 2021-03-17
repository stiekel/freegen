const config = require('./config');
const gen = require('./gen');
const handler = require('./handler');

module.exports = {
    loadConfig: config.load,
    gen: gen,
    handler,
};
