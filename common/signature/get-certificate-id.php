<?php

function getCertId($cert_path, $cert_pwd) {
	$pkcs12certdata = file_get_contents ( $cert_path );

	openssl_pkcs12_read ( $pkcs12certdata, $certs, $cert_pwd );
	$x509data = $certs ['cert'];
	openssl_x509_read ( $x509data );
	$certdata = openssl_x509_parse ( $x509data );
	$cert_id = $certdata ['serialNumber'];
	return $cert_id;
}

//TODO: input verification
$result = getCertId($argv[1], $argv[2]);
echo $result;

?>