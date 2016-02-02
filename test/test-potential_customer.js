/**
 * Created by pepelu on 2016/1/19.
 */
var userModel = require('../models').user;
var framework = require('total.js');
userModel.find({}, function(err, users){
    var updator = function(index){
        if(index == users.length){
            console.log('done');
            process.exit(0);
        }

        var user = users[index];
        for(var i=0; i<10000; i++) {
            var fakePhoneNumber = U.GUID(13);
            user.potential_customer.push({phone: fakePhoneNumber});
        }

        user.save(function(err){
            if(!err) {
                console.log('potential customer', fakePhoneNumber, 'stored for', user.account);
                updator(index+1);
            }
        });
    };

    updator(0);
});