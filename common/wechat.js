var config = require('../config');
var crypto = require('crypto');
var request = require('request');
var _ = require('lodash');
module.exports = {
    sign: function () {
        return function (req, res, next) {
            var signature = req.query.signature;
            var timestamp = req.query.timestamp;
            var nonce = req.query.nonce;
            var shasum = crypto.createHash('sha1');
            var arr = [config.wechat.token, timestamp, nonce].sort();
            shasum.update(arr.join(''));
            var result = shasum.digest('hex') === signature;
            console.log(result);
            return res.send(result ? req.query.echostr + '' : 'err');
            // return next();
        }
    },
    getAccessToken: function(callback) {
        var  accessTokenUrl = _.cloneDeep(config.wechat.accessTokenUrl);
        var url = accessTokenUrl.replace('APPID', config.wechat.appid).replace('APPSECRET', config.wechat.appsecret);
        request(url, function (error, response, body) {
            if (error) throw error;
            if (!error && response.statusCode == 200) {
                var result = JSON.parse(body);
                return callback(error, result.access_token);
            }
        })
    },
    getAuthorizeUrl: function getAuthorizeUrl(redirectUrl, state) {
        var t = config.wechat.authorizeUrlTemplate;
        return t.replace('REDIRECT_URI', redirectUrl).replace('STATE', state);
    },
    getRedirectUrl: function (path) {
        return encodeURIComponent(['http://', config.server.host, path].join(''))
    },
    getAccessTokenUrl: function (code) {
        return config.wechat.accessTokenUrlTemplateByPage.replace('CODE', code);
    },
    openidRefreshTokenKey: function (openId) {
        return ['openid', openId, 'refresh_token'].join(':');
    },
}