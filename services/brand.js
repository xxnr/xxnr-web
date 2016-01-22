/**
 * Created by pepelu on 2015/12/30.
 */
var BrandModel = require('../models').brand;

// Service
var BrandService = function(){};

// Method
BrandService.prototype.query = function(category, callback){
    var queryOptions= {};
    if(category){
        queryOptions.categories = category;
    }

    BrandModel.find(queryOptions, function(err, brands){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, brands || []);
    })
};

module.exports = new BrandService();