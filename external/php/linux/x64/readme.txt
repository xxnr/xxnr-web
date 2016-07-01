#库
yum install libcurl*
yum install curl.x86_64
yum install libxml2-devel.x86_64
yum install libpng*
yum install autoconf*
yum install libjpeg*
yum install libmcrypt*
yum install openssl openssl-devel
ln -s /usr/lib64/libssl.so /usr/lib/

#安装freetype
./configure --prefix=/usr/local/freetype && make && make install
ln -sf /usr/local/freetype/include/freetype2 /usr/local/freetype/include/freetype2/freetype

#安装ImageMagick
./configure --prefix=/usr/local/ImageMagick && make && make install

#安装php
./configure --prefix=/usr/local/php --sbindir=/sbin/  --enable-fastcgi --enable-force-cgi-redirect --with-libxml-dir=/usr/local/ --with-openssl --with-zlib --enable-calendar --with-curl --with-curlwrappers --enable-dba=shared --with-gd --with-jpeg-dir --enable-mbstring   --with-ncurses --enable-pcntl  --enable-soap --enable-sockets --with-xmlrpc --enable-bcmath --with-freetype-dir=/usr/local/freetype && make && make install
/usr/local/setup/php-5.4.43/build/shtool install -c ext/phar/phar.phar /usr/local/php/bin
ln -s -f /usr/local/php/bin/phar.phar /usr/local/php/bin/phar
ln -s /usr/local/php/bin/php /usr/bin/php

#动态编译imagick模块
/usr/local/php/bin/phpize
./configure --with-php-config=/usr/local/php/bin/php-config --with-imagick=/usr/local/ImageMagick && make && make install

继续安装扩展：bcmath gd mcrypt mbstring curl openssl
cd /usr/share/php/php-5.4.43/ext
安装详细：
1.
cd mcrypt
/usr/local/php/bin/phpize
./configure --with-php-config=/usr/local/php/bin/php-config --with-mcrypt=/usr/share/php/php-5.4.43/ext/mcrypt/ && make && make install
2.
cd bcmath
/usr/local/php/bin/phpize
./configure --with-php-config=/usr/local/php/bin/php-config --enable-bcmath && make && make install
3.
cd gd
/usr/local/php/bin/phpize
./configure --with-php-config=/usr/local/php/bin/php-config  --with-freetype-dir=/usr/local/freetype/  && make && make install
4.
cd mbstring
/usr/local/php/bin/phpize
./configure --with-php-config=/usr/local/php/bin/php-config --enable-mbstring  && make && make install
5.
cd curl
/usr/local/php/bin/phpize
./configure --with-php-config=/usr/local/php/bin/php-config   && make && make install
6.
cd openssl
cp config0.m4 config.m4
/usr/local/php/bin/phpize
./configure --with-php-config=/usr/local/php/bin/php-config   && make && make install

###########################################################
#配置php.ini，请参照php.ini
#注意：php.ini中的extension_dir和error_log 必须配置为正确的位置，error_log所在文件夹需要实现建立（/usr/www/logs/）
vim /usr/local/php/lib/php.ini
extension_dir = "/usr/local/php/lib/php/extensions/no-debug-non-zts-20100525/"
[memcache]
extension=memcache.so
extension=gd.so
extension=openssl.so
extension=curl.so
extension=bcmath.so
extension=ncurses.so
extension=jike_heatmap.so
extension=imagick.so
extension=mcrypt.so
extension=dba.so
[eaccelerator]
extension=eaccelerator.so
#复制.so文件到扩展目录
复制dba.so，eaccelerator.so，imagick.so，memcache.so文件到
/usr/local/php/lib/php/extensions/no-debug-non-zts-20100525/下
cp ./usr/lib/php5/20090626/mcrypt.so /usr/local/php/lib/php/extensions/no-debug-non-zts-20100525/