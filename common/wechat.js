var config = require('../config');
var crypto = require('crypto');
var request = require('request');
var _ = require('lodash');
var redis = require('../common/redisClient');
var qiniu = require('../common/qiniu');
var cookieParser = require('../common/cookieParser');
var angelGuiderDAO = require('../dao/angelGuiderDAO');
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
    getAccessToken: function (callback) {
        redis.getAsync('ak:token').then(function (reply) {
            if (reply) {
                return callback(null, reply);
            } else {
                var accessTokenUrl = _.cloneDeep(config.wechat.accessTokenUrl);
                var url = accessTokenUrl.replace('APPID', config.wechat.appid).replace('APPSECRET', config.wechat.appsecret);
                request(url, function (error, response, body) {
                    if (error) throw error;
                    if (!error && response.statusCode == 200) {
                        var result = JSON.parse(body);
                        redis.setAsync('ak:token', result.access_token);
                        redis.expireAsync('ak:token', 7200);
                        return callback(error, result.access_token);
                    }
                })
            }
        }).catch(function (err) {
            callback(err, null);
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
    downloadUrl: function (accessToken, mediaId) {
        return config.wechat.downloadUrl.replace('ACCESS_TOKEN', accessToken).replace("MEDIA_ID", mediaId);
    },
    toBase64: function (str) {
        return new Buffer(str).toString('base64')
            .replace(/\//g, '_')
            .replace(/\+/g, '-');
    },

    sync: function (image, callback) {
        var that = this;
        that.getAccessToken(function (err, token) {
            if (err) throw err;
            var fileName = qiniu.getFileName(image);
            var path = qiniu.getFetchPath(that.toBase64(that.downloadUrl(token, image)),
                that.toBase64('hisforce:' + fileName));
            var managementToken = qiniu.getManagementToken(path);
            var options = {
                url: 'http://iovip.qbox.me' + path,
                'Content-Type': 'application/x-www-form-urlencoded',
                headers: {
                    'Authorization': 'QBox ' + managementToken
                }
            };
            request.post(options, function (err, response, body) {
                callback(err, config.qiniu.prefix + fileName);
            });
        });
    },

    createTextMessage: function (body) {
        var time = Math.round(new Date().getTime() / 1000);
        return "" +
            "<xml>" +
            "<ToUserName><![CDATA[" + body.from + "]]></ToUserName>" +
            "<FromUserName><![CDATA[" + body.to + "]]></FromUserName>" +
            "<CreateTime>" + time + "</CreateTime>" +
            "<MsgType><![CDATA[" + "text" + "]]></MsgType>" +
            "<Content><![CDATA[" + body.message + "]]></Content>" +
            "<FuncFlag>" + "0" + "</FuncFlag>" +
            "</xml>";
    },

    sendMessage: function (toUserName, message) {
        var that = this;
        that.getAccessToken(function (err, accessToken) {
            if (err) throw err;
            var options = {
                url: 'https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=' + accessToken,
                body: JSON.stringify({
                    touser: toUserName, msgtype: 'text', 'text': {'content': message}
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            request.post(options, function (err, response, body) {
                if (err) throw err;
            });
        });
    },
    sendMessageWithRequest: function (req, message) {
        var that = this;
        var cookies = cookieParser(req);
        if (cookies['openid']) {
            that.sendMessage(cookies['openid'], message);
        } else {
            angelGuiderDAO.findOpenIdByGuiderId(req.user.id).then(function (result) {
                that.sendMessage(result[0].openid, message);
            })
        }
    }
}