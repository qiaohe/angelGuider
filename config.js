'use strict';

module.exports = {
    server: {
        name: 'angel guider mobile app restful api',
        version: '0.0.1',
        host: 'wechat.hisforce.cn',
        port: 8888
    },
    db: {
        host: '127.0.0.1',
        port: '3306',
        user: 'root',
        password: 'heqiao75518',
        debug: false,
        multipleStatements: true,
        dateStrings: true,
        database: 'medicaldb_wechat',
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
        host: '127.0.0.1',
        port: 6379
    },
    sms: {
        providerUrl: 'https://sms.yunpian.com/v1/sms/send.json',
        template: '【天使导医】您的短信验证码是:code,在30分钟内输入有效。',
        registrationNotificationTemplate: '【天使导医】您已成功预约%s，就诊时间%s。%s祝您早日康复！地址：%s',
        expireTime: 1800000,
        apikey: '410ac09436843c0270f513a0d84802cc'
    },
    wechat: {
        token: 'hisforce_wechat_token',
        appid: 'wx9646217f7a5f0e34',
        expire_seconds_qrCode:604800,
        appsecret: '9ae64fc06050f30faf33077e385f84d0',
        accessTokenUrl: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET',
        createMenu: 'https://api.weixin.qq.com/cgi-bin/menu/create?access_token=ACCESS_TOKEN',
        getUserInfo: 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN',
        createQrCode: 'https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=TOKEN',
        ticketUrl:'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=TOKEN&type=jsapi',
        authorizeUrlTemplate: "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx9646217f7a5f0e34&redirect_uri=REDIRECT_URI&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect",
        accessTokenUrlTemplateByPage: "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx9646217f7a5f0e34&secret=9ae64fc06050f30faf33077e385f84d0&code=CODE&grant_type=authorization_code",
        noncestr: 'xmyD!@001ync',
        getRefreshTokenUrl: "https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=wx9646217f7a5f0e34&grant_type=refresh_token&refresh_token=REFRESH_TOKEN",
        getAccessTokenUrl: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx9646217f7a5f0e34&secret=9ae64fc06050f30faf33077e385f84d0",
        subscribeMessage: "您好，欢迎您关注天使导医服务平台！在提供优质医疗服务的同时，本平台还为您提供了业内绝无仅有的就医补贴，切实降低您的医疗成本。如有任何疑问与求助，请您拨打服务热线400-928-0398！您也可以在本窗口发送消息进行在线咨询！为了确保您能够有效获取到就医补贴，请点此\<a\>绑定手机号\<\/a\>",
        bindMobileMessage: '您好，您还未绑定手机号，为了确保您能够有效安全的就医以及获取到就医补贴，请点此\<a\>绑定手机号\<\/a\>'

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

