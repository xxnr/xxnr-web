/**
 * Created by pepelu on 2016/7/13.
 */
var models = require('../../models');
var UserModel = models.user;
var PotentialCustomerModel = models.potential_customer;
var fs = require('fs');

var path = process.argv[2];
var content = fs.readFileSync(path);
var count = 0;
var promises = content.toString().split('\r\n').map(function (line) {
    var columns = line.split('\t');
    var phone = columns[2];
    var newUserAccount = columns[11];
    return new Promise(function (resolve, reject) {
        if (columns.length != 13) {
            resolve();
            return;
        }

        UserModel.findOne({account: newUserAccount}, function (err, user) {
            if (err) {
                reject(err);
                return;
            }

            PotentialCustomerModel.findOneAndUpdate({phone: phone}, {$set: {user: user._id}}, function (err) {
                if(err){
                    reject(err);
                    return;
                }

                count++;
                resolve();
            })
        })
    })
});

Promise.all(promises)
    .then(function(){
        console.log('done with', count, 'potential customers updated');
        process.exit(0);
    })
    .catch(function(err){
        console.error(err);
        process.exit(1);
    });