'use strict';

module.exports = {
    server: {
        name: 'angel guider mobile app restful api',
        version: '0.0.1',
        host: 'localhost',
        port: 8888
    },
    db: {
        host: '121.42.171.213',
        port: '3306',
        user: 'root',
        password: 'heqiao75518',
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
        defaultSysBackground: 'http://7xrtp2.com2.z0.glb.qiniucdn.com/background.jpg'
    },
    redis: {
        host: '127.0.0.1',
        port: 6379
    },
    sms: {
        providerUrl: 'https://sms.yunpian.com/v1/sms/send.json',
        template: '【天使导医】您的短信验证码是:code,在30分钟内输入有效。',
        expireTime: 1800000,
        apikey: '410ac09436843c0270f513a0d84802cc'
    },
    qiniu: {
        ak: "0d02DpW7tBPiN3TuZYV7WcxmN1C9aCiNZeW9fp5W",
        sk: "7zD3aC6xpvp_DfDZ0LJhjMq6n6nB6UVDbl37C5FZ",
        prefix: "http://7xrtp2.com2.z0.glb.qiniucdn.com/"
    },
    gender: ['男', '女'],
    versionInfo: {
        versionCode: "20001",
        versionName: "1.0.1",
        content: "优化界面",
        force: 0,
        downloadUrl: "http://7xt9es.com2.z0.glb.qiniucdn.com/apk/runapp/pztApp-yingyongbao-release.apk"
    },
    guider: {
        defaultPassword: '111111'
    },
    angelGuiderStatus: ['禁用', '正常']

};

