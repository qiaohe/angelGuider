"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    findAll: function (uid, keywords) {
        if (!keywords) return db.query(sqlMapping.angelGuider.findAll, uid);
        return db.query(sqlMapping.angelGuider.findByKeywords, [uid, '%' + keywords + '%', '%' + keywords + '%']);
    },
    findByUserName: function (userName) {
        return db.query(sqlMapping.angelGuider.findByUserName, [userName, userName]);
    },
    findByMobile: function (mobile) {
        return db.query(sqlMapping.angelGuider.findByMobile, mobile)
    },

    findByInvitationCode: function (code) {
        return db.query(sqlMapping.angelGuider.findByInvitationCode, code)
    },

    insert: function (guider) {
        return db.query(sqlMapping.angelGuider.insert, guider);
    },
    updatePassword: function (password, userName) {
        return db.query(sqlMapping.angelGuider.updatePassword, [password, userName]);
    },
    update: function (angelGuider) {
        return db.query(sqlMapping.angelGuider.update, [angelGuider, angelGuider.id]);
    },
    insertAngelGuider: function (guider) {
        return db.query(sqlMapping.angelGuider.insertAngelGuider, guider);
    },
    insertAccount: function (account) {
        return db.query(sqlMapping.account.insert, account);
    },
    updateAngelGuider: function (guider) {
        return db.query(sqlMapping.angelGuider.updateAngelGuider, [guider, guider.id]);
    },
    removeAngelGuider: function (id) {
        return db.query(sqlMapping.angelGuider.removeAngelGuider, id);
    },
    findById: function (id) {
        return db.query(sqlMapping.angelGuider.findById, id);
    },
    findAccount: function (guiderId) {
        return db.query(sqlMapping.angelGuider.findAccount, guiderId);
    },
    findBills: function (guider) {
        return db.query(sqlMapping.account.findBills, guider);
    },
    insertWithDrawApplication: function (application) {
        return db.query(sqlMapping.account.insertWithDrawApplication, application);
    },

    updateWithDrawApplication: function (application) {
        return db.query(sqlMapping.account.updateWithDrawApplication, [application, application.id]);
    },
    findBankByBinCode: function (binCode) {
        return db.query(sqlMapping.account.findBankByBinCode, binCode);
    },
    addFeedback: function (feedback) {
        return db.query(sqlMapping.feedback.insert, feedback);
    },
    findFeedbackByRegistrationId: function (registrationId) {
        return db.query(sqlMapping.feedback.findByRegistrationId, registrationId);
    },
    updateRegistrationFeedback: function (rid) {
        return db.query(sqlMapping.feedback.updateRegistrationFeedback, [1, rid]);
    },
    findActivities: function (conditions) {
        var sql = sqlMapping.feedback.findActivities;
        if (conditions && conditions.length) {
            sql = sql + ' where ' + conditions.join(' and ');
        }
        return db.query(sql);
    },
    findWeChatUserByOpenId: function (openId) {
        return db.query(sqlMapping.wechatUser.findByOpenId, openId);
    },
    insertWeChatUser: function (weChatUser) {
        return db.query(sqlMapping.wechatUser.insert, weChatUser);
    },
    findGuiderByOpenId: function (openId) {
        return db.query(sqlMapping.wechatUser.findGuiderByOpenId, openId);
    },
    findWeChatUserByMobile: function (mobile) {
        return db.query(sqlMapping.wechatUser.findByMobile, mobile);
    },
    updateWeChatUser: function (user) {
        return db.query(sqlMapping.wechatUser.update, [user, user.id]);
    },
    findOpenIdByGuiderId: function (guiderId) {
        return db.query(sqlMapping.wechatUser.findOpenIdByGuiderId, guiderId);
    }
}
