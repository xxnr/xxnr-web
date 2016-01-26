/**
 * Created by pepelu on 2016/1/6.
 */
var config = require('../../configuration/mongoose_config');
var mongoose = require('mongoose');
var ProductModel = require('../../models').product;
var BrandModel = require('../../models').brand;
mongoose.connect(config.db[config.environment],{user:'xxnr',pass:'xxnr001'});

ProductModel.find({brandName:{$exists:true}}, function(err, products){
    if(err){
        console.error(err);
        return;
    }

    var promises = products.map(function(product) {
        return new Promise(function (resolve, reject) {
            BrandModel.findOne({name: product.brandName}, function (err, brand) {
                if (err) {
                    console.error(err);
                    return;
                }

                product.brand = brand;
                product.save(function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                })
            })
        })
    });

    Promise.all(promises)
        .then(function(){
            console.log('done');
            process.exit(0);
        })
        .catch(function(err){
            console.error(err);
            process.exit(1);
        })
});