"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    findById: function (hospitalId) {
        return db.query(sqlMapping.hospital.findById, hospitalId);
    },
    findAll: function (page, conditions, lat, lng) {
        if (lat && lng) {
            if (conditions.length)
                return db.query('select Hospital.id, recipeShare*angelGuiderShare as recipeShare, prescriptionShare*angelGuiderShare as prescriptionShare,recommendationFee*angelGuiderShare as recommendationFee,  name, tag, icon, concat(provId,cityId, districtId) as city,ROUND(6378.138*2*ASIN(SQRT(POW(SIN(( ? * PI()/180-lat*PI()/180)/2),2)+COS( ? *PI()/180)*COS(lat*PI()/180)*POW(SIN(( ? * PI()/180-lng*PI()/180)/2),2)))*1000) AS distance, telephone from Hospital where ' + conditions.join(' and ') + ' order by distance limit ' + page.from + ',' + page.size, [lat, lat, lng])
            else
                return db.query('select Hospital.id, recipeShare*angelGuiderShare as recipeShare, prescriptionShare*angelGuiderShare as prescriptionShare,recommendationFee*angelGuiderShare as recommendationFee,name, tag, icon, concat(provId,cityId, districtId) as city,ROUND(6378.138*2*ASIN(SQRT(POW(SIN(( ? * PI()/180-lat*PI()/180)/2),2)+COS( ? *PI()/180)*COS(lat*PI()/180)*POW(SIN(( ? * PI()/180-lng*PI()/180)/2),2)))*1000) AS distance, telephone from Hospital order by distance limit ' + page.from + ',' + page.size, [lat, lat, lng])
        }
        if (conditions.length)
            return db.query('select recipeShare*angelGuiderShare as recipeShare, prescriptionShare*angelGuiderShare as prescriptionShare,recommendationFee*angelGuiderShare as recommendationFee,Hospital.id, name, tag, icon,telephone, concat(provId,cityId, districtId) as city from Hospital where ' + conditions.join(' and ') + ' limit ' + page.from + ',' + page.size);
        else
            return db.query('select recipeShare*angelGuiderShare as recipeShare, prescriptionShare*angelGuiderShare as prescriptionShare,recommendationFee*angelGuiderShare as recommendationFee,Hospital.id, name, tag, icon, telephone,concat(provId,cityId, districtId) as city from Hospital limit ' + page.from + ',' + page.size)
    },
    searchHospital: function (name, page, conditions, lat, lng) {
        if (lat && lng) {
            if (conditions.length)
                return db.query('select recipeShare*angelGuiderShare as recipeShare, prescriptionShare*angelGuiderShare as prescriptionShare,recommendationFee*angelGuiderShare as recommendationFee,Hospital.id, name, tag, icon,telephone, concat(provId,cityId, districtId) as city,ROUND(6378.138*2*ASIN(SQRT(POW(SIN(( ? * PI()/180-lat*PI()/180)/2),2)+COS( ? *PI()/180)*COS(lat*PI()/180)*POW(SIN(( ? * PI()/180-lng*PI()/180)/2),2)))*1000) AS distance from Hospital where name like \'%' + name + '%\' and ' + conditions.join(' and ') + ' order by distance limit ' + page.from + ',' + page.size, [lat, lat, lng]);
            return db.query('select recipeShare*angelGuiderShare as recipeShare, prescriptionShare*angelGuiderShare as prescriptionShare,recommendationFee*angelGuiderShare as recommendationFee,Hospital.id, name, tag, icon, telephone, concat(provId,cityId, districtId) as city,ROUND(6378.138*2*ASIN(SQRT(POW(SIN(( ? * PI()/180-lat*PI()/180)/2),2)+COS( ? *PI()/180)*COS(lat*PI()/180)*POW(SIN(( ? * PI()/180-lng*PI()/180)/2),2)))*1000) AS distance from Hospital where name like \'%' + name + '%\' order by distance limit ' + page.from + ',' + page.size, [lat, lat, lng]);
        }
        if (conditions.length)
            return db.query('select recipeShare*angelGuiderShare as recipeShare, prescriptionShare*angelGuiderShare as prescriptionShare,recommendationFee*angelGuiderShare as recommendationFee,id, name, tag, icon,telephone, concat(provId,cityId, districtId) as city from Hospital where name like \'%' + name + '%\' and ' + conditions.join(' and ') + ' limit ' + page.from + ',' + page.size);
        return db.query('select recipeShare*angelGuiderShare as recipeShare, prescriptionShare*angelGuiderShare as prescriptionShare,recommendationFee*angelGuiderShare as recommendationFee,id, name, tag, icon,telephone, concat(provId,cityId, districtId) as city from Hospital where name like \'%' + name + '%\' limit ' + page.from + ',' + page.size);
    },
    findHospitalById: function (hospitalId) {
        return db.query(sqlMapping.hospital.findById, hospitalId);
    },

    findDepartmentsBy: function (hospitalId) {
        return db.query(sqlMapping.hospital.findByHospital, hospitalId);
    },
    findDoctorsByDepartment: function (hospitalId, departmentId) {
        return db.query(sqlMapping.hospital.findByDepartment, [hospitalId, departmentId]);
    },
    findDoctorById: function (doctorId) {
        return db.query(sqlMapping.hospital.findDoctorById, doctorId);
    },
    findShiftPlans: function (doctorId, start, end) {
        return db.query(sqlMapping.hospital.findShitPlans, [+doctorId, start, end, +doctorId]);
    },
    updateShiftPlanDec: function (doctorId, registerDate, shiftPeriod) {
        return db.query(sqlMapping.registration.updateShiftPlanDec, [doctorId, registerDate, shiftPeriod])
    },
    findShiftPlanByDoctorAndShiftPeriod: function (doctorId, day, shiftPeriod) {
        return db.query(sqlMapping.hospital.findShiftPlanByDoctorAndShiftPeriod, [doctorId, day, shiftPeriod]);
    },
    findBySalesManPatientById: function (pid) {
        return db.query(sqlMapping.hospital.findBySalesManPatientById, pid);
    },
    findPatientBasicInfoBy: function (mobile) {
        return db.query(sqlMapping.hospital.findPatientBasicInfoBy, mobile);
    },
    findPatientByBasicInfoId: function (patientBasicInfoId, hospitalId) {
        return db.query(sqlMapping.hospital.findPatientByBasicInfoId, [patientBasicInfoId, hospitalId]);
    },
    insertPatientBasicInfo: function (p) {
        return db.query(sqlMapping.hospital.insertPatientBasicInfo, p);
    },
    insertPatient: function (patient) {
        return db.query(sqlMapping.hospital.insertPatient, patient)
    },
    insertRegistration: function (registration) {
        return db.query(sqlMapping.hospital.insertRegistration, registration);
    },
    updateShiftPlan: function (doctorId, registerDate, shiftPeriod) {
        return db.query(sqlMapping.hospital.updateShiftPlan, [doctorId, registerDate, shiftPeriod])
    },
    findShiftPeriodById: function (hospitalId, periodId) {
        return db.query(sqlMapping.hospital.findShiftPeriodById, [hospitalId, periodId]);
    },
    findRegistrations: function (guiderId, page, status) {
        var sql = sqlMapping.hospital.findRegistrations;
        if (status == 0) sql = sql + ' and r.outPatientStatus in (0, 6)';
        if (status == 1) sql = sql + ' and r.outPatientStatus=1';
        if (status == 2) sql = sql + ' and r.outPatientStatus in (2,3,4,5)';
        sql = sql + ' order by r.createDate desc limit ?, ?';
        return db.query(sql, [guiderId, page.from, page.size]);
    },

    findHospitalIds: function () {
        return db.query('select id from Hospital');
    },
    findPeriods: function (hospitalId) {
        return db.query('select id from ShiftPeriod where hospitalId = ? order by name', hospitalId);
    },
    findDoctorByIds: function (ids) {
        var sql = 'select id, name, departmentName,hospitalId, hospitalName, headPic,registrationFee, speciality,jobTitle ' +
            'from Doctor where id in(' + ids + ') order by field(id, ' + ids + ')';
        return db.query(sql);
    },
    findHospitalsByIdsMin: function (ids) {
        var sql = 'select recipeShare*angelGuiderShare as recipeShare, prescriptionShare*angelGuiderShare as prescriptionShare,recommendationFee*angelGuiderShare as recommendationFee,id, name, tag, images, address, icon, customerServiceUid,telephone from Hospital where id in(' + ids + ') order by field(id, ' + ids + ')';
        return db.query(sql);
    },
    searchDoctor: function (name, page) {
        return db.query('select id, name, departmentName, hospitalName, headPic,registrationFee, speciality,jobTitle from Doctor where name like \'%' + name + '%\' limit ' + page.from + ',' + page.size);
    },
    findRegistrationById: function (rid) {
        return db.query(sqlMapping.registration.findById, rid);
    },

    updateRegistration: function (registration) {
        return db.query(sqlMapping.registration.updateRegistration, [registration, registration.id]);
    },
    getPatients: function (uid, page, keywords) {
        var sql = sqlMapping.wechatUser.findPatients;
        if (keywords) sql = sql + ' and w.nickname like \'%' + keywords + '%\' or w.bindMobile  like \'%' + keywords + '%\'';
        sql = sql + ' limit ?, ?';
        return db.query(sql, [uid, +page.from, +page.size]);
    },

    findOutpatientHistories: function (uid, page) {
        var sql = sqlMapping.hospital.findOutpatientHistories;
        // if (status == 0) sql = sql + ' and r.outPatientStatus in (0, 6)';
        // if (status == 1) sql = sql + ' and r.outPatientStatus=1';
        // if (status == 2) sql = sql + ' and r.outPatientStatus in (2,3,4,5)';
        sql = sql + ' order by r.createDate desc limit ?, ?';
        return db.query(sql, [uid, page.from, page.size]);
    },
    findOutpatientHistoriesByGuiderId: function (uid, page) {
        var sql = sqlMapping.hospital.findOutpatientHistoriesByGuiderId;
        // if (status == 0) sql = sql + ' and r.outPatientStatus in (0, 6)';
        // if (status == 1) sql = sql + ' and r.outPatientStatus=1';
        // if (status == 2) sql = sql + ' and r.outPatientStatus in (2,3,4,5)';
        sql = sql + ' order by r.createDate desc limit ?, ?';
        return db.query(sql, [uid, page.from, page.size]);
    },
    countOutpatientHistories: function (uid) {
        var sql = sqlMapping.hospital.countOutpatientHistories;
        return db.query(sql, uid);
    }
}
