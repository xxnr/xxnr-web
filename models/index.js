/**
 * Created by pepelu on 2015/11/18.
 */
var mongoose = require('mongoose');
require('./users');
require('./auth');
require('./backendusers');
require('./areas');
require('./useraddresses');
require('./business');
require('./orders');
require('./products');
require('./news');
require('./carts');
require('./SKU');
require('./brands');
require('./Supplier');
require('./categories');
require('./whitelist');
require('./auditlogs');
require('./frontendUserAccess');

//user
exports.user = mongoose.model('user');
exports.userLog = mongoose.model('users-log');
exports.role = mongoose.model('role');
exports.permission = mongoose.model('permission');
exports.backenduser = mongoose.model('backenduser');
exports.business = mongoose.model('business');
// area
exports.province = mongoose.model('province');
exports.city = mongoose.model('city');
exports.county = mongoose.model('county');
exports.town = mongoose.model('town');
exports.specialprovince = mongoose.model('specialprovince');
// useraddress
exports.useraddress = mongoose.model('useraddress');
// order
exports.order = mongoose.model('order');
// product
exports.product = mongoose.model('product');
exports.productAttribute = mongoose.model('productAttribute');
// news
exports.news = mongoose.model('news');
exports.newsCategory = mongoose.model('newscategory');
// cart
exports.cart = mongoose.model('cart');
// user new orders number
exports.userordersnumber = mongoose.model('userordersnumber');
// SKU
exports.SKU = mongoose.model('SKU');
exports.SKUAttributes = mongoose.model('SKUAttribute');
exports.SKUAddition = mongoose.model('SKUAddition');
// brand
exports.brand = mongoose.model('brand');
// supplier
exports.supplier = mongoose.model('supplier');
// category
exports.category = mongoose.model('category');
// user white list
exports.userwhitelist = mongoose.model('userwhitelist');
// intention_product
exports.intention_product = mongoose.model('intention_product');
// potential_customer
exports.potential_customer = mongoose.model('potential_customer');
// order paid log
exports.orderpaidlog = mongoose.model('order_paid_log');
// audit logs
exports.auditlog = mongoose.model('auditlog');
// frontend user access
exports.frontendUserAccess = mongoose.model('frontendUserAccess');

exports.getModel = function (name, options) {
    options = options || {};

    if (options.language) {
        var names = mongoose.modelNames();
        for (var i = 0; i < names.length; ++i) {
            if (names[i] === options.language + '_' + name) {
                name = options.language + '_' + name;
                break;
            }
        }
    }

    return mongoose.model(name);
};