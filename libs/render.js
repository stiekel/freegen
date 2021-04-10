const path = require('path');
const fs = require('fs');
const pug = require('pug');
const utils = require('./utils');
const sitemap = require('./sitemap');

module.exports = {
    /**
     * 获取单个模板的配置文件
     * @return {promise}
     */
    async getLocalConfig(filepath) {
        let config = {};
        let basePath = filepath.substr(0, filepath.length - path.extname(filepath).length);
        let configPath = '';
        [
            '.js',
            '.json',
            '.locals.js',
            '.locals.json',
        ].forEach(p => {
            let fp = basePath + p;
            if (fs.existsSync(fp)) {
                configPath = fp;
            }
        });
        if (!configPath) {
            return {};
        }
        delete require.cache[configPath];
        let r = require(configPath);
        if (typeof r === 'function') {
            // async get config object
            config = await r().catch(e => {
                console.error('[render]', filepath, 'config execute failed err:', e.message);
                return {};
            });
        }
        else {
            config = r;
        }
        return config;
    },
    async renderSingleHtml(pagesDir, filepath, locals, page) {
        let styleFiles = []
        let jsFiles = [];
        if (locals.config.styleFiles instanceof Array) {
            styleFiles = styleFiles.concat(locals.config.styleFiles);
        }
        if (page.styleFiles instanceof Array) {
            styleFiles = styleFiles.concat(page.styleFiles);
        }
        if (locals.config.lastStyleFiles instanceof Array) {
            styleFiles = styleFiles.concat(locals.config.lastStyleFiles);
        }
        if (locals.config.jsFiles instanceof Array) {
            jsFiles = jsFiles.concat(locals.config.jsFiles);
        }
        if (page.jsFiles instanceof Array) {
            jsFiles = jsFiles.concat(page.jsFiles);
        }
        let fullConfig = Object.assign({
            ...locals,
            styleFiles,
            jsFiles,
            page,
        }, {
            pretty: true,
            mode: process.mode,
        });
        let html = pug.renderFile(filepath, fullConfig);
        let saveDir = path.dirname(filepath.substr(pagesDir.length));
        let relativePath = path.join(saveDir, path.basename(filepath));
        let savePath = path.join(process.cwd(), locals.config.folder.public, relativePath);
        savePath = savePath.substr(0, savePath.length - path.extname(savePath).length) + '.html';
        if (page.pageFilename) {
            savePath = path.join(path.dirname(savePath), page.pageFilename + '.html');
        }
        await utils.saveFile(savePath, html);
        return relativePath;
    },
    async html(pagesDir, filepath, locals) {
        let urls = [];
        let page = await module.exports.getLocalConfig(filepath);
        if (page.mode === 'multi') {
            if (!(page.pages instanceof Array && page.pages.length)) {
                console.error('[render] ', filepath, ' mode=multi, but pages not Array');
                return;
            }
            for (let i in page.pages) {
                let singlePage = Object.assign(
                    {...page},
                    typeof page.getPageConfig === 'function' ? await page.getPageConfig(page.pages[i]) : {}
                );
                if (typeof page.getNamedMeta === 'function') {
                    singlePage.meta = await page.getNamedMeta(page);
                }
                let url = await module.exports.renderSingleHtml(pagesDir, filepath, locals, singlePage);
                urls.push(url);
            }
        }
        else {
            let pageConfig = {...page};
            if (typeof page.getNamedMeta === 'function') {
                pageConfig.meta = await page.getNamedMeta(page);
            }
            let url = await module.exports.renderSingleHtml(pagesDir, filepath, locals, pageConfig);
            urls.push(url);
        }
        return urls.map(url => url.replace('.pug', '.html'));
    },
    async handler (pagesDir, locals) {
        let files = utils.getFiles(pagesDir);
        let urls = [];
        for (let i in files) {
            let f = files[i];
            let templateFilePath = path.resolve(pagesDir, f);
            if (path.extname(f) === '.pug') {
                let purls = await module.exports.html(pagesDir, templateFilePath, locals);
                urls = urls.concat(purls);
            }
        }
        await sitemap.create(urls);
    }
};
