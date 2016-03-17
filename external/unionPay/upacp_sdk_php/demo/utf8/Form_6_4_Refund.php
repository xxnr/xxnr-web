<?php
// header ( 'Content-type:text/html;charset=utf-8' );
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
 *	退货
 */


/**
 *	以下代码只是为了方便商户测试而提供的样例代码，商户可以根据自己需要，按照技术文档编写。该代码仅供参考
 */

// 初始化日志
$log = new PhpLog ( $SDK_LOG_FILE_PATH, "PRC", SDK_LOG_LEVEL );
$log->LogInfo ( "===========处理后台请求开始============" );

$orderId = null;
$txnAmt = null;
$paymentId = null;
$queryId = null;
$channelType = '07'; //渠道类型，07-PC，08-手机

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

	if(substr($arg, 0, 11) === '--query-id='){
		$queryId = substr($arg, 11);
	}
}

$params = array(
		'version' => '5.0.0',		//版本号
		'encoding' => 'utf-8',		//编码方式
		'certId' => getSignCertId (),	//证书ID	
		'signMethod' => '01',		//签名方法
		'txnType' => '04',		//交易类型	
		'txnSubType' => '00',		//交易子类
		'bizType' => '000201',		//业务类型
		'accessType' => '0',		//接入类型
		'channelType' => $channelType,		//渠道类型
		'orderId' => $paymentId,	//商户订单号，重新产生，不同于原消费
		'merId' => $MERID,	//商户代码，请修改为自己的商户号
		'origQryId' => $queryId,    //原消费的queryId，可以从查询接口或者通知接口中获取
		'txnTime' => date('YmdHis'),	//订单发送时间，重新产生，不同于原消费
		'txnAmt' => $txnAmt,              //交易金额，退货总金额需要小于等于原消费
		'backUrl' => $SDK_REFUND_BACK_NOTIFY_URL,	   //退款后台通知地址	
		'reqReserved' =>base64_encode(json_encode( array('paymentId'=>$paymentId, 'txnAmt'=>$txnAmt, 'orderId'=>$orderId, 'queryId'=>$queryId))), //请求方保留域，透传字段，查询、通知、对账文件中均会原样出现
	);


// 签名
sign ( $params );

echo "请求：" . getRequestParamString ( $params );
$log->LogInfo ( "后台请求地址为>" . $SDK_BACK_TRANS_URL );
// 发送信息到后台
$result = sendHttpRequest ( $params, $SDK_BACK_TRANS_URL );
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


