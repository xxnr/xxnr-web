/**
 * Created by pepelu on 2016/6/2.
 */
var models = require('../../../models');
var ProvinceModel = models.province;
var CityModel = models.city;
var CountyModel = models.county;
var TownModel = models.town;

exports.get_address_by_name = function(province, city, county, town, callback){
    var promises = [];
    var address = {};
    if(province){
        promises.push(new Promise(function(resolve, reject){
            ProvinceModel.findOne({name:province},function(err, province){
                if(err){
                    reject(err);
                    return;
                }

                address.province = province.toObject();
                address.province._id = address.province._id.toString();
                resolve()
            })
        }));
    }

    if(city){
        promises.push(new Promise(function(resolve, reject){
            CityModel.findOne({name:city},function(err, city){
                if(err){
                    reject(err);
                    return;
                }

                address.city = city.toObject();
                address.city._id = address.city._id.toString();
                resolve()
            })
        }));
    }

    if(county){
        promises.push(new Promise(function(resolve, reject){
            CountyModel.findOne({name:county},function(err, county){
                if(err){
                    reject(err);
                    return;
                }

                address.county = county.toObject();
                address.county._id = address.county._id.toString();
                resolve()
            })
        }));
    }

    if(town){
        promises.push(new Promise(function(resolve, reject){
            TownModel.findOne({name:town},function(err, town){
                if(err){
                    reject(err);
                    return;
                }

                address.town = town.toObject();
                address.town._id = address.town._id.toString();
                resolve()
            })
        }));
    }

    Promise.all(promises)
        .then(function(){
            callback(null, address);
        })
        .catch(function(err){
            callback(err);
        })
};