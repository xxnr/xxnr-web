<?php

include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../../utf8/func/common.php';
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../../utf8/func/config.php';
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../../utf8/func/secureUtil.php';
include_once dirname(__FILE__) . DIRECTORY_SEPARATOR . '../../utf8/func/log.class.php';
			
$log = new PhpLog ( $SDK_LOG_FILE_PATH, "PRC", SDK_LOG_LEVEL );

$data = null;
$json = null;

for($i=0; $i<$argc; $i++){
	$arg = $argv[$i];
	
	if(substr($arg, 0, 7) === '--data='){
		$data = substr($arg, 7);
	}
	
	if(substr($arg, 0, 7) === '--json='){
		$json = substr($arg, 7);
	}
}

$data = $data ? base64_decode($data) : $data;
$json = $json ? base64_decode($json) : $json;

$log->LogInfo ( "verifying notification - data = " . $data . ", and json = " . $json);

if( $data && (verify( coverStringToArray( urldecode($data) ) ) || verify( coverStringToArray( $data ) ) ) ){
	echo "success: data verification is successful!";
}
else if( $json && verify( json_decode($json, true) ) ){
	echo "success: json verification is successful!";
}
else{
	$log->LogInfo ( "verification failure - data = " . $data . ", and json = " . $json);
	echo "failure";
}

?>
			