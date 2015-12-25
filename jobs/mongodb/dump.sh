#!/bin/bash
#program 
#this shell is mongodb bat
#history
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:~/bin
export PATH
targetpath=/mnt/mongodb/backup/data/dump

# rm old backup files (!0001) one days ago 
find ${targetpath} -path "${targetpath}/*0001" -prune -o -type d -mtime +1 -print | xargs rm -rf
# rm old backup logs (!0001.log) one days ago 
find ${targetpath}/logs ! -name "*0001.log" -type f -mtime +1 -print | xargs rm -rf

# backup mongodb
nowtime=$(date +%Y%m%d%H%M)
user="xxnr"
ps="TXHT001"
start()
{
mongodump -u ${user} -p ${ps} --port 27017 -o ${targetpath}/${nowtime}
}
execute()
{
        start
        if [ $? -eq 0 ]
        then
                echo "back successfully"
        else
                echo "back failure!"
        fi
}
if [ ! -d "${targetpath}/${nowtime}/" ]
then
        mkdir  ${targetpath}/${nowtime}
fi
execute
echo "===========back end ${nowtime}==================="
