/**
 * Created by pepelu on 2016/5/17.
 */
var SKUModel = require('../../models').SKU;
var SKUService = require('../../services/SKU');

SKUModel.find({}, function(err, SKUs){
    if(err){
        console.error(err);
        process.exit(1);
    }

    var successCount = 0;
    var promises = SKUs.map(function(SKU){
        return new Promise(function(resolve, reject){
            var SKUAttributesKey = SKUService.getSKUAttributesKey(SKU.attributes);
            SKU.attributeKey = SKUAttributesKey;
            SKU.save(function(err){
                if(err){
                    reject(err);
                    return;
                }

                successCount++;
                resolve();
            })
        })
    });

    Promise.all(promises)
        .then(function(){
            console.info('success!', successCount, 'SKU converted');
            process.exit(0);
        })
        .catch(function(err){
            console.error(err);
            process.exit(1);
        })
});