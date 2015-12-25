#!/bin/bash
#program 
#this shell is mongodb bat
#history
PATH=/bin:/sbin:/usr/bin:/usr/sbin:/usr/local/bin:/usr/local/sbin:~/bin
export PATH
targetpath=/mnt/mongodb/backup/data/dump

nowtime=$(date +%Y%m%d%H%M)
user="xxnr"
ps="xxnr001"
start()
{
#mongorestore -u ${user} -p ${ps} --port 27017 ${targetpath}/${nowtime}
#mongorestore -u ${user} -p ${ps} --port 27017 -d xxnr --drop ${targetpath}/xxnr/
}
execute()
{
        start
        if [ $? -eq 0 ]
        then
                echo "restore successfully"
        else
                echo "restore failure!"
        fi
}
execute
echo "===========restore end ${nowtime}==================="
