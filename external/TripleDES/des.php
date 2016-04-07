<?php
class Des {
		/*
		* 3DES解码
		* @param string $plain_text
		* @param string $key
		* @return string
		*/
	public function decode($plain_text, $key) {
		$key .= substr($key,0,16);//截取key的前16位
		$data = $this->hexString2ByteArr($key);//转码
		$key = '';
		foreach($data as $ch) {
			$key .= chr($ch); //迭代
		}
		echo $key;
		$data = $this->hexString2ByteArr($plain_text);//转码
        $plain_text = '';
     
        foreach($data as $ch) {
            $plain_text .= chr($ch); //迭代
        }
		$cipher = MCRYPT_3DES; //指定加密算法
		$modes = MCRYPT_MODE_ECB; //使用模式
		$iv = mcrypt_create_iv(mcrypt_get_iv_size($cipher, $modes), MCRYPT_RAND); //初始向量(大小，源)
		$data = @mcrypt_decrypt($cipher, $key, $plain_text, $modes, $iv); //使用给定参数解密密文
// 		$block = mcrypt_get_block_size($cipher, $modes); //加密算法的分组大小
		$pad = ord($data[($len = strlen($data)) - 1]); //返回最后一个字符的 ASCII 码值
		$decrypted = substr($data, 0, strlen($data) - $pad); //截取所需
// 		file_put_contents('decrypted.txt',print_r($decrypted,true));
		return $decrypted;
	}
	
	//16进制字符串转换成字节码组
	public function hexString2ByteArr($hexStr) {
		if ($hexStr == null)
			return null;
		if (strlen($hexStr) % 2 != 0) {
			return null;
		}
		$data = array();
		for ($i = 0; $i < strlen($hexStr) / 2; $i++) {
			$hc = $hexStr{2 * $i};
			$lc = $hexStr{2 * $i + 1};
			$hb = $this->hexChar2Byte($hc);
			$lb = $this->hexChar2Byte($lc);
			if ($hb < 0 || $lb < 0) {
				return null;
			}
			$n = $hb << 4;
			$data[$i] = $this->toByte($n + $lb);
		}
		return $data;
	}
	//转换字节码
	public function toByte($num) {
		if($num <128) return $num;
		$num=decbin($num);  //decbin 是php自带的函数，可以把十进制数字转换为二进制

		$num=substr($num,-8); //取后8位
		$sign=substr($num,0,1); //截取 第一位 也就是高位，用来判断到底是负的还是正的
		if($sign==1)  //高位是1 代表是负数 ,则要减去256
		{
			return bindec($num)-256; //bindec 也是php自带的函数，可以把二进制数转为十进制
		}
		else
		{
			return bindec($num);
		}
	} 
	//HEX转换字节码
	public function hexChar2Byte($c) {
		if ($c >= '0' && $c <= '9')
			return ($c - '0');
		if ($c >= 'a' && $c <= 'f')
			return  (ord($c) - ord('a') + 10);
		if ($c >= 'A' && $c <= 'F')
			return  (ord($c) - ord('A') + 10);
		return -1;
	}}
?>