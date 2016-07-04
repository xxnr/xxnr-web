/**
 * Created by pepelu on 2016/7/4.
 */
var models = require('../../models');
var FUA = models.frontendUserAccess;
var throttle_config = require('../../configuration/throttle_config');

FUA.find({}, function(err, records){
    var total = records.length;
    var count = 0;
    var promises = records.map(function(record){
        return new Promise(function(resolve, reject){
            if(throttle_config.max_hits && throttle_config.max_hits[record.route] && throttle_config.max_hits[record.route][record.method]) {
                record.expireAt = record.createdAt.add('s', throttle_config.max_hits[record.route][record.method].interval);
                record.save(function(err){
                    if(err) {
                        console.error(err);
                    } else{
                        count++;
                    }

                    resolve();
                });
            } else{
                resolve();
            }
        })
    });

    Promise.all(promises)
        .then(function(){
            console.log('convert', count, 'record(s) out of', total);
            process.exit(0);
        });
});