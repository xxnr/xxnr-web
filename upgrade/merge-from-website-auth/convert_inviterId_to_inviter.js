/**
 * Created by pepelu on 2015/12/14.
 */
var config = require('../../configuration/mongoose_config');
var mongoose = require('mongoose');
var UserModel = require('../../models').user;
mongoose.connect(config.db[config.environment],{user:'xxnr',pass:'xxnr001'});

// users
// convert inviterId to inviter,
UserModel.find({}, function(err, users){
    var promises = users.map(function(user){
        return new Promise(function(resolve, reject){
            if(user.inviterId){
                UserModel.findOne({id:user.inviterId}, function(err, inviter){
                    if(err){
                        console.log(err);
                        reject(err);
                        return;
                    }

                    UserModel.update({_id:user._id}, {$set:{inviter:inviter}}, function(err){
                        if(err){
                            console.log(err);
                            reject(err);
                            return;
                        }

                        console.log('update account:', user.account, 'done.', 'inviter:',inviter.account);
                        resolve();
                    })
                })
            } else{
                resolve();
            }
        })
    });

    Promise.all(promises)
        .then(function () {
            console.log('convert inviterId to inviter Success!!!!!!!!!!!!!!!!!!!!!!');
            process.exit();
        })
        .catch(function (err) {
            console.log('convert inviterId to inviter Fail!!!!!!!!!!!!!!!!!!!!!!!!!', err);
            process.exit();
        });
});