/**
 * Created by pepelu on 2016/6/27.
 */
var models = require('../../models');
var FUA = models.frontendUserAccess;
var forbidden_ip_list = require('./forbidden_ip_list');

var ips = [];
forbidden_ip_list.forEach(function(ip){
    if(ip.count == 5){
        ips.push(ip._id);
    }
});

FUA.find({ip:{$in:ips}}, function(err, docs){
    if(err){
        console.error(err);
        process.exit(1);
    }

    var promises = docs.map(function(doc){
        return new Promise(function(resolve, reject){
            var newRecord = new FUA({route:doc.route, method:doc.method, user:doc.user, ip:doc.ip});
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
            console.log(ips.length, 'ips forbidden at', new Date());
            process.exit(0);
        })
        .catch(function(err){
            console.error(err);
            process.exit(1);
        })
});