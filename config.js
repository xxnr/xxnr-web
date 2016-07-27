var config = {
    isDebug: false,
    name: "E-shop",
    version: "2.1.0",
    author: "xxnr",
    'etag-version': '',
    serviceStartTime: '2015-11-17',
    currentTimeZoneDiff: 8,
    environment: 'production',
    secure: true,

//ArelativeURLaddressintotheeshopmanagement
    "manager-url": "/manager",
    "manager_url": "/manager",

//Hiddensuperadminintheformusername:"password,",
//manager-superadmin:"admin:admin,",
    "manager-superadmin": "xxnr:xxnr001",

//Imageconvertorforresizingofpictures
//Defaultimageconverter:"im=ImageMagick,gm=GraphicsMagick",
    "default-image-converter": "gm",

//sessioncookiename
    backendtokencookie: "be_token",
    tokencookie: "token",
    usercookie: "__user",
    domain: ".xinxinnongren.com",
    //mobileDomain: "m.xinxinnongren.com",
    //mobileDevDomain: "localhost",
    usercookie_expires_in: "30 days",
    shopingCartcookie: "__scart",

//usersign
    user_sign_point_add: "2",
    user_info_full_filled_point_add: "100",

//usertokenoptions
    user_token_algorithm: "RS256",
    user_token_expires_in: "30 days",
    user_token_issuer: "www.xinxinnongren.com",
    token_cookie_expires_in: "30 days",

//vcodevalidtime10mins
    vcode_resend_valid: 600000,

//vcodenextsendtime
    vcode_resend_interval: 60000,

    netease_im: {
        appkey: 'c68095efa5ed6d3135b5acf5a2552328',
        appsecret: '6c3cfe19aff5',
        url: 'https://api.netease.im/sms/sendtemplate.action'
    },

//sendphonemessageoptions
    phone_message_options: {
        "userid": "617",
        "account": "xinxinnongren",
        "password": "xxnr201505",
        "url": "/sms.aspx?",
        "http_request_options": {"host": "123.57.51.191", "port": 8888, "method": "POST"}
    },

//drilist
    dri_config: {"dri_list": ["18612649699", "15110102070"]},

//usertypes
//usertypeidmustbeincreasingprogressively
    user_types: {"1": "普通用户", "5": "县级经销商", "6": "新农经纪人"},
    default_user_type: 1,
    XXNRAgentId: '6',
    RSCId: '5',

//userminpayprice
    minPayPrice: 3000,

    'allow-gzip': true,

    // file upload limit
    file_size_limit: 20 * 1024 * 1024, // 20MB
    file_count_limit: 10,

    // directory-path
    directory_temp: '/tmp/',
    directory_public: '/public/',
    //directory_xxnr_public: '/public/xxnr/',
    directory_xxnr_public: '/public/xxnrpro/',
    directory_xxnr_mobile_public: '/public/xxnrMobilePro/',

    default_request_timeout: 5000,
    default_maximum_file_descriptors: 0,
    //
    currency_entity: "￥",

    //Android IOS app版本号
    nowIosVersion: '2.2.1',
    nowAndroidVersion: '2.3.1'

};

module.exports = config;
