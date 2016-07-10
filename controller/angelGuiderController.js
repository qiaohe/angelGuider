"use strict";
var config = require('../config');
var _ = require('lodash');
var md5 = require('md5');
var redis = require('../common/redisClient');
var i18n = require('../i18n/localeMessage');
var angelGuiderDAO = require('../dao/angelGuiderDAO');
module.exports = {
    addAngelGuider: function (req, res, next) {
        var guider = _.assign(req.body, {
            createDate: new Date(),
            realName: req.body.name,
            balance: 0,
            status: 0,
            agency: req.user.id,
            agencyName: req.user.name,
            password: md5(config.guider.defaultPassword)
        });
        angelGuiderDAO.insertAngelGuider(guider).then(function (result) {
            guider.id = result.insertId;
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
        angelGuiderDAO.findById(req.params.id).then(function (guiders) {
            if (!guiders || guiders.length < 1) return res.send({ret: 0, data: {}});
            guiders[0].status = config.angelGuiderStatus[guiders[0].status];
            res.send({ret: 0, data: guiders[0]})
        }).catch(function (err) {
            res.send({ret: 1, message: err.message})
        });
        return next();
    }

}