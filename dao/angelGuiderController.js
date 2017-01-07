"use strict";
var config = require('../config');
var _ = require('lodash');
var md5 = require('md5');
var redis = require('../common/redisClient');
var i18n = require('../i18n/localeMessage');
var angelGuiderDAO = require('../dao/angelGuiderDAO');
var moment = require('moment');
var request = require('request-promise');
module.exports = {
    addAngelGuider: function (req, res, next) {
        var guider = _.assign(req.body, {
            createDate: new Date(),
            balance: 0,
            status: 0,
            agency: req.user.id,
            agencyName: req.user.realName,
            accountName: req.body.realName,
            password: md5(config.guider.defaultPassword)
        });
        angelGuiderDAO.insertAngelGuider(guider).then(function (result) {
            guider.id = result.insertId;
        }).then(function (result) {
            return angelGuiderDAO.insertAccount({
                uid: guider.id,
                updateDate: new Date(),
                accountNo: 'B' + req.user.id + '-' + moment().format('YYMMDD') + guider.id,
                balance: 0.00,
                accountName: req.body.realName,
                availableBalance: 0.00,
                status: 0,
                type: 0
            })
        }).then(function (result) {
            res.send({ret: 0, data: guider, message: '导医账号已成功开通，初始密码为' + config.guider.defaultPassword})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message})
        });
        return next();
    },
    updateAngelGuider: function (req, res, next) {
        var guider = req.body;
        angelGuiderDAO.updateAngelGuider(guider).then(function (result) {
            res.send({ret: 0, message: '更新成功。'});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message})
        });
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
        angelGuiderDAO.findAccount(req.user.id).then(function (result) {
            res.send({ret: 0, data: result[0]});
        }).catch(function (err) {
            res.send({ret: 1, messsage: err.message});
        });
        return next();
    },
    getBills: function (req, res, next) {
        angelGuiderDAO.findBills(req.user.id).then(function (bills) {
            var data = _.chain(bills).groupBy(function (bill) {
                return moment(bill.createDate).format('YYYYMM');
            }).map(function (value, key) {
                var item = {items: value, month: key};
                item['sum'] = _.reduce(value, function (sum, bill) {
                    return sum + bill.amount;
                }, 0);
                return item;
            }).sortBy(function(bill){
                return bill.month;
            });
            res.send({ret: 0, data: data});
        });
        return next()
    },
    postWithdrawApplication: function (req, res, next) {
        var guider = req.user.id;
        var withdraw = {};
        redis.incrAsync('w:' + moment().format('YYYYMMDD') + ':incr').then(function (withDrawNo) {
            return angelGuiderDAO.insertWithDrawApplication(_.assign(req.body, {
                createDate: new Date(),
                uid: req.user.id,
                status: 0,
                withdrawNo: moment().format('YYYYMMDD') + _.padLeft(withDrawNo, 5, '0')
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
            return angelGuiderDAO.updateWithDrawApplication(_.assign(withdraw, {
                transactionFlowId: body.id,
                accountId: body.accountId
            }));
        }).then(function (result) {
            res.send({ret: 0, message: '提现申请成功。'})
        });
        return next();
    },
    getBankByBinCode: function (req, res, next) {
        var code = req.params.binCode;
        angelGuiderDAO.findBankByBinCode(code).then(function (banks) {
            if (!banks || banks.length < 1) res.send({ret: 0, data: []});
            res.send({ret: 0, data: banks[0]})
        })
    }
}