"use strict";
var config = require('../config');
var _ = require('lodash');
var md5 = require('md5');
var redis = require('../common/redisClient');
var i18n = require('../i18n/localeMessage');
var angelGuiderDAO = require('../dao/angelGuiderDAO');
var moment = require('moment');
var request = require('request-promise');
var wechat = require('../common/wechat');
var util = require('util');

module.exports = {
    addAngelGuider: function (req, res, next) {
        var guider = _.assign(req.body, {
            createDate: new Date(),
            balance: 0,
            status: 0,
            agency: req.user.id,
            agencyName: req.user.realName,
            accountName: req.body.realName,
            angelGuiderAgency: req.user.angelGuiderAgency,
            password: md5(config.guider.defaultPassword)
        });
        angelGuiderDAO.findByUserName(req.body.mobile).then(function (guiders) {
            if (guiders && guiders.length > 0) throw new Error('改手机号码已经被别人注册');
            return angelGuiderDAO.insertAngelGuider(guider);
        }).then(function (result) {
            guider.id = result.insertId;
            return angelGuiderDAO.insertAccount({
                uid: guider.id,
                updateDate: new Date(),
                accountNo: 'B' + req.user.id + '-' + moment().format('YYMMDD') + guider.id,
                balance: 0.00,
                accountName: req.body.realName,
                availableBalance: 0.00,
                status: 0,
                type: 0
            });
        }).then(function (result) {
            res.send({ret: 0, data: guider, message: '导医账号已成功开通，初始密码为' + config.guider.defaultPassword})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message})
        });
        return next();
    },
    updateAngelGuider: function (req, res, next) {
        var guider = req.body;
        var binCode = guider.account && guider.account.substring(0, 6);
        if (binCode) {
            angelGuiderDAO.findBankByBinCode(binCode).then(function (banks) {
                if (banks && banks.length < 1) throw Error('不支持的银行卡');
                guider.bank = banks[0].bankName;
                return angelGuiderDAO.updateAngelGuider(guider)
            }).then(function (result) {
                res.send({ret: 0, message: '更新成功。'});
            }).catch(function (err) {
                res.send({ret: 1, message: err.message})
            });
        } else {
            angelGuiderDAO.updateAngelGuider(guider).then(function (result) {
                res.send({ret: 0, message: '更新成功。'});
            }).catch(function (err) {
                res.send({ret: 1, message: err.message})
            });
        }
        return next();
    },
    removeAngelGuider: function (req, res, next) {
        angelGuiderDAO.removeAngelGuider(req.params.id).then(function (result) {
            res.send({ret: 0, message: '注销成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message})
        });
        return next();
    },
    getAngelGuider: function (req, res, next) {
        var guider = {};
        angelGuiderDAO.findById(req.params.id).then(function (guiders) {
            if (!guiders || guiders.length < 1) return res.send({ret: 0, data: {}});
            guider = guiders[0];
            return redis.getAsync('u:' + guider.id + ':r');
        }).then(function (reply) {
            guider.totalRegistrationCount = (reply == null ? 0 : +reply);
        }).then(function (reply) {
            guider.monthlyRegistrationCount = (reply == null ? 0 : +reply);
            guider.gender = guider.gender ? +guider.gender : 0;
            res.send({ret: 0, data: guider});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message})
        });
        return next();
    },
    getAngelGuiders: function (req, res, next) {
        angelGuiderDAO.findAll(req.user.id, req.query.q).then(function (guiders) {
            if (guiders.length < 1) return res.send({ret: 0, data: []});
            res.send({ret: 0, data: guiders});
        });
        return next();
    },
    getAccountInfo: function (req, res, next) {
        var user = {};
        angelGuiderDAO.findAccount(req.user.id).then(function (result) {
            user = result[0];
            return redis.ttlAsync('uid:' + user.id + ':qrcode');
        }).then(function (reply) {
            if (reply && reply > 0) {
                return res.send({ret: 0, data: user.id});
            } else {
                wechat.getAccessToken(function (err, token) {
                    if (err) throw err;
                    return request({
                        method: 'POST',
                        uri: _.cloneDeep(config.wechat.createQrCode).replace('TOKEN', token),
                        body: {
                            expire_seconds: config.wechat.expire_seconds_qrCode,
                            action_name: 'QR_SCENE',
                            action_info: {scene: {scene_id: req.user.id}}
                        },
                        json: true
                    }).then(function (body) {
                        user.qrCode = body.url;
                        redis.expireAsync('uid:' + user.id + ':qrcode', body.expire_seconds);
                        redis.setAsync('ticket:' + body.ticket, user.id);
                        angelGuiderDAO.update({
                            id: user.id,
                            qrCode: user.qrCode,
                            scene_id: req.user.id
                        }).then(function (result) {
                            res.send({ret: 0, data: user});
                        });
                    })
                })
            }
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getBills: function (req, res, next) {
        angelGuiderDAO.findBills(req.user.id).then(function (bills) {
            var data = _.chain(bills).groupBy(function (bill) {
                return moment(bill.createDate).format('YYYYMM');
            }).map(function (value, key) {
                var item = {items: value, month: key};
                value && value.forEach(function (b) {
                    if (b.bank && b.account) {
                        b.account = b.account.slice(0, 6) + _.repeat('*', b.account.length - 12) + b.account.slice(-6);
                        delete  b.businessPeopleName;
                        delete b.hospitalName;
                        delete b.patientName;
                        delete b.shiftPeriod;
                        delete b.feeType;
                    } else {
                        b.feeType = config.feeType[b.feeType];
                        delete b.account;
                        delete b.bank;
                    }
                });
                item['sum'] = _.reduce(value, function (sum, bill) {
                    return sum + bill.amount;
                }, 0);
                return item;
            }).sortByOrder(function (bill) {
                return bill.month
            }, ['desc']);
            res.send({ret: 0, data: data});
        });
        return next()
    },
    postWithdrawApplication: function (req, res, next) {
        var guider = req.user.id;
        var withdraw = req.body;
        var accountNo = {};
        redis.incrAsync('w:' + moment().format('YYYYMMDD') + ':incr').then(function (withDrawNo) {
            withdraw.withdrawNo = withDrawNo;
            return angelGuiderDAO.findAccount(guider);
        }).then(function (guiders) {
            accountNo = guiders[0].account;
            return angelGuiderDAO.insertWithDrawApplication(_.assign(withdraw, {
                createDate: new Date(),
                uid: req.user.id,
                status: 0,
                account: guiders[0].account,
                bank: guiders[0].bank,
                branch: guiders[0].branch,
                accountName: guiders[0].accountName,
                withdrawNo: moment().format('YYYYMMDD') + _.padLeft(withdraw.withdrawNo, 5, '0')
            }));
        }).then(function (result) {
            withdraw.id = result.insertId;
            return request({
                method: 'POST',
                uri: config.app.withdrawURI,
                body: {
                    uid: req.user.id,
                    amount: req.body.amount
                },
                json: true
            })
        }).then(function (body) {
            return angelGuiderDAO.updateWithDrawApplication({
                id: withdraw.id,
                transactionFlowId: body.id,
                accountId: body.accountId
            });
        }).then(function (result) {
            wechat.sendMessageWithRequest(req, util.format(config.wechat.withdrawApplicationSuccess, accountNo.substr(accountNo.length - 4, 4)));
            res.send({ret: 0, message: '提现申请成功。'})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message})
        });
        return next();
    }
    ,
    getBankByBinCode: function (req, res, next) {
        var code = req.params.binCode;
        angelGuiderDAO.findBankByBinCode(code).then(function (banks) {
            if (!banks || banks.length < 1) res.send({ret: 0, data: {}, message: '目前不支持此银行'});
            res.send({ret: 0, data: banks[0]})
        })
    }
    ,
    unbindAccount: function (req, res, next) {
        angelGuiderDAO.updateAngelGuider({
            id: req.user.id,
            bank: null,
            account: null,
            branch: null,
            accountName: null
        }).then(function (result) {
            res.send({ret: 0, message: '解绑成功'})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message})
        });
        return next();
    }
    ,
    postFeedback: function (req, res, next) {
        var rid = req.params.rid;
        angelGuiderDAO.findFeedbackByRegistrationId(req.params.rid).then(function (feedbacks) {
            if (feedbacks.length > 0) throw new Error('代约不支持重复提交反馈。');
            var feedback = _.assign(req.body, {
                createDate: new Date(), isAgency: (req.user.agency ? 0 : 1),
                type: req.body.type.join(','),
                angelGuider: req.user.id, angelGuiderName: req.user.name, registrationId: req.params.rid
            });
            angelGuiderDAO.addFeedback(feedback).then(function (result) {
                feedback.id = result.insertId;
                return angelGuiderDAO.updateRegistrationFeedback(rid);
            }).then(function (result) {
                wechat.sendMessageWithRequest(req, config.wechat.feedbackSuccess);
                res.send({ret: 0, data: feedback});
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    }
    ,
    getFeedback: function (req, res, next) {
        angelGuiderDAO.findFeedbackByRegistrationId(req.params.rid).then(function (feedback) {
            if (!feedback.length) return res.send({ret: 0, data: {}});
            feedback && feedback.forEach(function (fb) {
                fb.type = fb.type.split(',');
            });
            res.send({ret: 0, data: feedback[0]});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    }
    ,
    getFeedbackTypes: function (req, res, next) {
        res.send({ret: 0, data: config.feedbackTypes});
        return next();
    }
    ,
    getActivities: function (req, res, next) {
        var conditions = [];
        if (req.query.title) conditions.push('title like \'%' + req.query.title + '%\'');
        if (req.query.provId) conditions.push('cities like \'%"provId":"' + req.query.provId + '"%\'');
        if (req.query.cityId) conditions.push('cities like \'%"cityId":"' + req.query.cityId + '"%\'');
        angelGuiderDAO.findActivities(conditions).then(function (activities) {
            activities && activities.length > 0 && activities.forEach(function (activity) {
                if (activity.cities) activity.cities = JSON.stringify(activity.cities);
            });
            res.send({ret: 0, data: activities});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    }
}