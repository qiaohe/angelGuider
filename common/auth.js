"use strict";
var Promise = require('bluebird');
var jwt = Promise.promisifyAll(require("jsonwebtoken"));
var i18n = require('../i18n/localeMessage');
var config = require('../config');
var routeConfig = require('../routerConfig');
var _ = require('lodash');
var redisClient = require('./redisClient');
var url = require('url');
var cookieParser = require('../common/cookieParser');
function authorizedIfNeeded(req) {
    var routeItem = _.findLast(routeConfig, function (item) {
        var regExp = new RegExp('^' + item.path.replace(/:[(a-zA-Z0-9)]*/g, '[\\w|-]+') + '$');
        var m = req.method.toLowerCase();
        return (m == item.method || (m == 'delete' && item.method == 'del')) && regExp.test(url.parse(req.url).pathname)
    });
    return routeItem && routeItem.secured && routeItem.secured == 'user';
}

function auth() {
    function ensureAuthorized(req, res, next) {
        if (!authorizedIfNeeded(req)) return next();
        var token = req.headers['x-auth-token'];
        if (!token) {
            var cookies = cookieParser(req);
            if (cookies['openid']) {
                var redirectUrl = config.wechat.bindPhoneNumberPage + '?openid=' + cookies['openid'];
                res.header('Location', redirectUrl);
                return res.send(302);
            }
            return res.send(403, i18n.get("access.not.authorized"));
        }
        redisClient.getAsync(token).then(function (reply) {
            if (!reply) return res.send(403, i18n.get("token.invalid"));
            req.user = JSON.parse(reply);
            return next();
        }).catch(function (err) {
            res.send(500, err);
        });
    }

    return (ensureAuthorized);
}
module.exports = auth;