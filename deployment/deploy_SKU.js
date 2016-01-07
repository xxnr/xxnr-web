/**
 * Created by pepelu on 2015/12/29.
 */

var config = require('../configuration/mongoose_config');
var SKU = require('./SKU');
var mongoose = require('mongoose');
var async = require('async');
mongoose.connect(config.db[config.environment],{user:'xxnr',pass:'xxnr001'});

async.series({
        one: SKU.deploy_suppliers,
        two: SKU.deploy_brands,
        three: SKU.deploy_product_attributes,
        four: SKU.deploy_SKU_attributes
    },
    function() {
        console.log('done');
        process.exit(0);
    });