const express = require('express');
const ecstatic = require('ecstatic');
const http = require('http');
module.exports = async _ => {
    const app = express();
    app.use(ecstatic({
        root: process.config.folder.public,
        showdir: true,
    }));
    http.createServer(app).listen(8080);
    console.log('Listening on http://localhost:8080');
}
