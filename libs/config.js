const path = require('path');
const fs = require('fs');
const merge = require('merge');

module.exports = {
    /**
     * 获取配置
     * @param {string} configPath 自定义配置文件地址
     */
    load (configPath) {
        const fullcp = path.resolve(process.cwd(), configPath);
        let config = require('../config.sample.json');
        if (fs.existsSync(fullcp)) {
            let custom = require(fullcp);
            config = merge.recursive(config, custom);
        }
        process.config = config;
        return config;
    }
};
