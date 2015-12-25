/**
 * Created by pepelu on 2015/12/3.
 */
var fs = require('fs');
var AuthService = require('../../services/auth');
module.exports = function(callback){
    fs.readFile(__dirname + '/roles.txt', function (err, content) {
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
                if (fields.length < 2) {
                    resolve();
                    return;
                }

                var role_name = fields[0].trim().toLowerCase();

                var viewRoles = [];
                for (var i = 1; i < fields.length; i++) {
                    viewRoles.push(fields[i].trim().toLowerCase());
                }

                AuthService.getRole(role_name, function (err, role) {
                    if (err) {
                        console.log('get role fail:', err);
                        reject();
                        return;
                    }

                    var newValue = {name: role_name, view_roles: viewRoles};
                    if (role_name === 'super_admin') {
                        newValue.isSuperAdmin = true;
                    }

                    if (!role) {
                        AuthService.addRole(newValue, function (err) {
                            if (err) {
                                console.log('Add role fail:', err);
                                reject();
                                return;
                            }

                            console.log('Finish to add role:', role, viewRoles);
                            resolve();
                        })
                    } else {
                        AuthService.updateRole(role_name, newValue, function (err) {
                            if (err) {
                                console.log('update role err', err);
                                reject();
                                return;
                            }

                            console.log('Finish to update role:', role_name, viewRoles);
                            resolve();
                        })
                    }
                });
            })
        });

        Promise.all(promises)
            .then(function () {
                console.log('Deploy Roles Success!!!!!!!!!!!!!!!!!!!!!!');
                callback();
            })
            .catch(function () {
                console.log('Deploy Roles Fail!!!!!!!!!!!!!!!!!!!!!!!!!');
                callback();
            });
    });
}

