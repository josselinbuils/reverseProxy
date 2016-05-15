'use strict';

const express = require('express');
const helmet = require('helmet');

const config = require('../config.json');
const HTTPSProxy = require('./httpsproxy');
const Logger = require('./logger');
const Router = require('./router');

module.exports = class HTTPProxy {
    static start() {
        Logger.info('Start HTTP proxy');

        let app = express();

        app.use(helmet());

        app.use((req, res, next) => {

            if (!/^www\./.test(req.hostname) && req.hostname.split('.').length === 2) {
                Logger.info(`Add www subdomain to ${req.hostname}`);
                return res.redirect('http://www.' + req.hostname + req.url);
            }

            if (HTTPSProxy.isHTTPSDomain(req.hostname)) {
                Logger.info(`${req.hostname} is a HTTPS domain, use HTTPS instead of HTTP`);
                return res.redirect('https://' + req.hostname + req.url);
            }

            next();
        });

        app.use(Router.route);

        app.listen(80);

        Logger.info('ReverseProxy is listening on port 80 for HTTP protocol');
    }
};