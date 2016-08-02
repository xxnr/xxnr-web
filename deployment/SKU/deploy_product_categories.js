/**
 * Created by pepelu on 2016/8/1.
 */
require('../../common/utils');
var product_categories = require('./product_categories');
var CategoryModel = require('../../models').category;

module.exports = function(callback) {
    CategoryModel.find({}).remove(function (err) {
        if (err) {
            console.error(err);
            callback(err);
        }

        var saveAllCategories = product_categories.map(function (category) {
            return new Promise(function (resolve, reject) {
                category.id = category.name.slug();
                (new CategoryModel(category)).save(function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                })
            })
        });

        Promise.all(saveAllCategories)
            .then(function () {
                console.info('Deploy product categories done');
                callback();
            })
            .catch(function (err) {
                console.error(err);
                callback(err);
            })
    });
};