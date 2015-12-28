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
// news
exports.news = mongoose.model('news');
exports.newsCategory = mongoose.model('newscategory');
// cart
exports.cart = mongoose.model('cart');
// user new orders number
exports.userordersnumber = mongoose.model('userordersnumber');

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