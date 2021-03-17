const path = require('path');
const fs = require('fs');
const utils = require('./utils');
const less = require('less');
module.exports = {
    async handler(dir = process.config.folder.styles) {
        let files = utils.getFiles(dir);
        files.map(file => {
            file = path.join(process.cwd(), dir, file)
            switch (path.extname(file)) {
                case '.less':
                    this.less(file);
                    break;
            }
        })
    },
    // get the style files target path
    async getTargetPath() {
        let dir = path.join(process.cwd(), process.config.folder.public, process.config.folder.styles);
        await utils.initDir(dir);
        return dir;
    },
    async less(file) {
        let content = fs.readFileSync(file, {
            encoding: 'utf8',
        });
        let res = await less.render(content, {
            filename: file,
        }).catch(e => {
            console.error('[less render] failed', e);
        });
        if (res && res.css) {
            let dir = await this.getTargetPath();
            let basename = file.substr(path.join(process.cwd(), process.config.folder.styles).length);
            basename = basename.substr(0, basename.length - path.extname(basename).length) + '.css';
            let targetFile = path.join(dir, basename);
            await utils.writeFile(targetFile, res.css);
        }
    }
};