<?php

function getPrivateKey($cert_path, $cert_pwd) {
	$pkcs12 = file_get_contents ( $cert_path );
	openssl_pkcs12_read ( $pkcs12, $certs, $cert_pwd );
	return $certs ['pkey'];
}

//TODO: input verification
$result = getPrivateKey($argv[1], $argv[2]);
echo $result;

?>