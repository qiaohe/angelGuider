var authController = require('./controller/authController');
var thirdPartyController = require('./controller/thirdPartyController');
var hospitalController = require('./controller/hospitalController');
var angelGuiderController = require('./controller/angelGuiderController');
var deviceController = require('./controller/deviceController');
var wechatController = require('./controller/wechatController');
module.exports = [
    {
        method: "post",
        path: "/api/login",
        handler: authController.login
    },
    {
        method: "post",
        path: "/api/register",
        handler: authController.register
    },
    {
        method: "get",
        path: "/api/invitation",
        handler: authController.getInvitation,
        secured: 'user'
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
        path: "/api/doctors/search",
        handler: hospitalController.searchDoctor,
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
        method: "put",
        path: "/api/preRegistration",
        handler: hospitalController.changeAgentPreRegistration,
        secured: "user"
    },

    {
        method: "get",
        path: "/api/my/agentPreRegistrations",
        handler: hospitalController.getMyPreRegistrations,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/angelGuiders/:id/agentPreRegistrations",
        handler: hospitalController.getPreRegistrations,
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
        path: "/api/versionInfo",
        handler: thirdPartyController.getVersionInfo
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
    },
    {
        method: "post",
        path: "/api/withdrawApplication",
        handler: angelGuiderController.postWithdrawApplication,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/banks/:binCode",
        handler: angelGuiderController.getBankByBinCode,
        secured: 'user'
    },
    {
        method: "del",
        path: "/api/accounts/unbinding",
        handler: angelGuiderController.unbindAccount,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/userAgreement",
        handler: thirdPartyController.getUserAgreement
    },
    {
        method: "post",
        path: "/api/registrations/:rid/feedback",
        handler: angelGuiderController.postFeedback,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/registrations/:rid/feedback",
        handler: angelGuiderController.getFeedback,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/feedbackTypes",
        handler: angelGuiderController.getFeedbackTypes,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/activities",
        handler: angelGuiderController.getActivities,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/wechat",
        handler: authController.checkSignature
    },
    {
        method: "post",
        path: "/api/wechat",
        handler: authController.wechatCallback
    },
    {
        method: "post",
        path: "/api/menus",
        handler: authController.createMenu
    },
    {
        method: "get",
        path: "/api/signature",
        handler: authController.getSignature
    },
    {
        method: "get",
        path: "/api/wechat/registration",
        handler: wechatController.register
    },
    {
        method: "post",
        path: "/api/wechat/binding",
        handler: wechatController.bindMobile
    }
    
];
