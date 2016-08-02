/**
 * Created by pepelu on 2016/5/31.
 */
var permission = require('./permission');
var mongoose = require('mongoose');
var async = require('async');
var SKU = require('./SKU');
var gift = require('./gift');
var address = require('./crawler_areas');

exports.deploy_auth = function(callback) {
    async.series({
            one: permission.deploy_roles,
            two: permission.deploy_permission
        },
        function () {
            console.log('finish deploy auth');
            callback();
        });
};

exports.deploy_SKU = function(callback) {
    async.series({
            one:SKU.deploy_product_categories,
            two: SKU.deploy_suppliers,
            three: SKU.deploy_brands,
            four: SKU.deploy_product_attributes,
            five: SKU.deploy_SKU_attributes
        },
        function () {
            console.log('finish deploy SKU');
            callback();
        });
};

exports.deploy_gift = function(callback){
    async.series({
        one:gift.deploy_gift_category
    },
    function(){
        console.log('finish deploy gift');
        callback();
    })
};

exports.deploy_address = function(cb){
    async.series({
        one:address.restore_address
    },
    function(){
        console.log('finish deploy address');
        cb();
    })
};

exports.deploy_database_basic = function(cb) {
    async.series({
            1: address.restore_address,
            2: SKU.deploy_product_categories,
            3: SKU.deploy_suppliers,
            4: SKU.deploy_brands,
            5: SKU.deploy_product_attributes,
            6: SKU.deploy_SKU_attributes,
            7: permission.deploy_roles,
            8: permission.deploy_permission,
            9: gift.deploy_gift_category,
            10:require('./deploy_intention_product')
        },
        function () {
            console.log('finish deploy address');
            cb();
        })
};

exports.deploy_intention_product = require('./deploy_intention_product');