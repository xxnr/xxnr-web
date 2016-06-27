/**
 * Created by pepelu on 2015/11/25.
 */
var fs = require('fs');
var AuthService = require('../../services/auth');
module.exports = function(callback){
    fs.readFile(__dirname + '/permission.txt', function (err, content) {
            if (err) {
                console.log(err);
                return;
            }

        // clear current permission table
        AuthService.clearPermissions(function (err) {
            if (err) {
                console.log('clear permission err:' + err);
                return;
            }

            console.log('clear all permissions done');
            var promises = content.toString().split('\r\n').map(function (line) {
                return new Promise(function (resolve, reject) {
                    if (line.startsWith('#')) {
                        resolve();
                        return;
                    }

                    var fields = line.split(',');
                    if (fields.length < 3) {
                        resolve();
                        return;
                    }

                    var route = fields[0].trim().toLowerCase();

                    if (route.endsWith('/')) {
                        route = route.substring(0, route.length - 1);
                    }

                    var method = fields[1].trim().toLowerCase();
                    var roleNames = [];
                    for (var i = 2; i < fields.length; i++) {
                        roleNames.push(fields[i].trim().toLowerCase());
                    }

                    AuthService.getRolesByNames(roleNames, function (err, roles) {
                        if (err) {
                            console.log('get roles err' + err);
                            reject();
                            return;
                        }

                        var roleIds = [];
                        for (var j = 0; j < roles.length; j++) {
                            roleIds.push(roles[j]._id);
                        }

                        AuthService.addPermission(route, method, roleIds, function (err) {
                            if (err) {
                                console.log('Error add permission:', err);
                                reject();
                                return;
                            }

                            //console.log('Finish to add permission', route, method, roleIds);
                            resolve();
                        });
                    });
                });
            });

            Promise.all(promises)
                .then(function () {
                    //console.log('Deploy Permission Success!!!!!!!!!!!!!!!!!!!!!!');
                    callback();
                })
                .catch(function () {
                    console.log('Deploy Permission Fail!!!!!!!!!!!!!!!!!!!!!!!!!');
                    callback();
                });
        })
    });
};

