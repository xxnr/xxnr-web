/**
 * Created by zhouxin on 2015/11/29.
 */
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var UseraddressModel = require('../models').useraddress;
var ProvinceModel = require('../models').province;
var CityModel = require('../models').city;
var CountyModel = require('../models').county;
var TownModel = require('../models').town;
var SpecialprovinceModel = require('../models').specialprovince;
var UserModel = require('../models').user;
// var services = require('../services');
// var AreaService = services.area;


// Service
var UseraddressService = function(){};

// Gets listing
UseraddressService.prototype.query = function(options, callback) {

	var queryoptions = {};
	if (options.userid)
		queryoptions.userid = options.userid;
	if (options.type)
		queryoptions.type = options.type;
	var orderbyoptions = {type:1,dateupdated:-1,datecreated:-1};

	// only get the special province
	SpecialprovinceModel.find({}, function(err, docs) {
		var ProvinceIds = [];
		for (var i = 0; i < docs.length; i++) {
			ProvinceIds[i] = docs[i].id;
		}
		if (ProvinceIds && ProvinceIds.length > 0) {
			queryoptions.provinceid = {'$in': ProvinceIds};
		}
		UseraddressModel.find(queryoptions).sort(orderbyoptions).exec(
			function(err, docs) {
				var data = {};

				data.count = docs.length;
				data.items = docs;

				// Returns data
				callback(null, data);
			}
		);
	});
};

// Creates useraddress
UseraddressService.prototype.create = function(options, callback) {

	var count = 0;
	var province = null;
	var city = null;
	var county = null;
	var town = null;

	// Gets a specific document from DB
	UserModel.findOne({id:options.userid}, function(err, user) {
        if (!user || err) {
			callback('user-notfind', {'code':'1001','message':'数据没有查到，未查询到用户'});
			return;
		} else {
            // Gets province
			var POptions = {};
			POptions.id = options.provinceid || '';
			// AreaService.getProvince(POptions, function(err, data) {
			ProvinceModel.findOne(POptions, function (err, data) {
				if (data && !err)
					province = data;
				
				// Gets city
				var COptions = {};
				COptions.id = options.cityid || '';
				// AreaService.getCity(COptions, function(err, data) {
				CityModel.findOne(COptions, function (err, data) {
					if (data && !err)
						city = data;

					// Gets county
					var COptions = {};
					COptions.id = options.countyid || '';
					// AreaService.getCounty(COptions, function(err, data) {
					CountyModel.findOne(COptions, function (err, data) {
						if (data && !err)
							county = data;

						// Gets town
						var TOptions = {};
						TOptions.id = options.townid || '';
						TownModel.findOne(TOptions, function (err, data) {
							if (data && !err)
								town = data;

							if (options.provinceid && !province) {
								callback('error-args', {'code':'1001','message':'数据没有查到，没有找到请求参数中的省份'});
								return;
							}
							if (options.cityid && !city) {
								callback('error-args', {'code':'1001','message':'数据没有查到，没有找到请求参数中的城市'});
								return;
							}
							if (options.countyid && !county) {
								callback('error-args', {'code':'1001','message':'数据没有查到，没有找到请求参数中的县区'});
								return;
							}

							// UseraddressModel.findOne({userid:options.userid}, function(err, doc) {
							// 	if (!doc) {
							// 		options.type = 1;
							// 	}
							
							var model = {};
							model.id = U.GUID(10);
							model.userid = options.userid;
							model.address = options.address;
							if (province) {
								model.provinceid = province.id;
								model.provincename = province.name;
							} else {
								model.provinceid = '';
								model.provincename = '';
							}
							if (city) {
								model.cityid = city.id;
								model.cityname = city.name;
							} else {
								model.cityid = '';
								model.cityname = '';
							}
							if (county) {
								model.countyid = county.id;
								model.countyname = county.name;
							} else {
								model.countyid = '';
								model.countyname = '';
							}
							if (town) {
								model.townid = town.id;
								model.townname = town.name;
							} else {
								model.townid = '';
								model.townname = '';
							}
							model.receiptphone = options.receiptphone;
							model.receiptpeople = options.receiptpeople;
							model.zipcode = options.zipcode;
							model.type = options.type || 2;
							var useraddress = new UseraddressModel(model);
							useraddress.save(function (err) {
				                // Returns response
								callback(err, model);
				            });
					        // });
						}); // get town end
					}); // get county end
				});	// get city end
			}); // get province end
		}
	}); // get user end

};

