"use strict";
var md5 = require('md5');
var redis = require('../common/redisClient');
var config = require('../config');
var crypto = require('crypto');
var angelGuiderDAO = require('../dao/angelGuiderDAO');
var i18n = require('../i18n/localeMessage');
var _ = require('lodash');
var moment = require('moment');
var uuid = require('node-uuid');
var ic = require("../common/invitationCode");
var xmljs = require('xml2js');
var parser = new xmljs.Parser();
var request = require('request');
var wechat = require('../common/wechat');
function getOutput(body, message) {
    var time = Math.round(new Date().getTime() / 1000);
    return "" +
        "<xml>" +
        "<ToUserName><![CDATA[" + body.FromUserName[0] + "]]></ToUserName>" +
        "<FromUserName><![CDATA[" + body.ToUserName[0] + "]]></FromUserName>" +
        "<CreateTime>" + time + "</CreateTime>" +
        "<MsgType><![CDATA[" + "text" + "]]></MsgType>" +
        "<Content><![CDATA[" + message + "]]></Content>" +
        "<FuncFlag>" + "0" + "</FuncFlag>" +
        "</xml>";
}
module.exports = {
    login: function (req, res, next) {
        var userName = (req.body && req.body.username) || (req.query && req.query.username);
        var password = (req.body && req.body.password) || (req.query && req.query.password);
        var user = {};
        angelGuiderDAO.findByUserName(userName).then(function (users) {
            if (!users || !users.length) throw new Error(i18n.get('member.not.exists'));
            user = users[0];
            if (user.status == 1) throw new Error(i18n.get('member.resign.error'));
            if (user.password != md5(password)) throw new Error(i18n.get('member.password.error'));
            var token = uuid.v4();
            redis.set(token, JSON.stringify(user));
            redis.expire(token, config.app.tokenExpire);
            user.token = token;
            delete user.password;
            user.gender = config.gender[user.gender];
            redis.getAsync('b:uid:' + user.id + ':token').then(function (reply) {
                redis.del(reply);
                redis.set('b:uid:' + user.id + ':token', token);
            });
            res.send({ret: 0, data: user});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    logout: function (req, res, next) {
        var token = req.headers['x-auth-token'];
        if (!token) return res.send(401, i18n.get('token.not.provided'));
        redis.delAsync(token).then(function () {
            redis.del('b:uid:' + req.user.id + ':token');
            res.send({ret: 0, message: i18n.get('logout.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    resetPwd: function (req, res, next) {
        var that = this;
        var mobile = req.body.username;
        var certCode = req.body.certCode;
        var newPwd = req.body.password;
        redis.getAsync(mobile).then(function (reply) {
            if (!(reply && reply == certCode)) return res.send({ret: 1, message: i18n.get('sms.code.invalid')});
            return angelGuiderDAO.updatePassword(md5(newPwd), mobile).then(function (result) {
                return angelGuiderDAO.findByUserName(mobile);
            }).then(function (users) {
                var token = uuid.v4();
                var user = users[0];
                redis.set(token, JSON.stringify(user));
                redis.expire(token, config.app.tokenExpire);
                user.token = token;
                delete user.password;
                user.gender = config.gender[user.gender];
                res.send({ret: 0, data: user});
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    updateMyProfile: function (req, res, next) {
        var angelGuider = req.body;
        angelGuider.id = req.user.id;
        angelGuiderDAO.update(angelGuider).then(function (result) {
            res.send({ret: 0, message: i18n.get('member.update.success')});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
    },
    register: function (req, res, next) {
        var user = req.body;
        var invitationCode = user.invitationCode;
        redis.getAsync(user.mobile).then(function (reply) {
            if (!(reply && reply == user.certCode))  throw new Error('无效的验证码。');
            return angelGuiderDAO.findByMobile(user.mobile).then(function (users) {
                if (users.length) throw new Error('手机号码已存在');
                user = _.assign(_.omit(user, ['certCode']), {
                    createDate: new Date(),
                    invitationCode: ic.generate(),
                    gender: 0,
                    status: 0,
                    balance: 0.00,
                    password: md5(req.body.password)
                });
                if (invitationCode) {
                    return angelGuiderDAO.findByInvitationCode(invitationCode).then(function (invitee) {
                        if (invitee && invitee.length < 1) throw new Error('无效的邀请码');
                        user.agency = invitee[0].id;
                        user.agencyName = invitee[0].realName;
                        return angelGuiderDAO.insert(user);
                    })
                } else {
                    return angelGuiderDAO.insert(user);
                }
            }).then(function (result) {
                var uid = result.insertId;
                user.id = uid;
                return angelGuiderDAO.insertAccount({
                    uid: uid,
                    updateDate: new Date(),
                    accountNo: 'B' + user.agency + '-' + moment().format('YYMMDD') + uid,
                    balance: 0.00,
                    // accountName: req.body.realName,
                    availableBalance: 0.00,
                    status: 0,
                    type: 0
                });
            }).then(function (result) {
                var token = uuid.v4();
                redis.set(token, JSON.stringify(user));
                redis.expire(token, config.app.tokenExpire);
                user.token = token;
                delete user.password;
                user.gender = config.gender[user.gender];
                redis.getAsync('b:uid:' + user.id + ':token').then(function (reply) {
                    redis.del(reply);
                    redis.set('b:uid:' + user.id + ':token', token);
                });
                res.send({ret: 0, data: user});
            })
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getInvitation: function (req, res, next) {
        var uid = req.user.id;
        var data = _.cloneDeep(config.invitationTemplate);
        angelGuiderDAO.findById(req.user.id).then(function (users) {
            data.url = data.url + users[0].invitationCode;
            data.shareUrl = data.shareUrl + users[0].invitationCode;
            if (users[0].invitationCode) return res.send({ret: 0, data: data});
            var code = ic.generate();
            return angelGuiderDAO.update({id: users[0].id, invitationCode: code}).then(function (result) {
                data.url = data.url + code;
                data.shareUrl = data.shareUrl + users[0].invitationCode;
                res.send({ret: 0, data: data});
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    checkSignature: function (req, res, next) {
        res.end(req.query.echostr);
        return next();
    },

    wechatCallback: function (req, res, next) {
        var scene = {};
        parser.parseString(req.body, function (err, result) {
            if (err) throw err;
            var body = result.xml;
            var messageType = body.MsgType[0];
            if (messageType === 'event') {
                var eventName = body.Event[0];
                if (eventName == 'subscribe') {
                    var openId = body.FromUserName[0];
                    if (body.EventKey && body.EventKey.length > 0) {
                        scene = {scene_id: body.EventKey[0].substr(8), ticket: body.Ticket[0]};
                    }
                    wechat.getAccessToken(function (err, token) {
                        var url = config.wechat.getUserInfo.replace('ACCESS_TOKEN', token).replace("OPENID", openId);
                        request(url, function (err, response, data) {
                            if (err) throw err;
                            var wechatUser = JSON.parse(data);
                            delete wechatUser.subscribe;
                            delete wechatUser.tagid_list;
                            delete wechatUser.groupid;
                            angelGuiderDAO.findWeChatUserByOpenId(wechatUser.openid).then(function (result) {
                                if (result && result.length < 1) angelGuiderDAO.insertWeChatUser(_.assign(wechatUser, scene)).then(function (result) {
                                });
                            })
                        })
                    });
                    res.send(getOutput(body, config.wechat.subscribeMessage));
                } else if (body.EventKey && body.EventKey.length > 0 && body.Event[0]== 'CLICK') {
                    angelGuiderDAO.findGuiderByOpenId(body.FromUserName[0]).then(function (result) {
                        if (result && result.length < 1) {
                            res.send(getOutput(body, config.wechat.bindMobileMessage));
                        }
                    })
                }
                console.log(body);
            } else if (messageType === 'text') {
            }
        });
        return next();
    },

    createMenu: function (req, res, next) {
        wechat.getAccessToken(function (err, token) {
            if (err) throw err;
            var options = {
                url: config.wechat.createMenu.replace('ACCESS_TOKEN', token),
                method: 'POST',
                json: true,
                body: req.body
            };
            request(options, function (error, response, data) {
                if (error) throw error;
                if (response.statusCode == 200) {
                    res.send('success')
                }
            })
        });
        return next();
    },

    getSignature: function (req, res, next) {
        var ticketUrl = _.cloneDeep(config.wechat.ticketUrl);
        var timestamp = Math.floor(Date.now() / 1000);
        var sha1 = crypto.createHash('sha1');
        wechat.getAccessToken(function (err, token) {
            request(ticketUrl.replace('TOKEN', token), function (err, ressponse, json) {
                var ticket = JSON.parse(json);
                redis.setAsync('jssdk:ticket', ticket.ticket, 1000 * 60 * 60 * 24);
                res.send({
                    ret: 0, signature: {
                        noncestr: config.wechat.noncestr,
                        timestamp: timestamp,
                        url: req.query.url,
                        jsapi_ticket: ticket.ticket,
                        signature: sha1.update('jsapi_ticket=' + ticket.ticket + '&noncestr=' + config.wechat.noncestr + '&timestamp=' + timestamp + '&url=' + req.query.url).digest('hex')
                    }
                });
            })
        });
        return next();
    }
}
