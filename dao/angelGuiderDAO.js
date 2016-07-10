"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
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
    updateAngelGuider: function (guider) {
        return db.query(sqlMapping.angelGuider.updateAngelGuider, [guider, guider.id]);
    },
    removeAngelGuider: function (id) {
        return db.query(sqlMapping.angelGuider.removeAngelGuider, id);
    },
    findById: function (id) {
        return db.query(sqlMapping.angelGuider.findById, id);
    }
}
