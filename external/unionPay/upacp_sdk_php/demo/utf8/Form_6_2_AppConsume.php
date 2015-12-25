<?php

// include_once $_SERVER ['DOCUMENT_ROOT'] . '/upacp_sdk_php/utf8/func/common.php';
// include_once $_SERVER ['DOCUMENT_ROOT'] . '/upacp_sdk_php/utf8/func/SDKConfig.php';
// include_once $_SERVER ['DOCUMENT_ROOT'] . '/upacp_sdk_php/utf8/func/secureUtil.php';
// include_once $_SERVER ['DOCUMENT_ROOT'] . '/upacp_sdk_php/utf8/func/httpClient.php';
// include_once $_SERVER ['DOCUMENT_ROOT'] . '/upacp_sdk_php/utf8/func/log.class.php';
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../../utf8/func/common.php';
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../../utf8/func/config.php';
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../../utf8/func/secureUtil.php';
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../../utf8/func/httpClient.php';
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../../utf8/func/log.class.php';

echo "{ \"comment\":\""; // make all output commented out in returned JSON

/**
 * 消费交易-控件后台订单推送 
 */


/**
 *	以下代码只是为了方便商户测试而提供的样例代码，商户可以根据自己需要，按照技术文档编写。该代码仅供参考
 */
// 初始化日志
$log = new PhpLog ( $SDK_LOG_FILE_PATH, "PRC", SDK_LOG_LEVEL );
$log->LogInfo ( "============处理前台请求开始===============" );
// 初始化日志

$orderId = null;
$txnAmt = null;
$paymentId = null;

for($i=0; $i<$argc; $i++){
	$arg = $argv[$i];
	
	if(substr($arg, 0, 13) === '--payment-id='){
		$paymentId = substr($arg, 13);
	}
	
	if(substr($arg, 0, 14) === '--total-price='){
		$txnAmt = substr($arg, 14);
	}
	
	if(substr($arg, 0, 11) === '--order-id='){
		$orderId = substr($arg, 11);
	}
}

$params = array(
		'version' => '5.0.0',				//版本号
		'encoding' => 'utf-8',				//编码方式
		'certId' => getSignCertId (),			//证书ID
		'txnType' => '01',				//交易类型	
		'txnSubType' => '01',				//交易子类
		'bizType' => '000201',				//业务类型
		'frontUrl' =>  $SDK_FRONT_NOTIFY_URL,  		//前台通知地址
		'backUrl' => $SDK_BACK_NOTIFY_URL,		//后台通知地址	
		'signMethod' => '01',		//签名方法
		'channelType' => '08',		//渠道类型，07-PC，08-手机
		'accessType' => '0',		//接入类型
		'merId' => $MERID,		        //商户代码，请改自己的测试商户号
		'orderId' => $paymentId,	//商户订单号
		'txnTime' => date('YmdHis'),	//订单发送时间
		'txnAmt' => $txnAmt,		//交易金额，单位分
		'currencyCode' => '156',	//交易币种
		'orderDesc' => '订单描述',  //订单描述，可不上送，上送时控件中会显示该信息
		'reqReserved' =>base64_encode(json_encode( array('paymentId'=>$paymentId, 'txnAmt'=>$txnAmt, 'orderId'=>$orderId))), //请求方保留域，透传字段，查询、通知、对账文件中均会原样出现
		);


// 签名
sign ( $params );

echo "请求：" . getRequestParamString ( $params );
$log->LogInfo ( "后台请求地址为>" . $SDK_App_Request_Url );
// 发送信息到后台
$result = sendHttpRequest ( $params, $SDK_App_Request_Url );
$log->LogInfo ( "后台返回结果为>" . $result );

echo "应答：" . $result;

//返回结果展示
$result_arr = coverStringToArray ( $result );
$verify_result = verify ( $result_arr );
echo $verify_result ? '验签成功' : '验签失败';
echo " \", ";
echo ($verify_result ? "\"response\":\"".$result."\"" : "\"error\":\"result verfication failure!\"");
echo "}";
?>

