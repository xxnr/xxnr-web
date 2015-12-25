/**
 * Created by pepelu on 2015/12/3.
 */

var config = require('../configuration/mongoose_config');
var permission = require('./permission');
var mongoose = require('mongoose');
var async = require('async');
mongoose.connect(config.db[config.environment],{user:'xxnr',pass:'xxnr001'});

async.series({
    one: permission.deploy_roles,
    two: permission.deploy_permission
},
    function() {
        console.log('done');
        process.exit(0);
    });