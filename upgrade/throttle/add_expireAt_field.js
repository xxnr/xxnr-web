/**
 * Created by pepelu on 2016/7/4.
 */
var models = require('../../models');
var FUA = models.frontendUserAccess;
var throttle_config = require('../../configuration/throttle_config');

FUA.find({}, function(err, records){
    var total = records.length;
    var count = 0;
    console.log('found', total, 'record');
    var concurrency = 1000;
    var batchUpdateFUA = function(i, max){
        var promises = [];
        for(; i< max; i++){
            promises.push(new Promise(function(resolve, reject){
                var record = records[i];
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
            }))
        }

        Promise.all(promises)
            .then(function(){
                console.log('convert', count, 'record(s) out of', total);
                if(max >= total){
                    process.exit(0);
                } else if(max < total - concurrency){
                    batchUpdateFUA(max, max+currency);
                } else if(max >= total - concurrency && max < total){
                    batchUpdateFUA(max, total);
                }
            });
    };

    if(total > concurrency){
        batchUpdateFUA(0, concurrency)
    } else{
        batchUpdateFUA(0, total);
    }
});