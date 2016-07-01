#库
yum install libcurl*
yum install curl.x86_64
yum install libxml2-devel.x86_64
yum install libpng*
yum install autoconf*
yum install libjpeg*
yum install libmcrypt*

#安装freetype
./configure --prefix=/home/xxnr/local/freetype && make && make install

#安装ImageMagick
./configure --prefix=/home/xxnr/local/ImageMagick && make && make install

#安装php
./configure --prefix=/home/xxnr/local/php --sbindir=/sbin/  --enable-fastcgi --enable-force-cgi-redirect --with-libxml-dir=/usr/local/ --with-openssl --with-zlib --enable-calendar --with-curl --with-curlwrappers --enable-dba=shared --with-gd --with-jpeg-dir --enable-mbstring   --with-ncurses --enable-pcntl  --enable-soap --enable-sockets --with-xmlrpc --enable-bcmath --with-freetype-dir=/home/xxnr/local/freetype && make && make install
ln -s /home/xxnr/local/php/bin/php /usr/bin/php

#动态编译imagick模块
/home/xxnr/local/php/bin/phpize
./configure --with-php-config=/home/xxnr/local/php/bin/php-config --with-imagick=/home/xxnr/local/ImageMagick && make && make install

继续安装扩展：bcmath gd mcrypt mbstring curl openssl
cd /usr/share/php/php-5.4.43/ext
安装详细：
1.
cd mcrypt
/home/xxnr/local/php/bin/phpize
./configure --with-php-config=/home/xxnr/local/php/bin/php-config --with-mcrypt=/usr/share/php/php-5.4.43/ext/mcrypt/ && make && make install
2.
cd bcmath
/home/xxnr/local/php/bin/phpize
./configure --with-php-config=/home/xxnr/local/php/bin/php-config --enable-bcmath && make && make install
3.
cd gd
/home/xxnr/local/php/bin/phpize
./configure --with-php-config=/home/xxnr/local/php/bin/php-config  --with-freetype-dir=/home/xxnr/local/freetype/  && make && make install
4.
cd mbstring
/home/xxnr/local/php/bin/phpize
./configure --with-php-config=/home/xxnr/local/php/bin/php-config --enable-mbstring  && make && make install
5.
cd curl
/home/xxnr/local/php/bin/phpize
./configure --with-php-config=/home/xxnr/local/php/bin/php-config   && make && make install
6.
cd openssl
cp config0.m4 config.m4
/home/xxnr/local/php/bin/phpize
./configure --with-php-config=/home/xxnr/local/php/bin/php-config   && make && make install

###########################################################
#配置php.ini
extension_dir = "/home/xxnr/local/php/lib/php/extensions/no-debug-non-zts-20100525/"
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
/home/xxnr/local/php/lib/php/extensions/no-debug-non-zts-20100525/下
cp ./usr/lib/php5/20090626/mcrypt.so /home/xxnr/local/php/lib/php/extensions/no-debug-non-zts-20100525/