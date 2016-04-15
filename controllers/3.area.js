var services = require('../services');
var AreaService = services.area;

// ==========================================================================
// AREA
// ==========================================================================

// Province
exports.json_province_query = function(req, res, next) {
	AreaService.queryProvince({}, function(err, data){
		if(!data || err){
			if (err)
				console.log('area json_province_query err:' + err);
			res.success({'code':'1001','message':'没有查询到省份'});
			return;
		} else{
			var items = data.items;
			var count = data.count;
			var arr = new Array(count);

			for (var i = 0; i < count; i++) {
				var item = items[i];
				arr[i] = {"id":item.id,"name":item.name,"shortName":item.shortname,"_id":item._id};
			}
			// Return results
			res.respond({'code':'1000','message':'success','datas':{"total":count,"rows":arr}});
			return;
		}
	});
};

// City
exports.json_city_query = function(req, res, next) {
	var options = {};
	if (req.data.areaId || req.data.provinceId)
		options.provinceid = req.data.areaId || req.data.provinceId;

	AreaService.queryCity(options, function(err, data){
		if(!data || err){
			if (err)
				console.log('area json_city_query err:' + err);
			res.respond({'code':'1001','message':'没有查询到城市'});
			return;
		} else{
			var items = data.items;
			var count = data.count;
			var arr = new Array(count);

			for (var i = 0; i < count; i++) {
				var item = items[i];
				arr[i] = {"id":item.id,"name":item.name,"areaId":item.provinceid,"_id":item._id};
			}
			// Return results
			res.respond({'code':'1000','message':'success','datas':{"total":count,"rows":arr}});
			return;
		}
	});
};

// County
exports.json_county_query = function(req, res, next) {
	var options = {};
	if (req.data.areaId || req.data.provinceId)
		options.provinceid = req.data.areaId || req.data.provinceId;
	if (req.data.businessId || req.data.cityId)
		options.cityid = req.data.businessId || req.data.cityId;

	AreaService.queryCounty(options, function(err, data){
		if(!data || err) {
			if (err)
				console.log('area json_county_query err:' + err);
			res.respond({'code':'1001','message':'没有查询到县区'});
			return;
		} else {
			var items = data.items;
			var count = data.count;
			var arr = new Array(count);

			for (var i = 0; i < count; i++) {
				var item = items[i];
				arr[i] = {"id":item.id,"name":item.name,"businessId":item.cityid,"areaId":item.provinceid,"_id":item._id};
			}
			// Return results
			res.respond({'code':'1000','message':'success','datas':{"total":count,"rows":arr}});
			return;
		}
	});
};

// Town
exports.json_town_query = function(req, res, next) {
	var options = {};
	if (req.data.areaId || req.data.provinceId)
		options.provinceid = req.data.areaId || req.data.provinceId;
	if (req.data.businessId || req.data.cityId)
		options.cityid = req.data.businessId || req.data.cityId;
	if (req.data.countyId)
		options.countyid = req.data.countyId;

	AreaService.queryTown(options, function(err, data){
		if(!data || err) {
			if (err)
				console.log('area json_town_query err:' + err);
			res.respond({'code':'1001','message':'没有查询到乡镇'});
			return;
		} else {
			var items = data.items;
			var count = data.count;
			var arr = new Array(count);

			for (var i = 0; i < count; i++) {
				var item = items[i];
				arr[i] = {"id":item.id,"name":item.name,"countyId":item.countyid,"cityId":item.cityid,"provinceId":item.provinceid,"_id":item._id};
			}
			// Return results
			res.respond({'code':'1000','message':'success','datas':{"total":count,"rows":arr}});
			return;
		}
	});
};
