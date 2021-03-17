const watch = require('watch');
const path = require('path');
const gen = require('./gen');
const serve = require('./serve');
const style = require('./style');

module.exports = async argv => {
    const configPath = argv.f || 'config.json';
    const config = require('./config').load(configPath);
    process.mode = 'deploy';
    if (argv.d) {
        process.mode = 'development';
        serve();
        watch.watchTree(process.cwd(), {
            filter(pathName) {
                return pathName !== path.join(process.cwd(), process.config.folder.public);
            },
            interval: 1,
        }, async _ => {
            try {
                await style.handler();
                await gen();
                console.log('[watch] generated')
            } catch (e) {
                console.error('[watch] catch', e);
            }
        });
    }
    else {
        try {
            await style.handler();
            await gen(config);
        } catch (e) {
            console.error('[initial] catch', e);
        }
    }
};
