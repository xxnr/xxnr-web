const FILE_PATH = __filename;

// 签名证书路径
const SIGN_CERT_PATH_TEST = FILE_PATH + '/../../resources/certificate/unionpay/test/700000000000001_acp.pfx';
const SIGN_CERT_PWD_TEST = '000000';

module.exports = Object.freeze({
	test:Object.freeze({
		// cvn2加密 1：加密 0:不加密
		 SDK_CVN2_ENC : 0,
		// 有效期加密 1:加密 0:不加密
		 SDK_DATE_ENC : 0,
		// 卡号加密 1：加密 0:不加密
		 SDK_PAN_ENC : 0,
		 
		// ######(以下配置为PM环境：入网测试环境用，生产环境配置见文档说明)#######
		SDK_SIGN_CERT_PRIVATE_KEY: require("../common/signature").getPrivateKey(SIGN_CERT_PATH_TEST, SIGN_CERT_PWD_TEST),

		SDK_SIGN_CERT_ID: require("../common/signature").getCertId(SIGN_CERT_PATH_TEST, SIGN_CERT_PWD_TEST),

		// 密码加密证书（这条用不到的请随便配）
		 SDK_ENCRYPT_CERT_PATH : FILE_PATH + '/../../resources/certificate/unionpay/test/verify_sign_acp.cer',

		// 验签证书路径（请配到文件夹，不要配到具体文件）
		 SDK_VERIFY_CERT_DIR : FILE_PATH + '/../../resources/certificate/unionpay/test/',

		// 前台请求地址
		 SDK_FRONT_TRANS_URL : 'https://101.231.204.80:5000/gateway/api/frontTransReq.do',

		// 后台请求地址
		 SDK_BACK_TRANS_URL : 'https://101.231.204.80:5000/gateway/api/backTransReq.do',

		// 批量交易
		 SDK_BATCH_TRANS_URL : 'https://101.231.204.80:5000/gateway/api/batchTrans.do',

		//单笔查询请求地址
		 SDK_SINGLE_QUERY_URL : 'https://101.231.204.80:5000/gateway/api/queryTrans.do',

		//文件传输请求地址
		 SDK_FILE_QUERY_URL : 'https://101.231.204.80:9080/',

		//有卡交易地址
		 SDK_Card_Request_Url : 'https://101.231.204.80:5000/gateway/api/cardTransReq.do',

		//App交易地址
		 SDK_App_Request_Url : 'https://101.231.204.80:5000/gateway/api/appTransReq.do',


		// 前台通知地址 (商户自行配置通知地址)
		 SDK_FRONT_NOTIFY_URL : 'http://localhost:8085/upacp_sdk_php/demo/utf8/FrontReceive.php',
		// 后台通知地址 (商户自行配置通知地址)
		 SDK_BACK_NOTIFY_URL : 'http://114.82.43.123/upacp_sdk_php/demo/utf8/BackReceive.php',
	}),
	prod$:Object.freeze({}),
	notification:Object.freeze({
		host: null,
		port:80,
		front:"/my_xxnr.html",
		back:"/unionpay/nofity"
	})
});
