"use strict";
var config = require('../config');
var i18n = require('../i18n/localeMessage');
var hospitalDAO = require('../dao/hospitalDAO');
var deviceDAO = require('../dao/deviceDAO');
var pusher = require('../domain/NotificationPusher');
var _ = require('lodash');
var moment = require('moment');
var redis = require('../common/redisClient');
var md5 = require('md5');
var util = require('util');
var Promise = require('bluebird');
var request = require('request');
module.exports = {
    getHospitals: function (req, res, next) {
        var conditions = [];
        conditions.push('onlineDateInAngelGuide is not null');
        conditions.push('angelGuideStatus=0');
        if (req.query.districtId) conditions.push('districtId like \'%' + req.query.districtId + '%\'');
        if (req.query.provId) conditions.push('provId like \'%' + req.query.provId + '%\'');
        if (req.query.cityId) conditions.push('cityId like \'%' + req.query.cityId + '%\'');
        hospitalDAO.findAll({
            from: req.query.from,
            size: req.query.size
        }, conditions, req.query.lat, req.query.lng).then(function (hospitals) {
            Promise.map(hospitals, function (hospital) {
                hospital.distance = (hospital.distance ? hospital.distance < 1000 ? hospital.distance + '米' : (hospital.distance / 1000).toFixed(2) + '公里' : 0);
                var queue = 'b:uid:' + req.user.id + ':favorite:' + 'hospitals';
                return redis.zrankAsync(queue, hospital.id).then(function (index) {
                    hospital.favorited = (index != null);
                });
            }).then(function (result) {
                return res.send({ret: 0, data: hospitals});
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    searchHospital: function (req, res, next) {
        var conditions = [];
        conditions.push('onlineDateInAngelGuide is not null');
        if (req.query.districtId) conditions.push('districtId like \'%' + req.query.districtId + '%\'');
        if (req.query.provId) conditions.push('provId like \'%' + req.query.provId + '%\'');
        if (req.query.cityId) conditions.push('cityId like \'%' + req.query.cityId + '%\'');
        hospitalDAO.searchHospital(req.query.name, {
            from: req.query.from,
            size: req.query.size
        }, conditions, req.query.lat, req.query.lng).then(function (hospitals) {
            Promise.map(hospitals, function (hospital) {
                hospital.distance = (hospital.distance ? hospital.distance < 1000 ? hospital.distance + '米' : (hospital.distance / 1000).toFixed(2) + '公里' : 0);
                var queue = 'b:uid:' + req.user.id + ':favorite:' + 'hospitals';
                return redis.zrankAsync(queue, hospital.id).then(function (index) {
                    hospital.favorited = (index != null);
                });
            }).then(function (result) {
                return res.send({ret: 0, data: hospitals});
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    searchDoctor: function (req, res, next) {
        hospitalDAO.searchDoctor(req.query.name, {from: req.query.from, size: req.query.size}).then(function (doctors) {
            if (!doctors) return res.send({ret: 0, data: []});
            Promise.map(doctors, function (doctor) {
                var queue = 'b:uid:' + req.user.id + ':favorite:' + 'doctors';
                return redis.zrankAsync(queue, doctor.id).then(function (index) {
                    doctor.favorited = (index != null);
                });
            }).then(function (result) {
                return res.send({ret: 0, data: doctors});
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getHospitalById: function (req, res, next) {
        var queue = 'b:uid:' + req.user.id + ':favorite:' + 'hospitals';
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
        var hospitalId = req.params.hospitalId;
        hospitalDAO.findDepartmentsBy(hospitalId).then(function (departments) {
            return res.send({ret: 0, data: departments});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },
    getDoctorsByDepartment: function (req, res, next) {
        var departmentId = req.params.departmentId;
        var hospitalId = req.params.hospitalId;
        hospitalDAO.findDoctorsByDepartment(hospitalId, departmentId).then(function (doctors) {
            Promise.map(doctors, function (doctor) {
                var queue = 'b:uid:' + req.user.id + ':favorite:' + 'doctors';
                return redis.zrankAsync(queue, doctor.id).then(function (index) {
                    doctor.favorited = (index != null);
                });
            }).then(function (result) {
                return res.send({ret: 0, data: doctors});
            });
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
        var end = moment(req.query.d).add(1, 'M').format('YYYY-MM-DD');
        hospitalDAO.findShiftPlans(doctorId, start, end).then(function (plans) {
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
        hospitalDAO.findShiftPlanByDoctorAndShiftPeriod(registration.doctorId, registration.registerDate, registration.shiftPeriod).then(function (plans) {
            if (!plans.length || (plans[0].plannedQuantity <= +plans[0].actualQuantity)) {
                return res.send({ret: 1, message: i18n.get('doctor.shift.plan.invalid')});
            } else {
                return hospitalDAO.findDoctorById(registration.doctorId).then(function (doctors) {
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
                        registrationType: 8,
                        memberType: 1,
                        businessPeopleId: req.user.id,
                        businessPeopleName: req.user.realName,
                        creator: req.user.id,
                        createDate: new Date()
                    });
                    return hospitalDAO.findPatientBasicInfoBy(registration.patientMobile);
                }).then(function (patientBasicInfoList) {
                    if (patientBasicInfoList.length) {
                        registration.patientBasicInfoId = patientBasicInfoList[0].id;
                        return redis.incrAsync('doctor:' + registration.doctorId + ':d:' + registration.registerDate + ':period:' + registration.shiftPeriod + ':incr').then(function (seq) {
                            return redis.getAsync('h:' + registration.hospitalId + ':p:' + registration.shiftPeriod).then(function (sp) {
                                registration.sequence = sp + seq;
                                registration.outPatientType = 0;
                                registration.outpatientStatus = 5;
                                return hospitalDAO.findPatientByBasicInfoId(registration.patientBasicInfoId, registration.hospitalId);
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
                            return redis.getAsync('h:' + registration.hospitalId + ':p:' + registration.shiftPeriod).then(function (sp) {
                                registration.sequence = sp + seq;
                                registration.outPatientType = 0;
                                registration.outpatientStatus = 5;
                                return hospitalDAO.findPatientByBasicInfoId(registration.patientBasicInfoId, registration.hospitalId);
                            });
                        });
                    });
                }).then(function (result) {
                    if (!result.length) {
                        return redis.incrAsync('member.no.incr').then(function (memberNo) {
                            return hospitalDAO.insertPatient({
                                patientBasicInfoId: registration.patientBasicInfoId,
                                hospitalId: registration.hospitalId,
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
                }).then(function (result) {
                    return hospitalDAO.findShiftPeriodById(registration.hospitalId, registration.shiftPeriod);
                }).then(function (result) {
                    redis.incr('u:' + req.user.id + ':r');
                    redis.incr('u:' + req.user.id + ':r:' + moment().format('YYYYMM'));
                    deviceDAO.findTokenByUid(req.user.id).then(function (tokens) {
                        if (tokens.length && tokens[0]) {
                            var notificationBody = {};
                            notificationBody = util.format(config.registrationNotificationTemplate, registration.patientName + (registration.gender == 0 ? '先生' : '女士'),
                                registration.hospitalName + registration.departmentName + registration.doctorName, moment(registration.registerDate).format('YYYY-MM-DD') + ' ' + result[0].name);
                            pusher.push({
                                body: notificationBody,
                                title: '预约提醒',
                                audience: {registration_id: [tokens[0].token]},
                                uid: req.user.id,
                                hospitalName: registration.hospitalName,
                                hospitalId: registration.hospitalId,
                                type: 0
                            }, function (err, result) {
                                if (err) throw err;
                            });
                        }
                    });
                    return hospitalDAO.findHospitalById(registration.hospitalId).then(function (hospitals) {
                        var address = hospitals[0].address;
                        var content = util.format(config.sms.registrationNotificationTemplate,
                            registration.hospitalName + registration.departmentName + registration.doctorName, moment(registration.registerDate).format('YYYY-MM-DD') + ' ' + result[0].name,
                            registration.hospitalName, address);
                        var option = {mobile: registration.patientMobile, text: content, apikey: config.sms.apikey};
                        return request.postAsync({
                            url: config.sms.providerUrl,
                            form: option
                        }).then(function (response, body) {
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
                        })
                    })
                });
            }
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    changeAgentPreRegistration: function (req, res, next) {
        var registration = req.body;
        registration.updateDate = new Date();
        hospitalDAO.findRegistrationById(registration.id).then(function (rs) {
            var oldRegistration = rs[0];
            registration.patientName = rs[0].patientName;
            registration.patientMobile = rs[0].patientMobile;
            registration.gender = rs[0].gender;
            registration.patientBasicInfoId = rs[0].patientBasicInfoId;
            return hospitalDAO.updateShiftPlanDec(rs[0].doctorId, rs[0].registerDate, rs[0].shiftPeriod);
        }).then(function () {
            return hospitalDAO.findDoctorById(registration.doctorId)
        }).then(function (doctors) {
            var doctor = doctors[0];
            registration.departmentId = doctor.departmentId;
            registration.departmentName = doctor.departmentName;
            registration.hospitalId = doctor.hospitalId;
            registration.hospitalName = doctor.hospitalName;
            registration.registrationFee = doctor.registrationFee;
            registration.doctorName = doctor.name;
            registration.doctorJobTitle = doctor.jobTitle;
            registration.doctorJobTitleId = doctor.jobTitleId;
            registration.doctorHeadPic = doctor.headPic;
            registration.status = 3;
            registration.outPatientType = 0;
            registration.outpatientStatus = 5;
            return redis.incrAsync('doctor:' + registration.doctorId + ':d:' + registration.registerDate + ':period:' + registration.shiftPeriod + ':incr').then(function (seq) {
                return redis.getAsync('h:' + doctor.hospitalId + ':p:' + registration.shiftPeriod).then(function (sp) {
                    registration.sequence = sp + seq;
                    return hospitalDAO.updateRegistration(registration);
                });
            });
        }).then(function (result) {
            return hospitalDAO.updateShiftPlan(registration.doctorId, registration.registerDate, registration.shiftPeriod);
        }).then(function (result) {
            return hospitalDAO.findPatientByBasicInfoId(req.user.id);
        }).then(function () {
            return hospitalDAO.findShiftPeriodById(registration.hospitalId, registration.shiftPeriod);
        }).then(function (result) {
            // deviceDAO.findTokenByUid(req.user.id).then(function (tokens) {
            //     if (tokens.length && tokens[0]) {
            //         var notificationBody = util.format(config.changeRegistrationTemplate, registration.patientName + (registration.gender == 0 ? '先生' : '女士'),
            //             registration.hospitalName + registration.departmentName + registration.doctorName, registration.registerDate + ' ' + result[0].name);
            //         pusher.push({
            //             body: notificationBody,
            //             title: '改约成功',
            //             audience: {registration_id: [tokens[0].token]},
            //             patientName: registration.patientName,
            //             patientMobile: registration.patientMobile,
            //             uid: req.user.id,
            //             type: 0,
            //             hospitalId: registration.hospitalId
            //         }, function (err, result) {
            //             if (err) throw err;
            //         });
            //     }
            // });
            return res.send({
                ret: 0,
                data: {
                    registerDate: registration.registerDate,
                    hospitalName: registration.hospitalName,
                    departmentName: registration.departmentName,
                    doctorName: registration.doctorName, jobTtile: registration.doctorJobTtile,
                    shiftPeriod: result[0].name
                }
            });
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getMyPreRegistrations: function (req, res, next) {
        hospitalDAO.findRegistrations(req.user.id, {
            from: +req.query.from,
            size: +req.query.size
        }, req.query.status).then(function (registrations) {
            res.send({ret: 0, data: registrations});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    },

    getPreRegistrations: function (req, res, next) {
        hospitalDAO.findRegistrations(req.params.id, {
            from: +req.query.from,
            size: +req.query.size
        }, req.query.status).then(function (registrations) {
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
        var result = {uid: uid, doctorId: doctorId, favorited: true};
        redis.zrankAsync(queue, doctorId).then(function (index) {
            if (index == null) return redis.zadd(queue, new Date().getTime(), doctorId);
            result.favorited = false;
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
        var result = {uid: uid, hospitalId: hospitalId, favorited: true};
        redis.zrankAsync(queue, hospitalId).then(function (index) {
            if (index == null) {
                redis.zadd(favoriteQueue, new Date().getTime(), uid);
                return redis.zadd(queue, new Date().getTime(), hospitalId);
            }
            result.favorited = false;
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
            hospitals && hospitals.forEach(function (result) {
                result.favorited = true;
                result.images = result.images ? result.images.split(',') : [];
            });
            res.send({ret: 0, data: hospitals});
        }).catch(function (err) {
            res.send({ret: 1, message: err.message});
        });
        return next();
    }
}
