/**
 * Created by pepelu on 2016/8/2.
 */
var gift_categories = require('./gift_categories');
var GiftCategoryModel = require('../../models').rewardshopgiftcategory;

module.exports = function(callback) {
    GiftCategoryModel.find({}).remove(function (err) {
        if (err) {
            console.error(err);
            callback(err);
        }

        var saveAllCategories = gift_categories.map(function (category) {
            return new Promise(function (resolve, reject) {
                (new GiftCategoryModel(category)).save(function (err) {
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
                console.info('done');
                callback();
            })
            .catch(function (err) {
                console.error(err);
                callback(err);
            })
    });
};