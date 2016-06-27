/**
 * Created by pepelu on 2016/2/5.
 */
var mongoose = require('mongoose');
var frontendUserAccessModel = require('../models').frontendUserAccess;
var throttle_config = require('../configuration/throttle_config');

// Service
var ThrottleService = function(){
    this.THROTTLE_BY_TOTEL_HITS = 0;
    this.THROTTLE_BY_HITS_PER_USER = 1;
    this.THROTTLE_BY_HITS_PER_IP = 2;
};

// Method
/**
 * require api access based on throttle configuration
 * @param route the route(api) that is required to access
 * @param method post or get
 * @param ip ip of accessor
 * @param user current accessor's user _id
 * @param callback
 */
ThrottleService.prototype.requireAccess = function(route, method, ip, user, callback, isForwarded){
    var self = this;

    if(!route){
        callback('route required');
        return;
    }

    if(!method){
        callback('method required');
        return;
    }

    if(!ip){
        callback('ip required');
        return;
    }

    var recordPassedAccess = function() {
        var record = {route: route, method: method, ip:ip, isForwarded:isForwarded};
        if(user){
            record.user = mongoose.Types.ObjectId(user);
        }

        var newEntry = new frontendUserAccessModel(record);

        // record this hit
        newEntry.save(function(err){
            if(err){
                console.error(err);
            }
        });
    };

    var promises = [];
    if(throttle_config.max_hits && throttle_config.max_hits[route] && throttle_config.max_hits[route][method]){
        // this api is configured as throttled
        var max_hits = throttle_config.max_hits[route][method].max_hits;
        if(max_hits) {
            // this api is configured as throttle by hits
            promises.push(new Promise(function (resolve, reject) {
                frontendUserAccessModel.count({route: route, method: method}, function (err, hits) {
                    if (err) {
                        console.error(err);
                        reject(err);
                        return;
                    }

                    if (hits >= max_hits) {
                        reject(self.THROTTLE_BY_TOTEL_HITS);
                        return;
                    }

                    resolve();
                });
            }));
        }

        var max_hits_per_user = throttle_config.max_hits[route][method].max_hits_per_user;
        if(max_hits_per_user){
            if(!user){
                callback('user required');
                return;
            }

            // this api is configured as throttle by hits_per_user
            promises.push(new Promise(function (resolve, reject) {
                frontendUserAccessModel.count({route: route, method: method, user:mongoose.Types.ObjectId(user)}, function (err, hitsPerUser) {
                    if (err) {
                        console.error(err);
                        reject(err);
                        return;
                    }

                    if (hitsPerUser >= max_hits_per_user) {
                        reject(self.THROTTLE_BY_HITS_PER_USER);
                        return;
                    }

                    resolve();
                });
            }));
        }

        var max_hits_per_ip = throttle_config.max_hits[route][method].max_hits_per_ip;
        if(max_hits_per_ip){
            // this api is configured as throttle by ip
            promises.push(new Promise(function (resolve, reject) {
                frontendUserAccessModel.count({route: route, method: method, ip:ip}, function (err, hitsPerIp) {
                    if (err) {
                        console.error(err);
                        reject(err);
                        return;
                    }

                    if (hitsPerIp >= max_hits_per_ip) {
                        reject(self.THROTTLE_BY_HITS_PER_IP);
                        return;
                    }

                    resolve();
                });
            }));
        }
    }

    if(promises.length == 0){
        // this api is not configured to be throttle
        callback(true);
        recordPassedAccess();
    } else{
        Promise.all(promises)
            .then(function(){
                // pass
                callback(true);
                recordPassedAccess();
            })
            .catch(function(err){
                // reject
                callback(false, err);
            })
    }
};

module.exports = new ThrottleService();