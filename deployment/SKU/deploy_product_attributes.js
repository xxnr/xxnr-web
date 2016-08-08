/**
 * Created by pepelu on 2015/12/29.
 */
var fs = require('fs');
var ProductService = require('../../services/product');
var BrandModel = require('../../models').brand;
module.exports = function(callback) {
    fs.readFile(__dirname + '/product_attributes.txt', function (err, content) {
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
                if (fields.length < 6) {
                    resolve();
                    return;
                }

                var order = parseInt(fields[0].trim());
                var display = (fields[1].trim() === 'true');
                var category = fields[2].trim();
                var brand = fields[3].trim();
                var name = fields[4].trim();

                var values = [];
                for (var i = 5; i < fields.length; i++) {
                    values.push(fields[i].trim());
                }

                var skipBrand = false;
                if(!brand){
                    skipBrand = true;
                }

                BrandModel.findOne({name:brand}, function(err, brand){
                    if(err){
                        console.log(err);
                        reject(err);
                        return;
                    }

                    if(!brand && !skipBrand){
                        console.log('no brand', brand, 'found');
                        reject();
                        return;
                    }

                    var valuePromises = values.map(function (value) {
                        return new Promise(function (resolve, reject) {
                            var index = values.indexOf(value);
                            var value_order = order * 100 + index;
                            ProductService.addAttribute(category, skipBrand ? null : brand._id, name, value, value_order, function (err) {
                                if (err) {
                                    if(11000 == err.code){
                                        ProductService.updateAttributeOrderAndDisplay(category, skipBrand? null:brand._id, name, value, value_order, function(err){
                                            if(err){
                                                reject(err);
                                                return;
                                            }

                                            resolve();
                                        }, display);

                                        return;
                                    }

                                    console.log(err);
                                    reject(err);
                                    return;
                                }

                                //console.log('attribute', {
                                //    category: category,
                                //    brand: brand,
                                //    name: name,
                                //    value: value
                                //}, 'saved');
                                resolve();
                            }, display)
                        })
                    });

                    Promise.all(valuePromises)
                        .then(function () {
                            resolve();
                        })
                        .catch(function (err) {
                            reject(err);
                        })
                });
            })
        });

        Promise.all(promises)
            .then(function () {
                //console.log('Deploy product attributes success!!!!!!!!!!!!!');
                callback();
            })
            .catch(function(err){
                console.log('Deploy product attributes fail!!!!!!!!!!!!!!!!', err);
                callback(err);
            })
    })
};

