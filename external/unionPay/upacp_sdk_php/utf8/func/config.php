<?php

include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'config-test.php';
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . 'config-prod$.php';

// cvn2加密 1：加密 0:不加密
const SDK_CVN2_ENC = 0;
// 有效期加密 1:加密 0:不加密
const SDK_DATE_ENC = 0;
// 卡号加密 1：加密 0:不加密
const SDK_PAN_ENC = 0;

$CERTIFICATE_DIR = null;
$SIGN_CERTIFICATE_PWD = null;
$UNION_PAY_HOST = null;
$UNION_PAY_FILE_QUERY_URL = null;
$FRONT_NOTIFY_URL = null;
$BACK_NOTIFY_URL = null;
$REFUND_BACK_NOTIFY_URL = null;
$MERID = null;
$CERTIFICATE_TYPE = null;

$forTest = false;

for($i=0; $i<$argc; $i++){
	$arg = $argv[$i];
	
	if($arg === '--test'){
		$forTest = true;
	}
	
	if(substr($arg, 0, 19) === '--front-notify-url='){
		$FRONT_NOTIFY_URL = substr($arg, 19);
	}
	
	if(substr($arg, 0, 18) === '--back-notify-url='){
		$BACK_NOTIFY_URL = substr($arg, 18);
	}

	if(substr($arg, 0, 25) === '--refund-back-notify-url='){
		$REFUND_BACK_NOTIFY_URL = substr($arg, 25);
	}
}

$SDK_SIGN_CERT_PATH = null;
 
if($forTest){
	fillTestConfig($CERTIFICATE_DIR,
$SIGN_CERTIFICATE_PWD,
$UNION_PAY_HOST,
$UNION_PAY_FILE_QUERY_URL,
$MERID, $SDK_SIGN_CERT_PATH, $CERTIFICATE_TYPE);
}
else{
	fillProductionConfig($CERTIFICATE_DIR,
$SIGN_CERTIFICATE_PWD,
$UNION_PAY_HOST,
$UNION_PAY_FILE_QUERY_URL,
$MERID, $SDK_SIGN_CERT_PATH, $CERTIFICATE_TYPE);
}
 
// ######(以下配置为PM环境：入网测试环境用，生产环境配置见文档说明)#######
// 签名证书路径
$SDK_SIGN_CERT_PATH = (($SDK_SIGN_CERT_PATH === null) ? ( $CERTIFICATE_DIR.'/sign_certificate.pfx' ) : $SDK_SIGN_CERT_PATH );

$SDK_SIGN_CERT_PWD = $SIGN_CERTIFICATE_PWD;

// 签名证书密码
// const SDK_SIGN_CERT_PWD = '000000';

// 密码加密证书（这条用不到的请随便配）
$SDK_ENCRYPT_CERT_PATH = $CERTIFICATE_DIR.'/verify_sign_acp.cer';

// 验签证书路径（请配到文件夹，不要配到具体文件）
$SDK_VERIFY_CERT_DIR = $CERTIFICATE_DIR;

// 前台请求地址
$SDK_FRONT_TRANS_URL = $UNION_PAY_HOST.'/gateway/api/frontTransReq.do';

// 后台请求地址
$SDK_BACK_TRANS_URL = $UNION_PAY_HOST.'/gateway/api/backTransReq.do';

// 批量交易
$SDK_BATCH_TRANS_URL = $UNION_PAY_HOST.'/gateway/api/batchTrans.do';

//单笔查询请求地址
$SDK_SINGLE_QUERY_URL = $UNION_PAY_HOST.'/gateway/api/queryTrans.do';

//文件传输请求地址
$SDK_FILE_QUERY_URL = $UNION_PAY_FILE_QUERY_URL; // 'https://101.231.204.80:9080/';

//有卡交易地址
$SDK_Card_Request_Url = $UNION_PAY_HOST.'/gateway/api/cardTransReq.do';

//App交易地址
$SDK_App_Request_Url = $UNION_PAY_HOST.'/gateway/api/appTransReq.do';


// 前台通知地址 (商户自行配置通知地址)
$SDK_FRONT_NOTIFY_URL = $FRONT_NOTIFY_URL;// 'http://localhost:8085/upacp_sdk_php/demo/utf8/FrontReceive.php';
// 后台通知地址 (商户自行配置通知地址)
$SDK_BACK_NOTIFY_URL = $BACK_NOTIFY_URL;//'http://114.82.43.123/upacp_sdk_php/demo/utf8/BackReceive.php';
// 退款的后台通知地址 (商户自行配置通知地址)
$SDK_REFUND_BACK_NOTIFY_URL = $REFUND_BACK_NOTIFY_URL;

//文件下载目录 
$SDK_FILE_DOWN_PATH = __DIR__ . DIRECTORY_SEPARATOR . '../../../../download/unionPay';

//日志 目录 
$SDK_LOG_FILE_PATH = __DIR__ . DIRECTORY_SEPARATOR . '../../../../logs/unionPay';

//日志级别
const SDK_LOG_LEVEL = 'INFO';


	
?>