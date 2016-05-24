/**
 * Created by pepelu on 2016/5/24.
 */
var fs = require('fs');
var UserModel = require('../../models').user;

fs.readFile(__dirname + '/testAccount', function (err, content) {
    if (err) {
        console.log(err);
        return;
    }

    var count = 0;
    var promises = content.toString().split('\r\n').map(function (line) {
        return new Promise(function (resolve, reject) {
            if (line.startsWith('#')) {
                resolve();
                return;
            }

            var fields = line.split('\t');
            if (fields.length < 3) {
                resolve();
                return;
            }

            var account = fields[2];
            UserModel.update({account: account}, {$set: {isTestAccount: true}}, function (err, numUpdated) {
                if(err){
                    reject(err);
                    return;
                }

                if(numUpdated.n>0 && numUpdated.ok==1){
                    console.log('set', account, 'to test account');
                    count++;
                }

                resolve();
            })
        });
    });

    Promise.all(promises)
        .then(function(){
            console.log('set', count, 'account to test account');
            process.exit(0);
        })
        .catch(function(err){
            console.error(err);
            process.exit(1);
        })
});
