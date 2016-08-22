/**
 * Created by pepelu on 2016/8/22.
 */
var models = require('../models');
var NominateCategoryModel = models.nominate_category;

var Nominate_category_service = function(){};

Nominate_category_service.prototype.query = function(options, callback){
    var query = {};
    if(options){
        if(options.hasOwnProperty('online')){
            query.online = options.online;
        }
    }

    NominateCategoryModel.find(query)
        .sort({order:1})
        .exec(function(err, nominate_categories){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback(null, nominate_categories || []);
        })
};

module.exports = new Nominate_category_service();