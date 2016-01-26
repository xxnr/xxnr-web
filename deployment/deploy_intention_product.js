/**
 * Created by pepelu on 2016/1/20.
 */
var fs = require('fs');
var config = require('../configuration/mongoose_config');
var mongoose = require('mongoose');
mongoose.connect(config.db[config.environment],{user:'xxnr',pass:'xxnr001'});
var IntentionProductService = require('../services/intention_product');
fs.readFile(__dirname + '/intention_products.txt', function (err, content) {
    if (err) {
        console.log(err);
        return;
    }

    var promises = content.toString().split('\r\n').map(function (line) {
        return new Promise(function (resolve, reject) {
            if (line.startsWith('#')) {
                resolve();
                return;
            }

            var fields = line.split(',');
            if (fields.length < 1) {
                resolve();
                return;
            }

            var name = fields[0].trim();
            IntentionProductService.save(name, function(err){
                if (err) {
                    reject(err);
                    return;
                }

                console.log(name, 'saved');
                resolve();
            });
        });
    });

    Promise.all(promises)
        .then(function(){
            console.log('done');
            process.exit(0);
        })
        .catch(function(err){
            console.log(err);
            process.exit(1);
        })
});