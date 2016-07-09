"use strict";
var config = require('../config');
var i18n = require('../i18n/localeMessage');
var hospitalDAO = require('../dao/hospitalDAO');
var _ = require('lodash');
var Promise = require('bluebird');
var moment = require('moment');
var redis = require('../common/redisClient');
var md5 = require('md5');
module.exports = {
    getHospitals: function (req, res, next) {
        var conditions = [];
        if (req.query.districtId) conditions.push('districtId like \'%' + req.query.districtId + '%\'');
        if (req.query.provId) conditions.push('provId like \'%' + req.query.provId + '%\'');
        if (req.query.cityId) conditions.push('cityId like \'%' + req.query.cityId + '%\'');
        hospitalDAO.findAll({
            from: req.query.from,
            size: req.query.size
        }, conditions, req.query.lat, req.query.lng).then(function (hospitals) {
            hospitals && hospitals.forEach(function (hospital) {
                if (hospital.distance) {
                    hospital.distance = hospital.distance < 1000 ? hospital.distance + '米' : (hospital.distance / 1000).toFixed(2) + '公里';
                } else {
                    hospital.distance = 0;
                }
            });
            return res.send({ret: 0, data: hospitals});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    searchHospital: function (req, res, next) {
        var conditions = [];
        if (req.query.districtId) conditions.push('districtId like \'%' + req.query.districtId + '%\'');
        if (req.query.provId) conditions.push('provId like \'%' + req.query.provId + '%\'');
        if (req.query.cityId) conditions.push('cityId like \'%' + req.query.cityId + '%\'');
        hospitalDAO.searchHospital(req.query.name, {
            from: req.query.from,
            size: req.query.size
        }, conditions, req.query.lat, req.query.lng).then(function (hospitals) {
            hospitals && hospitals.forEach(function (hospital) {
                if (hospital.distance) {
                    hospital.distance = hospital.distance < 1000 ? hospital.distance + '米' : (hospital.distance / 1000).toFixed(2) + '公里';
                } else {
                    hospital.distance = '0';
                }
            });
            return res.send({ret: 0, data: hospitals});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getHospitalById: function (req, res, next) {
        var queue = 'bid:' + req.user.id + ':favorite:' + 'hospitals';
        hospitalDAO.findHospitalById(req.params.hospitalId).then(function (hospitals) {
            if (!hospitals.length) return res.send({ret: 0, data: null});
            var hospital = hospitals[0];
            hospital.images = hospital.images ? hospital.images.split(',') : [];
            return redis.zrankAsync(queue, req.params.hospitalId).then(function (index) {
                hospital.favorited = (index != null);
                res.send({ret: 0, data: hospital});
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getDepartments: function (req, res, next) {
        var hospitalId = req.user.hospitalId;
        hospitalDAO.findDepartmentsBy(hospitalId).then(function (departments) {
            return res.send({ret: 0, data: departments});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDoctorsByDepartment: function (req, res, next) {
        var departmentId = req.params.departmentId;
        var hospitalId = req.user.hospitalId;
        hospitalDAO.findDoctorsByDepartment(hospitalId, departmentId).then(function (doctors) {
            return res.send({ret: 0, data: doctors});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDoctorById: function (req, res, next) {
        var doctor = {};
        hospitalDAO.findDoctorById(req.params.doctorId).then(function (doctors) {
            doctor = doctors[0];
            doctor.images = doctor.images ? doctor.images.split(',') : [];
            res.send({ret: 0, data: doctor});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getShitPlan: function (req, res, next) {
        var doctorId = req.params.doctorId;
        var start = moment(req.query.d).add(-1, 'd').format('YYYY-MM-DD');
        var end = moment(req.query.d).add(1, 'w').format('YYYY-MM-DD');
        hospitalDAO.findShiftPlans(doctorId, start, end, req.query.pid).then(function (plans) {
            var filteredPlans = _.filter(plans, function (p) {
                var date = p.day + ' ' + p.period.split('-')[0];
                return moment(date, 'YYYY-MM-DD HH:mm').isAfter(moment());
            });

            var sortedPlans = _.sortBy(filteredPlans, function (item) {
                var date = item.day + ' ' + item.period.split('-')[0];
                return moment(date, 'YYYY-MM-DD HH:mm');
            });
            var data = _.groupBy(sortedPlans, function (plan) {
                moment.locale('zh_CN');
                return moment(plan.day).format('YYYY-MM-DD dddd');
            });
            var result = [];
            for (var key in data) {
                var p = key.split(' ');
                var item = {
                    day: p[0], weekName: p[1], actualQuantity: _.sum(data[key], function (item) {
                        return item.actualQuantity;
                    }), plannedQuantity: _.sum(data[key], function (item) {
                        return item.plannedQuantity;
                    }), periods: data[key]
                };
                item.periods.forEach(function (object) {
                    delete object.day;
                });
                result.push(item);
            }
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    agentPreRegistration: function (req, res, next) {
        var registration = req.body;
        var pid = req.body.pid;
        hospitalDAO.findShiftPlanByDoctorAndShiftPeriod(registration.doctorId, registration.registerDate, registration.shiftPeriod).then(function (plans) {
            if (!plans.length || (plans[0].plannedQuantity <= +plans[0].actualQuantity)) {
                return res.send({ret: 1, message: i18n.get('doctor.shift.plan.invalid')});
            } else {
                hospitalDAO.findBySalesManPatientById(req.body.pid).then(function (ps) {
                    delete registration.pid;
                    var p = ps[0];
                    registration = _.assign(registration, {
                        patientName: p.name, patientMobile: p.mobile,
                        gender: p.gender,
                        createDate: new Date()
                    });
                    return hospitalDAO.findDoctorById(registration.doctorId);
                }).then(function (doctors) {
                    var doctor = doctors[0];
                    registration = _.assign(registration, {
                        departmentId: doctor.departmentId,
                        departmentName: doctor.departmentName,
                        hospitalId: doctor.hospitalId,
                        hospitalName: doctor.hospitalName,
                        registrationFee: doctor.registrationFee,
                        doctorName: doctor.name,
                        doctorJobTitle: doctor.jobTitle,
                        doctorJobTitleId: doctor.jobTitleId,
                        doctorHeadPic: doctor.headPic,
                        paymentType: 1,
                        status: 0,
                        registrationType: 7,
                        memberType: 1,
                        businessPeopleId: req.user.id,
                        businessPeopleName: req.user.name,
                        creator: req.user.id
                    });
                    return hospitalDAO.findPatientBasicInfoBy(registration.patientMobile);
                }).then(function (patientBasicInfoList) {
                    if (patientBasicInfoList.length) {
                        registration.patientBasicInfoId = patientBasicInfoList[0].id;
                        return redis.incrAsync('doctor:' + registration.doctorId + ':d:' + registration.registerDate + ':period:' + registration.shiftPeriod + ':incr').then(function (seq) {
                            return redis.getAsync('h:' + req.user.hospitalId + ':p:' + registration.shiftPeriod).then(function (sp) {
                                registration.sequence = sp + seq;
                                registration.outPatientType = 0;
                                registration.outpatientStatus = 5;
                                return hospitalDAO.findPatientByBasicInfoId(registration.patientBasicInfoId, req.user.hospitalId);
                            });
                        });
                    }
                    return hospitalDAO.insertPatientBasicInfo({
                        name: registration.patientName,
                        realName: registration.patientName,
                        mobile: registration.patientMobile,
                        gender: registration.gender,
                        createDate: new Date(),
                        password: md5(registration.patientMobile.substring(registration.patientMobile.length - 6, registration.patientMobile.length)),
                        creator: req.user.id
                    }).then(function (result) {
                        registration.patientBasicInfoId = result.insertId;
                        return redis.incrAsync('doctor:' + registration.doctorId + ':d:' + registration.registerDate + ':period:' + registration.shiftPeriod + ':incr').then(function (seq) {
                            return redis.getAsync('h:' + req.user.hospitalId + ':p:' + registration.shiftPeriod).then(function (sp) {
                                registration.sequence = sp + seq;
                                registration.outPatientType = 0;
                                registration.outpatientStatus = 5;
                                return hospitalDAO.findPatientByBasicInfoId(registration.patientBasicInfoId, req.user.hospitalId);
                            });
                        });
                    });
                }).then(function (result) {
                    if (!result.length) {
                        return redis.incrAsync('member.no.incr').then(function (memberNo) {
                            return hospitalDAO.insertPatient({
                                patientBasicInfoId: registration.patientBasicInfoId,
                                hospitalId: req.user.hospitalId,
                                memberType: 1,
                                balance: 0.00,
                                memberCardNo: registration.hospitalId + '-1-' + _.padLeft(memberNo, 7, '0'),
                                createDate: new Date()
                            }).then(function (patient) {
                                registration.patientId = patient.insertId;
                                return hospitalDAO.insertRegistration(registration);
                            });
                        });
                    } else {
                        registration.patientId = result[0].id;
                    }
                    return hospitalDAO.insertRegistration(registration);
                }).then(function () {
                    return hospitalDAO.updateShiftPlan(registration.doctorId, registration.registerDate, registration.shiftPeriod);
                }).then(function () {
                    return hospitalDAO.updatePatientAgentable(registration.patientMobile, req.user.id);
                }).then(function () {
                    return hospitalDAO.updatePatientAgentTimes(pid);
                }).then(function (result) {
                    return hospitalDAO.findShiftPeriodById(req.user.hospitalId, registration.shiftPeriod);
                }).then(function (result) {
                    redis.incr('h:' + req.user.hospitalId + ':u:' + req.user.id + ':r:' + moment().format('YYYYMMDD'));
                    redis.incr('h:' + req.user.hospitalId + ':u:' + req.user.id + ':r:' + moment().format('YYYYMM'));
                    return res.send({
                        ret: 0,
                        data: {
                            id: registration.id,
                            registerDate: registration.registerDate,
                            hospitalName: registration.hospitalName,
                            departmentName: registration.departmentName,
                            doctorName: registration.doctorName, jobTtile: registration.doctorJobTtile,
                            shiftPeriod: result[0].name
                        }
                    });
                });
            }
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getMyPreRegistrations: function (req, res, next) {
        hospitalDAO.findRegistrations(req.user.id, {
            from: +req.query.from,
            size: +req.query.size
        }).then(function (registrations) {
            res.send({ret: 0, data: registrations});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    favoriteDoctor: function (req, res, next) {
        var uid = req.user.id;
        var queue = 'b:uid:' + uid + ':favorite:' + 'doctors';
        var doctorId = req.body.doctorId;
        var result = {uid: uid, doctorId: doctorId, favourited: true};
        redis.zrankAsync(queue, doctorId).then(function (index) {
            if (index == null) return redis.zadd(queue, new Date().getTime(), doctorId);
            result.favourited = false;
            return redis.zrem(queue, doctorId);
        }).then(function () {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    }
    ,
    favoriteHospital: function (req, res, next) {
        var uid = req.user.id;
        var queue = 'b:uid:' + uid + ':favorite:' + 'hospitals';
        var hospitalId = req.body.hospitalId;
        var favoriteQueue = 'b:h:' + hospitalId + ':favorite:' + 'patients';
        var result = {uid: uid, hospitalId: hospitalId, favourited: true};
        redis.zrankAsync(queue, hospitalId).then(function (index) {
            if (index == null) {
                redis.zadd(favoriteQueue, new Date().getTime(), uid);
                return redis.zadd(queue, new Date().getTime(), hospitalId);
            }
            result.favourited = false;
            redis.zrem(favoriteQueue, uid);
            return redis.zrem(queue, hospitalId);
        }).then(function () {
            return hospitalDAO.findHospitalById(hospitalId);
        }).then(function (cs) {
            res.send({ret: 0, data: result});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getFavouritedDoctors: function (req, res, next) {
        var uid = req.user.id;
        var queue = 'b:uid:' + uid + ':favorite:' + 'doctors';
        redis.zrangeAsync([queue, +req.query.from, +req.query.from + (+req.query.size) - 1]).then(function (ids) {
            if (!ids.length) return [];
            return hospitalDAO.findDoctorByIds(ids.join(','));
        }).then(function (doctors) {
            res.send({ret: 0, data: doctors});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getFavouritedHospitals: function (req, res, next) {
        var uid = req.user.id;
        var queue = 'b:uid:' + uid + ':favorite:' + 'hospitals';
        redis.zrangeAsync([queue, +req.query.from, +req.query.from + (+req.query.size) - 1]).then(function (ids) {
            if (!ids.length) return [];
            return hospitalDAO.findHospitalsByIdsMin(ids.join(','));
        }).then(function (hospitals) {
            res.send({ret: 0, data: hospitals});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    }
}
