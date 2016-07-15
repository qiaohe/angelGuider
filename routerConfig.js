var authController = require('./controller/authController');
var thirdPartyController = require('./controller/thirdPartyController');
var hospitalController = require('./controller/hospitalController');
var angelGuiderController = require('./controller/angelGuiderController');
var deviceController = require('./controller/deviceController');
module.exports = [
    {
        method: "post",
        path: "/api/login",
        handler: authController.login
    },
    {
        method: "post",
        path: "/api/logout",
        handler: authController.logout,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/hospitals",
        handler: hospitalController.getHospitals,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/hospitals/search",
        handler: hospitalController.searchHospital,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/hospitals/:hospitalId",
        handler: hospitalController.getHospitalById,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/resetPwd",
        handler: authController.resetPwd
    },
    {
        method: "put",
        path: "/api/me",
        handler: authController.updateMyProfile,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/sms/:mobile",
        handler: thirdPartyController.sendSMS
    },
    {
        method: 'get',
        path: '/api/qiniu/token',
        handler: thirdPartyController.getQiniuToken
    },
    {
        method: "get",
        path: "/api/hospitals/:hospitalId/departments",
        handler: hospitalController.getDepartments,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/hospitals/:hospitalId/departments/:departmentId/doctors",
        handler: hospitalController.getDoctorsByDepartment,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/doctors/:doctorId",
        handler: hospitalController.getDoctorById,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/doctors/:doctorId/shiftPlans",
        handler: hospitalController.getShitPlan,
        secured: "user"
    },
    {
        method: "post",
        path: "/api/agentPreRegistrations",
        handler: hospitalController.agentPreRegistration,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/my/agentPreRegistrations",
        handler: hospitalController.getMyPreRegistrations,
        secured: "user"
    },
    {
        method: "post",
        path: "/api/favorites/doctors",
        handler: hospitalController.favoriteDoctor,
        secured: "user"
    },
    {
        method: "post",
        path: "/api/favorites/hospitals",
        handler: hospitalController.favoriteHospital,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/favorites/doctors",
        handler: hospitalController.getFavouritedDoctors,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/favorites/hospitals",
        handler: hospitalController.getFavouritedHospitals,
        secured: "user"
    },
    {
        method: "post",
        path: "/api/angelGuiders",
        handler: angelGuiderController.addAngelGuider,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/angelGuiders",
        handler: angelGuiderController.getAngelGuiders,
        secured: "user"
    },
    {
        method: "put",
        path: "/api/angelGuiders",
        handler: angelGuiderController.updateAngelGuider,
        secured: "user"
    },
    {
        method: "del",
        path: "/api/angelGuiders/:id",
        handler: angelGuiderController.removeAngelGuider,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/angelGuiders/:id",
        handler: angelGuiderController.getAngelGuider,
        secured: "user"
    },
    {
        method: "post",
        path: "/api/devices",
        handler: deviceController.addDevice,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/notifications",
        handler: deviceController.getNotifications,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/accountInfo",
        handler: angelGuiderController.getAccountInfo,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/bills",
        handler: angelGuiderController.getBills,
        secured: 'user'
    }
];