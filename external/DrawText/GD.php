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
    private static $TTFFiles = ['tuffy.ttf'];
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
            imagettftext($image, $font, $textAngle, $charX, $charY, $textColor, $ttf, $charArray[$i]);
        }
        
        // 绘制弧线
        $start_end_pair = array(
            array('start'=>rand(0, 45), 'end'=>rand(225, 270)),
            array('start'=>rand(180, 225), 'end'=>rand(315, 360))
        );
        
        $randLineColorIndex = rand(0, count(self::$LineColors)-1);
        for($i = 0; $i < 2; $i++){
            $randomLineColor = self::$LineColors[($randLineColorIndex+$i) % count(self::$LineColors)];
            $lineColor = imagecolorallocate($image, $randomLineColor['red'], $randomLineColor['green'], $randomLineColor['blue']);
            $x0 = rand($width/4, $width*3/4);
            $y0 = rand($height/2, $height*3/4);
            $xr = rand($width*3/4, $width);
            $yr = rand($height/4, $height/2);
            $randStartEnd = $start_end_pair[rand(0, count($start_end_pair) - 1)];
            $start = $randStartEnd['start'];
            $end = $randStartEnd['end'];
            imagearc($image, $x0, $y0, $xr, $yr, $start, $end, $lineColor);
            imagearc($image, $x0+1, $y0+1, $xr, $yr, $start, $end, $lineColor);
        }

        
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
    public static function getTTFPNG($str, $w=214, $h=44, $font=32, $num=0) {
    	return self::_generatorTTFPNG($str, $w, $h, $font, $num, $ttf);
    }

    private static function _getCharX($charArray, $w, $font, $i){
        $charCount = count($charArray);
        $factor = 12;
        $gapLength = ($w - $charCount * $font) / ($charCount + 2 * $factor);
        return ($i + $factor) * $gapLength + $i * $font;
    }

    private static function _getCharY($h, $font){
        //$maxY = $h - $font / 2;
        //$minY = 3 * $font / 2;
        //return rand($minY, $maxY);
        return ($h - $font) * 2 / 5 + $font;
    }
}
