"use strict";
var md5 = require('md5');
var redis = require('../common/redisClient');
var config = require('../config');
var angelGuiderDAO = require('../dao/angelGuiderDAO');
var i18n = require('../i18n/localeMessage');
var _ = require('lodash');
var moment = require('moment');
var uuid = require('node-uuid');
var ic = require("../common/invitationCode");
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
    }
}
