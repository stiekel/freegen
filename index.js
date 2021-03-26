#!/usr/bin/env node
const freeGen = require('./libs/index');
const argv = require('minimist')(process.argv.splice(2));

process.title = 'freeGen';

(async () => {
    await freeGen.handler(argv);
})();
