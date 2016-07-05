/**
 * Created by pepelu on 2016/7/4.
 */
var fs = require('jsonfile');
var models = require('../../models');
var FUA = models.frontendUserAccess;
var tempFilePath = require('path').join(__dirname, '../../jobs/throttle/temp_ip_list.txt');
require('../../common/utils');

var route = '/api/v2.0/sms';
var ips = fs.readFileSync(tempFilePath, false);
var total = 0;
var promises = ips.map(function(ip){
    return new Promise(function(resolve, reject){
        FUA.count({route:route, ip:ip}, function(err, count){
            if(err){
                reject(err);
                return;
            }

            if(count){
                resolve();
                return;
            }

            var deploy_get_and_post = [];
            for(var i = 0; i < 5; i++) {
                deploy_get_and_post.push(new Promise(function(resolve, reject){
                    var newRecord_get = new FUA({route: route, method: 'get', ip: ip, expireAt: new Date().add('h', 2)});
                    var newRecord_post = new FUA({route: route, method: 'post', ip: ip, expireAt: new Date().add('h', 2)});
                    newRecord_get.save(function(err) {
                        if (err) {
                            console.error(err);
                            return;
                        }

                        newRecord_post.save(function(err){
                            if(err){
                                console.error(err);
                                return;
                            }

                            resolve();
                        })
                    });
                }))
            }

            Promise.all(deploy_get_and_post)
                .then(function(){
                    total++;
                    resolve();
                })
                .catch(function(err){
                    reject(err);
                })
        })
    })
});

Promise.all(promises)
.then(function(){
    console.log('deploy', total, 'ips');
    process.exit(0);
})
.catch(function(err){
    console.error(err);
    process.exit(1);
});