<?php

$CERTIFICATE_DIR_TEST = __DIR__ . '/../../../../../resources/certificate/unionpay/test/';
const SIGN_CERTIFICATE_PWD_TEST = '000000';
const UNION_PAY_HOST_TEST = 'https://101.231.204.80:5000';
const UNION_PAY_FILE_QUERY_URL_TEST = 'https://101.231.204.80:9080/';
const MERID_TEST = '777290058119622';


function fillTestConfig(&$certificateDir, &$signCertificatePwd, &$unionPayHost, &$unionPayFileQueryUrl, &$merId, &$certPath, &$certType){
	global $CERTIFICATE_DIR_TEST;
	$certificateDir = $CERTIFICATE_DIR_TEST;
	$signCertificatePwd = SIGN_CERTIFICATE_PWD_TEST;
	$unionPayHost = UNION_PAY_HOST_TEST;
	$unionPayFileQueryUrl = UNION_PAY_FILE_QUERY_URL_TEST;
	$merId = MERID_TEST;
}


	
?>