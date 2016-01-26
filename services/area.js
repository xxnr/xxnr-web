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
	SpecialprovinceModel.find({}, { _id: 0, __v: 0, tid: 0 }, function(err, docs) {
		var ProvinceIds = [];
		for (var i = 0; i < docs.length; i++) {
			ProvinceIds[i] = docs[i].id;
		}
		if (ProvinceIds && ProvinceIds.length > 0) {
			queryoptions.id = {'$in': ProvinceIds};
		}
		ProvinceModel.find(queryoptions, { _id: 0, __v: 0, tid: 0 }).sort({shortname:1}).exec(
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

	// Gets a specific document from DB
	ProvinceModel.findOne({id:options.id}, { __v: 0, tid: 0 }, function (err, province) {
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
    CityModel.find({provinceid: options.provinceid}, { _id: 0, __v: 0, tid: 0 }, function (err, docs) {
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

	// Gets a specific document from DB
	CityModel.findOne({id:options.id}, { __v: 0, tid: 0 }, function(err, city) {
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
	CountyModel.find(query, { _id: 0, __v: 0, tid: 0 }, function(err, docs) {
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

	// Gets a specific document from DB
	CountyModel.findOne({id:options.id}, { __v: 0, tid: 0 }, function(err, county) {
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
	TownModel.find(query, { _id: 0, __v: 0, tid: 0 }, function(err, docs) {
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

	// Gets a specific document from DB
	TownModel.findOne({id:options.id}, { __v: 0, tid: 0 }, function(err, town) {
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

module.exports = new AreaService();