// Updates useraddress
UseraddressService.prototype.update = function(options, callback) {

	var count = 0;
	var province = {};
	var city = {};
	var county = {};

	var province = null;
	var city = null;
	var county = null;
	var town = null;

	// Gets province
	var POptions = {};
	POptions.id = options.provinceid || '';
	// AreaService.getProvince(POptions, function(err, data) {
	ProvinceModel.findOne(POptions, function (err, data) {
		if (data && !err)
			province = data;
		
		// Gets city
		var COptions = {};
		COptions.id = options.cityid || '';
		// AreaService.getCity(COptions, function(err, data) {
		CityModel.findOne(COptions, function (err, data) {
			if (data && !err)
				city = data;

			// Gets county
			var COptions = {};
			COptions.id = options.countyid || '';
			// AreaService.getCounty(COptions, function(err, data) {
			CountyModel.findOne(COptions, function (err, data) {
				if (data && !err)
					county = data;

				// Gets town
				var TOptions = {};
				TOptions.id = options.townid || '';
				TownModel.findOne(TOptions, function (err, data) {
					if (data && !err)
						town = data;

					if (options.provinceid && !province) {
						callback('error-args', {'code':'1001','message':'数据没有查到，没有找到请求参数中的省份'});
						return;
					}
					if (options.cityid && !city) {
						callback('error-args', {'code':'1001','message':'数据没有查到，没有找到请求参数中的城市'});
						return;
					}
					if (options.countyid && !county) {
						callback('error-args', {'code':'1001','message':'数据没有查到，没有找到请求参数中的县区'});
						return;
					}
					if (options.townid && !town) {
						callback('error-args', {'code':'1001','message':'数据没有查到，没有找到请求参数中的乡镇'});
						return;
					}

					// Updates database file
					var queryoptions = {id:options.id,userid:options.userid};
					var operatoroptions = {
											address: options.address ? options.address : '',
											provinceid: province && province.id ? province.id : '',
											provincename: province && province.name ? province.name : '',
											cityid: city && city.id ? city.id : '',
											cityname: city && city.name ? city.name : '',
											countyid: county && county.id ? county.id : '',
											countyname: county && county.name ? county.name : '',
											townid: town && town.id ? town.id : '',
											townname: town && town.name ? town.name : '',
											dateupdated: new Date(),
					};
					
					if (options.receiptphone)
						operatoroptions.receiptphone = options.receiptphone;
					if (options.receiptpeople)
						operatoroptions.receiptpeople = options.receiptpeople;
					if (options.type)
						operatoroptions.type = options.type;
					if (options.zipcode)
						operatoroptions.zipcode = options.zipcode;
					UseraddressModel.update(queryoptions, {$set:operatoroptions}, function(err, updatedCount) {
						if (err) {
				            callback(err, {'code':'1001','message':'收货地址更新失败'});
				            return;
				        }
						if (updatedCount.n === 0) {
							callback('not get data', {'code':'1001','message':'数据没有查到，未查询到要更新的收货地址'});
							return;
						} else {
							// Returns response
							callback();
						}
					}); // update end
				}); // get town end
			}); // get county end
		}); // get city end	
	}); // get province end
};

// Removes useraddress
UseraddressService.prototype.remove = function(options, callback) {
	
	UseraddressModel.remove({id:options.id,userid:options.userid}, function(err){
		if (err) {
			callback('error-not-data', {'code':'1001','message':'数据没有查到，未查询到要删除的收货地址'});
			return;
		} else {
			// Returns response
			callback();
		}
	});
};

// Get useraddress
UseraddressService.prototype.get = function(options, callback) {
	// options.id {String}

	UseraddressModel.findOne({id:options.id}, function(err, doc) {
		if (doc){
			callback(null, doc);
			return;
		}

		callback('error-404-useraddress');
	});
};

module.exports = new UseraddressService();