/**
 * Created by pepelu on 2016/6/27.
 */
var models = require('../../models');
var FUA = models.frontendUserAccess;
var fs = require('jsonfile');
var path = require('path');

var tempFilePath = path.join(__dirname, 'temp_ip_list.txt');
var ips = [];
var hasForwardedCount = 0;

FUA.aggregate({$match:{route:'/api/v2.0/sms'}},
{$group:{_id:'$ip', count:{$sum:1}}})
    .exec(function(err, result){
        if(!err){
            try {
                ips = fs.readFileSync(tempFilePath, false);
            } catch(e){

            }

            result.forEach(function(ip){
                if(ip.count >= 3  && ips.indexOf(ip._id) == -1){
                    ips.push(ip._id);
                }
            });

            fs.writeFileSync(tempFilePath, ips);

            FUA.find({ip:{$in:ips}}, function(err, docs){
                if(err){
                    console.error(err);
                    process.exit(1);
                }

                var promises = docs.map(function(doc){
                    return new Promise(function(resolve, reject){
                        var newRecord = new FUA({route:doc.route, method:doc.method, user:doc.user, ip:doc.ip, forwardedBy:doc.forwardedBy});
                        if(doc.forwardedBy){
                            hasForwardedCount++;
                        }
                        newRecord.save(function(err){
                            if(!err){
                                //console.log(newRecord.ip, 'saved at', newRecord.createdAt);
                                resolve();
                            } else{
                                reject(err);
                            }});
                        doc.remove(function(){});
                    })
                });

                Promise.all(promises)
                    .then(function(){
                        console.log('', ips.length, 'ips forbidden at', new Date(), 'while', hasForwardedCount, 'ips has been Forwarded');
                        process.exit(0);
                    })
                    .catch(function(err){
                        console.error(err);
                        process.exit(1);
                    })
            });
        }
    });

