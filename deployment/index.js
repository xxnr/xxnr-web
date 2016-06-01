/**
 * Created by pepelu on 2016/5/31.
 */
var permission = require('./permission');
var mongoose = require('mongoose');
var async = require('async');
var SKU = require('./SKU');

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
            one: SKU.deploy_suppliers,
            two: SKU.deploy_brands,
            three: SKU.deploy_product_attributes,
            four: SKU.deploy_SKU_attributes
        },
        function () {
            console.log('finish deploy SKU');
            callback();
        });
};