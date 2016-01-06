/**
 * Created by pepelu on 2015/12/29.
 */
var fs = require('fs');
var BrandModel = require('../../models').brand;
var SupplierModel = require('../../models').supplier;
module.exports = function(callback) {
    fs.readFile(__dirname + '/brands.txt', function (err, content) {
        if (err) {
            console.log(err);
            return;
        }

        var promises = content.toString().split('\r\n').map(function (line) {
            return new Promise(function(resolve, reject){
                if (line.startsWith('#')) {
                    resolve();
                    return;
                }

                var fields = line.split(',');
                if (fields.length < 3) {
                    resolve();
                    return;
                }

                var brandName = fields[0].trim();
                var category = fields[1].trim();
                var suppliers = [];
                for(var i=2; i<fields.length; i++){
                    suppliers.push(fields[i].trim().toLowerCase());
                }

                var supplier_to_insert = [];
                var supplierPromises = suppliers.map(function(supplierName){
                    return new Promise(function(resolve, reject){
                        SupplierModel.findOne({name:supplierName}, function(err, supplier){
                            if(err){
                                console.log(err);
                                reject(err);
                                return;
                            }

                            if(!supplier){
                                console.log('no supplier', supplierName, 'found');
                                reject();
                                return;
                            }

                            supplier_to_insert.push(supplier);
                            resolve();
                        })
                    })
                });

                Promise.all(supplierPromises)
                    .then(function(){
                        var newBrand = new BrandModel({name:brandName, category: category, suppliers:supplier_to_insert});
                        newBrand.save(function(err){
                            if(err){
                                if(11000 == err.code){
                                    console.log('test');
                                    BrandModel.update({name:brandName}, {$set:{categories:[category], suppliers:supplier_to_insert}}, function(err, numAffected){
                                        if(err){
                                            console.log(err);
                                            reject(err);
                                            return;
                                        }

                                        if(numAffected.n==0){
                                            console.log('brand', brandName, 'not exist');
                                            reject();
                                            return;
                                        }

                                        resolve();
                                    });

                                    return;
                                } else {
                                    console.log(err);
                                    reject(err);
                                    return;
                                }
                            }

                            console.log('Add brand:', brandName);
                            resolve();
                        })
                    })
                    .catch(function(err){
                        reject(err);
                    })
            })
        });

        Promise.all(promises)
            .then(function(){
                console.log('deploy brand success!!!!!!!!!!!');
                callback()
            })
            .catch(function(err){
                console.log('deploy brand fail!!!!!!!!!!!!!!', err);
                callback(err);
            })
    });
};