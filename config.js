'use strict';

module.exports = {
    server: {
        name: 'angel guider mobile app restful api',
        version: '0.0.1',
        host: '10.161.165.33',
        port: 8888
    },
    db: {
        host: '10.161.161.229',
        port: '3306',
        user: 'root',
        password: 'heqiao75518?',
        debug: false,
        multipleStatements: true,
        dateStrings: true,
        database: 'medicalDB',
        charset: 'UTF8MB4_GENERAL_CI'
    },
    app: {
        locale: 'zh_CN',
        tokenSecret: '1~a',
        tokenExpire: 86400,
        dateStrings: 'true',
        defaultHeadPic: 'http://7xrtp2.com2.z0.glb.qiniucdn.com/headPic.png',
        defaultHospitalIcon: 'http://7xrtp2.com2.z0.glb.qiniucdn.com/Default%20hospital.png',
        defaultSysBackground: 'http://7xrtp2.com2.z0.glb.qiniucdn.com/background.jpg',
        withdrawURI: 'http://127.0.0.1:8094/accounts/withdraw',
        userAgreementUrl: 'http://7xrtp2.com2.z0.glb.qiniucdn.com/hisbusiness/user_protocol.html'
    },
    redis: {
        host: '10.161.161.229',
        port: 6379
    },
    sms: {
        providerUrl: 'https://sms.yunpian.com/v1/sms/send.json',
        template: '【天使导医】您的短信验证码是:code,在30分钟内输入有效。',
        registrationNotificationTemplate: '【天使导医】您已成功预约%s，就诊时间%s。%s祝您早日康复！地址：%s',
        expireTime: 1800000,
        apikey: '410ac09436843c0270f513a0d84802cc'
    },
    jpush: {
        appKey: "8daa305a57a2fe95621a3c7c",
        masterSecret: "4c493872004cd346184165b2"
    },
    gender: ['男', '女'],
    versionInfo: {
        versionCode: '30100',
        versionName: 'Build 1.1.0',
        content: '1.开放注册；\n2.拥有推荐码，可以分享出去并获知相关的活动；\n 3.其他界面转换的优化。',
        force: 0,
        downloadUrl: 'http://ocnhovbu9.bkt.clouddn.com/app-release_Build%20110_jiagu_sign.apk'
    },
    guider: {
        defaultPassword: '111111'
    },
    registrationNotificationTemplate: '您已为【%s】成功代约【%s医生】门诊，就诊时间%s。请提前半小时到院核对信息、候诊，我们将全程为您提供诚挚服务。',
    angelGuiderStatus: ['正常', '禁用'],
    feeType: ['接洽费', '药费', '诊疗费'],
    feedbackTypes: ["佣金异常", "医生不符", "号源不足", "医术不佳", "服务态度差", "环境差", "收费异常", "其它"],
    invitationTemplate: {
        title: "爱牙日社会公益行-美牙盛惠，绽放臻美",
        content: "我正在使用天使导医，看病优惠活动多，快来试试吧！",
        shareUrl: "http://angelguiderops.hisforce.cn/static/html/angelGuideRegister.html?code=",
        url: "http://angelguiderops.hisforce.cn/static/html/angelGuideShare.html?code=",
        icon: "http://ocnhovbu9.bkt.clouddn.com/invitation_aiyari.png"
    }
};

