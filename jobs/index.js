/**
 * Created by zhouxin on 2016/8/22.
 */

exports.generate_products_by_brands = function(callback) {
    require('./generate_products_by_brands')(function(err){
    	callback(err);
    	return;
    });
};

exports.generate_producttags_values = function(callback) {
    require('./generate_producttags_values')(function(err){
    	callback(err);
    	return;
    });
};
