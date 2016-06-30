<?php
require('GD.php');

$str = null;

for($i=0; $i<$argc; $i++){
	$arg = $argv[$i];
	if(substr($arg, 0, 6) === '--str='){
		$str = substr($arg, 6);
	}
}

$a = GD::getTTFPNG($str);
echo base64_encode($a);