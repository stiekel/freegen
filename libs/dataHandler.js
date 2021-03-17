const path = require('path');
const fs = require('fs');
const utils = require('./utils');

module.exports = async (datadir) => {
    const all = {};
    const files = utils.getFiles(datadir);
    files.map(file => {
        let basename = path.basename(file)
        let extname = path.extname(file)
        let truename = basename.substr(0, basename.length - extname.length)
        all[truename] = require(path.resolve(process.cwd(), datadir, file));
    });
    return all;
};
