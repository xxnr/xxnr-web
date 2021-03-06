#!/bin/bash

DATESTR=`date +"%Y%m%d"`
DIR=`pwd`
r_typeA="minify"
r_typeB="rev"


#if [ $# = 0 ]; then
#  r_type="minify"
#else
#  r_type=$1
#fi

echo "-------- cd ${DIR}"
cd $DIR

now_time=$(date +%Y-%m-%d-%H:%M:%S)
echo "-------- save old version codes... time:$now_time"
if [ -d "production_html" ]; then
	oldversion=$DIR/oldversions/${DATESTR}
	echo "-------- make old version DIR: $oldversion"
	mkdir -p $oldversion
	# save old productions*
	cp production_html $oldversion/production_html_old -rf
	rm -rf $oldversion/production_html_old/production_css
	cp production_css $oldversion/production_html_old/production_css -rf
	rm -rf $oldversion/production_html_old/production_js
	cp production_js $oldversion/production_html_old/production_js -rf
else
	echo "-------- no old codes DIR, no production_html DIR..."
fi

now_time=$(date +%Y-%m-%d-%H:%M:%S)
echo "-------- run \"gulp $r_typeA\"... time:$now_time"
gulp $r_typeA

now_time=$(date +%Y-%m-%d-%H:%M:%S)
echo "-------- run \"gulp $r_typeB\"... time:$now_time"
gulp $r_typeB

# first
rm -f $DIR/production_html/images
ln -s $DIR/images $DIR/production_html/images

rm -f $DIR/production_html/resources
ln -s $DIR/resources $DIR/production_html/resources

rm -f $DIR/production_html/production_css
ln -s $DIR/production_css $DIR/production_html/production_css

rm -f $DIR/production_html/production_js
ln -s $DIR/production_js $DIR/production_html/production_js

cd $DIR/../..
ROOTDIR=`pwd`
echo "-------- cd $ROOTDIR..."
# first
rm -f $ROOTDIR/public/xxnrpro
ln -s $DIR/production_html $ROOTDIR/public/xxnrpro

now_time=$(date +%Y-%m-%d-%H:%M:%S)
echo "-------- restart pm2... time:$now_time"
export NODE_PATH=$ROOTDIR
#pm2 start release.js -i 4 --log-date-format="YYYY-MM-DD HH:mm Z"
pm2 restart release.js -i 4 --log-date-format="YYYY-MM-DD HH:mm Z"

now_time=$(date +%Y-%m-%d-%H:%M:%S)
echo "-------- EDN... time:$now_time"
