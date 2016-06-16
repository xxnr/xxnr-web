/**
 * Created by pepelu on 2015/12/30.
 */
var fs = require('fs');
var SupplierModel = require('../../models').supplier;
module.exports = function(callback) {
    fs.readFile(__dirname + '/suppliers.txt', function (err, content) {
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

                var supplierName = fields[0];
                var newSupplier = new SupplierModel({name:supplierName});
                newSupplier.save(function(err){
                    if(err){
                        if(11000 == err.code){
                            //console.log('supplier', supplierName, 'already exist');
                            resolve();
                            return;
                        } else {
                            console.log(err);
                            reject(err);
                            return;
                        }
                    }

                    //console.log('supplier', supplierName, 'added');
                    resolve();
                });
            });
        });

        Promise.all(promises)
            .then(function(){
                //console.log('Deploy suppliers success!!!!!!!!!!!');
                callback();
            })
            .catch(function(err){
                console.log('Deploy suppliers fail!!!!!!!!!!!!!!', err);
                callback(err);
            })
    });
};
