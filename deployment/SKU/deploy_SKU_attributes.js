/**
 * Created by pepelu on 2016/1/6.
 */
var fs = require('fs');
var SKUService = require('../../services/SKU');
var BrandModel = require('../../models').brand;
module.exports = function(callback) {
    fs.readFile(__dirname + '/SKU_attributes.txt', function (err, content) {
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
                if (fields.length < 4) {
                    resolve();
                    return;
                }

                var category = fields[0].trim();
                var brand = fields[1].trim();
                var name = fields[2].trim();

                var values = [];
                for (var i = 3; i < fields.length; i++) {
                    values.push(fields[i].trim());
                }

                BrandModel.findOne({name: brand}, function (err, brand) {
                    if (err) {
                        console.log(err);
                        reject(err);
                        return;
                    }

                    if (!brand) {
                        console.log('no brand', brand, 'found');
                        reject();
                        return;
                    }

                    var valuePromises = values.map(function (value) {
                        return new Promise(function (resolve, reject) {
                            SKUService.addSKUAttribute(category, brand, name, value, function (err) {
                                if (err) {
                                    if(11000 == err.code){
                                        resolve();
                                        return;
                                    }

                                    console.log(err);
                                    reject(err);
                                    return;
                                }

                                console.log('sku attribute', {
                                    category: category,
                                    brand: brand,
                                    name: name,
                                    value: value
                                }, 'saved');

                                resolve();
                            });
                        });
                    });

                    Promise.all(valuePromises)
                        .then(function () {
                            resolve();
                        })
                        .catch(function (err) {
                            reject(err);
                        })
                });
            });
        });

        Promise.all(promises)
            .then(function () {
                console.log('Deploy SKU attributes success!!!!!!!!!!!!!');
                callback();
            })
            .catch(function(err){
                console.log('Deploy SKU attributes fail!!!!!!!!!!!!!!!!', err);
                callback(err);
            })
    });
};