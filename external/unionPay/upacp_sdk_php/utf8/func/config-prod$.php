<?php


$CERTIFICATE_DIR_PRODUCTION = __DIR__ . '/../../../../../resources/certificate/unionpay/prod$/';
const UNION_PAY_HOST_PRODUCTION = 'https://gateway.95516.com';
const UNION_PAY_FILE_QUERY_URL_PRODUCTION = 'https://filedownload.95516.com/';
const MERID_PRODUCTION = '898410107630057';

$SIGN_CERTIFICATE_PWD_PRODUCTION = array_search('--test', $argv) ? null : substr(file_get_contents(__DIR__ . '/../../../prod$_certificate_pwd.txt'), 0, 6);



function fillProductionConfig(&$certificateDir, &$signCertificatePwd, &$unionPayHost, &$unionPayFileQueryUrl, &$merId, &$certPath, &$certType){
	global $CERTIFICATE_DIR_PRODUCTION, $SIGN_CERTIFICATE_PWD_PRODUCTION;
	$certificateDir = $CERTIFICATE_DIR_PRODUCTION;
	$signCertificatePwd = $SIGN_CERTIFICATE_PWD_PRODUCTION;
	$unionPayHost = UNION_PAY_HOST_PRODUCTION;
	$unionPayFileQueryUrl = UNION_PAY_FILE_QUERY_URL_PRODUCTION;
	$merId = MERID_PRODUCTION;
	$certPath = $CERTIFICATE_DIR_PRODUCTION . 'sign_certificate.pfx';
	$certType = 'private-key';
}

	
?>
