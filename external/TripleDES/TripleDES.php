<?php

class TripleDES {
   private $_key;
   private $_iv;

   public function __construct($key, $iv=null){
       if(!$key){
           throw 'key required';
       }

        $key .= substr($key,0,16);//截取key的前16位
       echo "\n";
echo $key;
       echo "\n";
       $this->_key = hex2bin($key);
       echo($this->_key);
       $this->_iv = $iv ? hex2bin($key) : '00000000';
   }

   //加密
   public function encrypt($input) {
       $input = $this->addPKCS7Padding($input);
       $td = mcrypt_module_open(MCRYPT_3DES, '', MCRYPT_MODE_ECB, '');
       mcrypt_generic_init($td, $this->_key, $this->_iv);
       $data = mcrypt_generic($td, $input);
       mcrypt_generic_deinit($td);
       mcrypt_module_close($td);
       echo bin2hex(($data));
       echo "\n";
       $data = $this->removeBR(base64_encode($data));
       return $data;
   }

   //解密
   public function decrypt($encrypted) {
       $td = mcrypt_module_open(MCRYPT_3DES, '', MCRYPT_MODE_ECB, '');
       $iv = mcrypt_create_iv(mcrypt_enc_get_iv_size($td), MCRYPT_RAND);
       mcrypt_generic_init($td, $this->_key, $iv);
       $decrypted = mdecrypt_generic($td, $encrypted);
       mcrypt_generic_deinit($td);
       mcrypt_module_close($td);
       $decrypted = $this->stripPKSC5Padding($decrypted);
       echo utf8_encode($decrypted);
       return $decrypted;
   }

    // 去除加密前的填充
    public function stripPKSC5Padding($source) {
        $char = substr($source, -1, 1);
        $num = ord($char);
        if ($num > 8) {
            return $source;
        }
        $len = strlen($source);
        for ($i = $len - 1; $i >= $len - $num; $i--) {
            if (ord(substr($source, $i, 1)) != $num) {
                return $source;
            }
        }
        $source = substr($source, 0, -$num);
        return $source;
    }
    //删除回车和换行
    public function removeBR($str) {
        $len = strlen($str);
        $newstr = "";
        $str = str_split($str);
        for ($i = 0; $i < $len; $i++) {
            if ($str[$i] != '\n' and $str[$i] != '\r') {
                $newstr .= $str[$i];
            }
        }

        return $newstr;
    }
    //填充至8的倍数
    private function addPKCS7Padding($source) {
        $block = mcrypt_get_block_size('tripledes', 'cbc');
        $pad = $block - (strlen($source) % $block);
        if ($pad <= $block) {
            $char = chr($pad);
            $source .= str_repeat($char, $pad);
        }
        return $source;
    }
}

?>