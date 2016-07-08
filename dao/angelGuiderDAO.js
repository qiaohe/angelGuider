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
    update: function(angelGuider) {
        return db.query(sqlMapping.angelGuider.update, [angelGuider, angelGuider.id]);
    },
    findPerformances: function(salesMan) {
        return db.query(sqlMapping.performance.findPerformances, [salesMan]);

    }
}
