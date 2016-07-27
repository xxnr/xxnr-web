#!/usr/bin/env bash

DATESTR=`date +"%Y%m%d"`
DIR=`pwd`

echo "-------- cd ${DIR}"
cd $DIR

now_time=$(date +%Y-%m-%d-%H:%M:%S)
echo "-------- save old version codes... time:$now_time"
if [ -d "xxnrMobilePro" ]; then
	oldversion=$DIR/oldversions/${DATESTR}
	echo "-------- make old version DIR: $oldversion"
	mkdir -p $oldversion
	# save old productions*
	cp -rf xxnrMobilePro $oldversion/
else
	echo "-------- no old codes DIR, no production_html DIR..."
fi

now_time=$(date +%Y-%m-%d-%H:%M:%S)
echo "-------- rm old mobilePro directory... time:$now_time"
rm -rf xxnrMobilePro
now_time=$(date +%Y-%m-%d-%H:%M:%S)
echo "-------- run \"npm script webpack build \"... time:$now_time"
npm run build

echo "-------- mkdir & ln xxnr->images banners ... time:$now_time"
mkdir -p $DIR/xxnrMobilePro/images
ln -s ../../../xxnr/images/banners $DIR/xxnrMobilePro/images

echo "-------- mkdir & ln xxnr->xxnrMobilePro ... time:$now_time"
cd $DIR/..
ln -s $DIR/xxnrMobilePro ./

cd $DIR/../..
ROOTDIR=`pwd`
echo "-------- cd $ROOTDIR..."

now_time=$(date +%Y-%m-%d-%H:%M:%S)
echo "-------- restart pm2... time:$now_time"
export NODE_PATH=$ROOTDIR
#pm2 start release.js -i 4 --log-date-format="YYYY-MM-DD HH:mm Z"
pm2 restart mobileRelease.js -i 4 --log-date-format="YYYY-MM-DD HH:mm Z"

now_time=$(date +%Y-%m-%d-%H:%M:%S)
echo "-------- EDN... time:$now_time"
