const path = require('path');
const utils = require('./utils');
const dataHandler = require('./dataHandler');
const render = require('./render');

module.exports = async (config = process.config) => {
    await utils.clearDir(config.folder.public);
    let data = await dataHandler(config.folder.data);
    let pagesDir = path.resolve(process.cwd(), config.folder.pages);
    await render.handler(pagesDir, {config, data});
    // copy static files
    utils.cp(config.folder.static, config.folder.public);
};
