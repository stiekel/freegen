const path = require('path');
const sitemap = require('sitemap')
const { Readable } = require( 'stream' );
const utils = require('./utils');

module.exports = {
    async create (urls) {
        // An array with your links
        // const links = [{ url: '/page-1/',  changefreq: 'daily', priority: 0.3  }]
        const links = [];
        urls.forEach(url => {
            url = url.replace(/\\/g, '\/');
            let depth = url.split('\/').length - 1;
            links.push({
                url,
                changefreq: 'monthly',
                priority: depth === 0 ? 1 : Math.pow(0.8, depth - 1)
            });
        });
        links.sort((l1, l2) => l1.depth > l2.depth ? 1 : -1);
        // Create a stream to write to
        const stream = new sitemap.SitemapStream( { hostname: process.config.protocol + '://' + process.config.domain } )
        // Return a promise that resolves with your XML string
        let data = await sitemap.streamToPromise(Readable.from(links).pipe(stream));
        let fp = path.join(process.cwd(), process.config.folder.public, 'sitemap.xml');
        await utils.saveFile(fp, data.toString());
    }
};
