/**
 * Created by pepelu on 2016/1/20.
 */
var fs = require('fs');
var IntentionProductService = require('../services/intention_product');
var ProductModel = require('../models').product;
var deploy = function(done) {
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

                var order = fields[0].trim();
                var name = fields[1].trim();
                ProductModel.findOne({name:{$regex:new RegExp(name)}})
                    .populate('brand')
                    .exec(function(err, product){
                        if(err){
                            reject(err);
                            return;
                        }

                        var brand = '其他';
                        var productRef = null;
                        var brandRef = null;
                        if(product) {
                            brand = product.brand.name;
                            productRef = product._id;
                            brandRef = product.brand._id;
                        }
                        IntentionProductService.save(name, order, brand, productRef, brandRef, function (err) {
                            if (err) {
                                reject(err);
                                return;
                            }

                            //console.log(name, 'saved');
                            resolve();
                        });
                })
            });
        });

        Promise.all(promises)
            .then(function () {
                console.log('done');
                //process.exit(0);
                done()
            })
            .catch(function (err) {
                console.error(err);
                //process.exit(1);
                done(err);
            })
    });
};

module.exports =  deploy;

//deploy(function(err){
//    process.exit(0);
//});