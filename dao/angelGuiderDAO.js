"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    findAll: function (uid, keywords) {
        if (!keywords) return db.query(sqlMapping.angelGuider.findAll, uid);
        return db.query(sqlMapping.angelGuider.findByKeywords, [uid, '%' + keywords + '%', '%' + keywords + '%']);
    },
    findByUserName: function (userName) {
        return db.query(sqlMapping.angelGuider.findByUserName, userName);
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
    findBankByBinCode: function (binCode) {
        return db.query(sqlMapping.account.findBankByBinCode, binCode);
    }
}
