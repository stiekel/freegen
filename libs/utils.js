const path = require('path');
const fs = require('fs');
const copy = require('recursive-copy');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const merge = require('merge');

module.exports = {
    /**
     * get file list in folder
     * @param {string} dir  target folder
     * @param {object} opts options
     * @return {array}
     * opt.excludeUnderscore: exclude file or folder start with underscore
     */
    getFiles (dir, opts = {
        excludeUnderscore: true,
    }) {
        dir = path.resolve(dir);
        let allFiles = fs.readdirSync(dir);
        let result = [];
        for (let i in allFiles){
            let f = allFiles[i];
            if (f.startsWith('_') && opts.excludeUnderscore) {
                continue;
            }
            let fp = path.resolve(dir, f);
            let stat = fs.statSync(fp);
            if (stat.isFile()) {
                result.push(f);
            }
            else if (stat.isDirectory()) {
                let subFiles = this.getFiles(path.join(dir, f), opts);
                subFiles.map(sf => {
                    result.push(`${f}/${sf}`);
                });
            }
        }
        return result;
    },
    async saveFile (filepath, content) {
        let dir = path.dirname(filepath);
        await this.initDir(dir);
        fs.writeFileSync(filepath, content + '\r\n', {
            encoding: 'utf8',
            flag: 'w',
        });
    },
    async initDir (dest) {
        if (!fs.existsSync(dest)) {
            await mkdirp(dest);
        }
    },
    async clearDir (dest) {
        dest = path.resolve(process.cwd(), dest);
        rimraf.sync(dest);
        await this.initDir(dest);
    },
    async cp (src, dest) {
        src = path.resolve(process.cwd(), src);
        dest = path.resolve(process.cwd(), dest);
        this.initDir(dest);
        copy(src, dest, {
            overwrite: true,
        });
    },
    mergeConfig (...args) {
        return args.reduce((pre, cur) => {
            if (typeof cur !== 'object') {
                pre = cur;
            }
            else {
                if (cur instanceof Array) {
                    if (!(pre instanceof Array)) {
                        pre = [];
                    }
                    pre = pre.concat(cur);
                }
                else {
                    if (typeof pre !== 'object') {
                        pre = {};
                    }
                    for (let i in cur) {
                        if (pre[i] === undefined) {
                            pre[i] = cur[i];
                        }
                        else {
                            if (typeof cur[i] !== 'object') {
                                pre[i] = cur[i];
                            }
                            else {
                                pre[i] = this.mergeConfig(pre[i], cur[i])
                            }
                        }
                    }
                }
            }
            return pre;
        });
        // return merge.recursive(true, ...args);
    },
    async writeFile (filepath, content) {
        let dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            await mkdirp(dir);
        }
        fs.writeFileSync(filepath, content, {
            encoding: 'utf8',
            flag: 'w',
        });
    }
};