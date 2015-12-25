/**
 * Created by pepelu on 2015/11/10.
 */
var UserModel = require('../models').user;
var PermissionModel = require('../models').permission;
var RoleModel = require('../models').role;
var BackEndUserModel = require('../models').backenduser;

// Service
var AuthService = function(){};

AuthService.prototype.auth = function(userId, route, callback){
    PermissionModel.findOne({route:route}, function(err, permission){
        if(err){
            console.log('auth err: ' + err);
            callback(err);
            return;
        }

        // if the current route has no permission controller,
        // return true
        if(!permission) {
            callback(null, true);
            return;
        }

        UserModel.findOne({id: userId}, function (err, user) {
            if (err) {
                console.log('auth err: ' + err);
                callback(err);
                return;
            }

            callback(null, permission.roles.indexOf(user.roleId) != -1);
        })
    })
};

AuthService.prototype.auth_backend = function(userId, route, method, callback){
    PermissionModel.findOne({route:route, method:method}, function(err, permission){
        if(err){
            console.log('auth err: ' + err);
            callback(err);
            return;
        }

        // if the current route has no permission controller,
        // return true
        if(!permission) {
            callback(null, true);
            return;
        }

        BackEndUserModel.findOne({_id: userId}, function (err, user) {
            if (err) {
                console.log('auth err: ' + err);
                callback(err);
                return;
            }

            callback(null, permission.roles.indexOf(user.role) != -1);
        })
    })
};

AuthService.prototype.addRole = function(model, callback){
    var role = new RoleModel(model);
    role.save(callback);
};

AuthService.prototype.getRole = function(name, callback){
    RoleModel.findOne({name:name}, callback);
};

AuthService.prototype.updateRole = function(name, values, callback){
    RoleModel.update({name:name}, {$set:values}, callback);
};

AuthService.prototype.getRoleList = function(callback){
    RoleModel.find({}, callback);
};

AuthService.prototype.addPermission = function(route, method, roleIds, callback){
    var permission = new PermissionModel({route:route, method:method, roles:roleIds});
    permission.save(callback);
};

AuthService.prototype.clearPermissions = function(callback){
    PermissionModel.remove({}, callback);
};

AuthService.prototype.getPermissionList = function(callback){
    PermissionModel.find({})
        .populate('roles')
        .exec(callback);
};

AuthService.prototype.getRolesByNames = function(names, callback){
    RoleModel.find({name:{$in:names}}, callback);
};

module.exports = new AuthService();
