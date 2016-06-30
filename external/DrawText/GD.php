<?php
class GD {
    private static $LineColors = array(
        array('red'=>0xE3, 'green'=>0xE9, 'blue'=>0x99),
        array('red'=>0x61, 'green'=>0x80, 'blue'=>0xE5),
        array('red'=>0xD6, 'green'=>0xD6, 'blue'=>0xf6),
    );

    private static $TextColors = array(
        array('red'=>0xE5, 'green'=>0x8A, 'blue'=>0x8D),
        array('red'=>0xF8, 'green'=>0x51, 'blue'=>0x57),
        array('red'=>0x8B, 'green'=>0x8B, 'blue'=>0xF5),
        array('red'=>0xEF, 'green'=>0xB1, 'blue'=>0x3C),
        array('red'=>0x83, 'green'=>0xDE, 'blue'=>0x88),
        array('red'=>0xBC, 'green'=>0xC8, 'blue'=>0x36),
        array('red'=>0x61, 'green'=>0x80, 'blue'=>0xE5),
        array('red'=>0x3C, 'green'=>0xCA, 'blue'=>0xD3),
    );

    private static $TextAngles = ['8', '-8', '10', '-10', '12', '-12', '15', '-15', '18', '-18', '20', '-20', '24', '-24', '30', '-30'];
    private static $TTFFiles = ['tuffy.ttf', 'oxnard.ttf'];
    private static $DefaultBackgroundColor = array('red'=>0xEB, 'green'=>0xF8, 'blue'=>0xFE);
    const DefaultWidth = 214;
    const DefaultHeight = 44;
    const DefaultFontSize = 20;
    const DefaultSnowPointNumber = 800;

    /*
    ** 使用ttf字体(可改变字体大小、字体角度)，生成图片
    */
    protected static function _generatorTTFPNG($str, $w, $h, $font, $num) {
        $width = $w;
        $height = $h;
        $image = imagecreate($width, $height);
        if (empty($image)) {
            return false;
        }

        // 绘制背景
        $bgColor = imagecolorallocate($image, self::$DefaultBackgroundColor['red'], self::$DefaultBackgroundColor['green'], self::$DefaultBackgroundColor['blue']);
        imagefilledrectangle($image, 0, 0, $width - 1, $height - 1, $bgColor);
        imagerectangle($image, 0, 0, $width - 1, $height - 1, $textColor);

        // 绘制文字
        $charArray = str_split($str);
        $ttf = __DIR__.'/'.self::$TTFFiles[rand(0, count(self::$TTFFiles)-1)];
        for($i = 0; $i< count($charArray); $i++){
            $randomTextColor = self::$TextColors[rand(0, count(self::$TextColors)-1)];
            $textColor = imagecolorallocate($image, $randomTextColor['red'], $randomTextColor['green'], $randomTextColor['blue']);
            $textAngle = self::$TextAngles[rand(0, count(self::$TextAngles)-1)];
            $charX = self::_getCharX($charArray, $w, $font, $i);
            $charY = self::_getCharY($h, $font);
            imagettftext($image, $font, $textAngle, $charX, $charY, $textColor, $ttf, $str[$i]);
        }

        // 绘制弧线
        $randomLineColor = self::$LineColors[rand(0, count(self::$LineColors)-1)];
        $lineColor = imagecolorallocate($image, $randomLineColor['red'], $randomLineColor['green'], $randomLineColor['blue']);
        imagearc($image, rand(0, $width), rand(0, $height), rand($width/2, $width) , rand($height/2, $height), rand(0, 360), rand(0, 360), $lineColor);
        imagearc($image, rand(0, $width), rand(0, $height), rand($width/2, $width) , rand($height/2, $height), rand(0, 360), rand(0, 360), $lineColor);

        // 绘制雪花点
        for ($i = 0; $i < $num; $i++) {
            $randColor = imagecolorallocate($image, rand(0, 255), rand(0, 255), rand(0, 255));
            imagesetpixel($image, rand(0, 1000) % $width, rand(0, 1000) % $height, $randColor);
        }

        ob_start();
        imagepng($image);
        $png = ob_get_contents();
        ob_end_clean();
        imagedestroy($image);
        
        return $png;
    }

    /*
    ** 获取TTF字体生成的图片
    */
    public static function getTTFPNG($str, $w=214, $h=44, $font=32, $num=800) {
    	return self::_generatorTTFPNG($str, $w, $h, $font, $num, $ttf);
    }

    private static function _getCharX($charArray, $w, $font, $i){
        $charCount = count($charArray);
        $gapLength = ($w - $charCount * $font) / ($charCount + 3);
        return ($i+2) * $gapLength + $i * $font;
    }

    private static function _getCharY($h, $font){
        //$maxY = $h - $font / 2;
        //$minY = 3 * $font / 2;
        //return rand($minY, $maxY);

        return ($h - $font) / 2 + $font;
    }
}
