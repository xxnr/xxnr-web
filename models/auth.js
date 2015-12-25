/**
 * Created by pepelu on 2015/11/9.
 */
var mongoose = require('mongoose');

// Schema
var PermissionSchema = new mongoose.Schema({
    route:{type:String, required:true},
    method:{type:String, required:true},
    roles:[{type:mongoose.Schema.ObjectId, ref: 'role'}]
});

PermissionSchema.index({route:1, method:1}, {unique:true});

var RoleSchema = new mongoose.Schema({
    name: {type:String, required:true, index: true, unique: true},     //role name
    view_roles: [{type:String}],              // view roles
    isSuperAdmin: Boolean
});

// Model
mongoose.model('permission', PermissionSchema);
mongoose.model("role", RoleSchema);