/**
 * Created by zhouxin on 2015/11/29.
 */
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var ProvinceModel = require('../models').province;
var CityModel = require('../models').city;
var CountyModel = require('../models').county;
var TownModel = require('../models').town;
var SpecialprovinceModel = require('../models').specialprovince;


// Service
var AreaService = function(){};

// Method
// ==========================================================================
// Province
// ==========================================================================

// Gets listing
AreaService.prototype.queryProvince = function(options, callback) {
	var queryoptions = {};

	// only get the special province
	SpecialprovinceModel.find({}, { __v: 0, tid: 0 }, function(err, docs) {
		var ProvinceNames = [];
		for (var i = 0; i < docs.length; i++) {
			ProvinceNames[i] = docs[i].name;
		}
		if (ProvinceNames && ProvinceNames.length > 0) {
			queryoptions.name = {'$in': ProvinceNames};
		}
		ProvinceModel.find(queryoptions, { __v: 0, tid: 0 }).sort({shortname:1}).exec(
			function (err, docs) {
				if (err) {
	                callback(err);
	                return;
	            }
				var data = {};

				data.count = docs.length;
				data.items = docs;

				// Returns data
				callback(null, data);
			}
		);
	});
};

// Gets a specific Province
AreaService.prototype.getProvince = function(options, callback) {
	// options.id {String}

	var query = options._id ? {_id:options._id} : options.id ? {id:options.id} : options;
	// Gets a specific document from DB
	ProvinceModel.findOne(query, { __v: 0, tid: 0 }, function (err, province) {
		if (!province || err) {
			callback();
			return;
		} else {
			// Returns response
			callback(null, province);
			return;
		}
	});
};

// ==========================================================================
// City
// ==========================================================================

// Gets listing
AreaService.prototype.queryCity = function(options, callback) {
    CityModel.find({provinceid: options.provinceid}, { __v: 0, tid: 0 }, function (err, docs) {
    	if (err) {
            callback(err);
            return;
        }
        var data = {};

        data.count = docs.length;
        data.items = docs;

        // Returns data
        callback(null, data);
    });
};

// Gets a specific City
AreaService.prototype.getCity = function(options, callback) {
	// options.id {String}

	var query = options._id ? {_id:options._id} :{id:options.id};
	// Gets a specific document from DB
	CityModel.findOne(query, { __v: 0, tid: 0 }, function(err, city) {
		if (!city || err) {
			callback();
			return;
		} else {
			// Returns response
			callback(null, city);
			return;
		}
	});
};

// ==========================================================================
// County
// ==========================================================================

// Gets listing
AreaService.prototype.queryCounty = function(options, callback) {
    if ((!options.cityid) && (!options.provinceid)) {
        callback('need cityid or provinceid', []);
    }

    var query={};
    if (options.cityid) {
        query.cityid = options.cityid;
    }
    if (options.provinceid) {
        query.provinceid = options.provinceid;
    }
	CountyModel.find(query, { __v: 0, tid: 0 }, function(err, docs) {
		if (err) {
            callback(err);
            return;
        }
		var data = {};

		data.count = docs.length;
		data.items = docs;

		// Returns data
		callback(null, data);

	});
};

// Gets a specific County
AreaService.prototype.getCounty = function(options, callback) {
	// options.id {String}

	var query = options._id ? {_id:options._id} :{id:options.id};
	// Gets a specific document from DB
	CountyModel.findOne(query, { __v: 0, tid: 0 }, function(err, county) {
		if (!county || err) {
			callback();
			return;
		} else {
			// Returns response
			callback(null, county);
			return;
		}
	});
};

// ==========================================================================
// Town
// ==========================================================================

// Gets listing
AreaService.prototype.queryTown = function(options, callback) {
    if (!options.countyid && !options.cityid && !options.provinceid) {
        callback('need countyid or cityid or provinceid', []);
    }

    var query={};
    if (options.countyid) {
        query.countyid = options.countyid;
    }
    if (options.cityid) {
        query.cityid = options.cityid;
    }
    if (options.provinceid) {
        query.provinceid = options.provinceid;
    }
	TownModel.find(query, { __v: 0, tid: 0 }, function(err, docs) {
		if (err){
            callback(err);
            return;
        }
		var data = {};

		data.count = docs.length;
		data.items = docs;

		// Returns data
		callback(null, data);

	});
};

// Gets a specific Town
AreaService.prototype.getTown = function(options, callback) {
	// options.id {String}

	var query = options._id ? {_id:options._id} :{id:options.id};
	// Gets a specific document from DB
	TownModel.findOne(query, { __v: 0, tid: 0 }, function(err, town) {
		if (!town || err) {
			callback();
			return;
		} else {
			// Returns response
			callback(null, town);
			return;
		}
	});
};

AreaService.prototype.check_address = function(province_id, city_id, county_id, town_id, res, updator, useId){
	var self = this;
	var address = {};
	self.getProvince(useId ? {id:province_id} : {_id: province_id}, function (err, province) {
		if (err || !province) {
			if (err) console.error('get province err:', err);
			res.respond({code: 1001, message: '没有查找到省'});
			return;
		}

		address.province = province;
		self.getCity(useId ? {id:city_id} : {_id: city_id}, function (err, city) {
			if (err || !city) {
				if (err) console.error('get city err:', err);
				res.respond({code: 1001, message: '没有查找到市'});
				return;
			}

			if (city.provinceid != province.id) {
				res.respond({code: 1001, message: '所选城市与省份不匹配，请重新选择'});
				return;
			}

			address.city = city;
			if (county_id) {
				self.getCounty(useId ? {id:county_id} : {_id: county_id}, function (err, county) {
					if (err || !county) {
						if (err) console.error('get county err:', err);
						res.respond({code: 1001, message: '没有查找到区县'});
						return;
					}

					if (county.cityid != city.id) {
						res.respond({code: 1001, message: '所选区县与城市不匹配，请重新选择'});
						return;
					}

					address.county = county;
					self.getTown(useId ? {id:town_id} : {_id: town_id}, function (err, town) {
						if (err || !town) {
							if (err) console.error('get town err:', err);
							res.respond({code: 1001, message: '没有查找到乡镇'});
							return;
						}

						if (town.countyid != county.id) {
							res.respond({code: 1001, message: '所选乡镇与区县不匹配，请重新选择'});
							return;
						}

						address.town = town;
						updator(address);
					})
				})
			} else {
				self.getTown(useId ? {id:town_id} : {_id: town_id}, function (err, town) {
					if (err || !town) {
						if (err) console.error('get town err:', err);
						res.respond({code: 1001, message: '没有查找到乡镇'});
						return;
					}

					if (town.cityid != city.id) {
						res.respond({code: 1001, message: '所选乡镇与城市不匹配，请重新选择'});
						return;
					}

					address.town = town;
					updator(address);
				})
			}
		})
	})
};

module.exports = new AreaService();