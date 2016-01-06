/**
 * Created by pepelu on 2015/12/31.
 */
var CategoryModel = require('../models').category;

// Service
CategoryService = function(){};

// Method
CategoryService.prototype.all = function(callback){
    CategoryModel.find({}, function(err, categories){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, categories || []);
    })
};

module.exports = new CategoryService();