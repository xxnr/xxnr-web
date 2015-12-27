var services = require('../services');
var AreaService = services.area;

exports.install = function() {
	// area
	F.route('/api/v2.0/area/getAreaList/', 							json_province_query, ['get', 'post']);
	F.route('/api/v2.0/area/getAreaCity/', 							json_city_query, ['get', 'post']);
	F.route('/api/v2.0/area/getAreaCounty/', 						json_county_query, ['get', 'post']);
	F.route('/api/v2.0/area/getAreaTown/', 							json_town_query, ['get', 'post']);
	// v1.0 name
	F.route('/api/v2.0/businessDistrict/getBusinessByAreaId/', 		json_city_query, ['get', 'post']);
	F.route('/api/v2.0/build/getBuildByBusiness/', 					json_county_query, ['get', 'post']);
	
};

// ==========================================================================
// AREA
// ==========================================================================

// Province
function json_province_query() {
	var self = this;
	var callbackName = self.data['callback'] || 'callback';
	var options = {};

	AreaService.queryProvince(options, function(err, data){
		if(!data || err){
			if (err)
				console.log('area json_province_query err:' + err);
			self.respond({'code':'1001','message':'没有查询到省份'});
			return;
		} else{
			var items = data.items;
			var count = data.count;
			var arr = new Array(count);

			for (var i = 0; i < count; i++) {
				var item = items[i];
				arr[i] = {"id":item.id,"name":item.name,"shortName":item.shortname};
			}
			// Return results
			self.respond({'code':'1000','message':'success','datas':{"total":count,"rows":arr}});
			return;
		}
	});
	
}

// City
function json_city_query() {
	var self = this;
	var callbackName = self.data['callback'] || 'callback';
	var options = {};
	if (self.data.areaId || self.data.provinceId)
		options.provinceid = self.data.areaId || self.data.provinceId;

	AreaService.queryCity(options, function(err, data){
		if(!data || err){
			if (err)
				console.log('area json_city_query err:' + err);
			self.respond({'code':'1001','message':'没有查询到城市'});
			return;
		} else{
			var items = data.items;
			var count = data.count;
			var arr = new Array(count);

			for (var i = 0; i < count; i++) {
				var item = items[i];
				arr[i] = {"id":item.id,"name":item.name,"areaId":item.provinceid};
			}
			// Return results
			self.respond({'code':'1000','message':'success','datas':{"total":count,"rows":arr}});
			return;
		}
	});
}

// County
function json_county_query() {
	var self = this;
	var callbackName = self.data['callback'] || 'callback';
	var options = {};
	if (self.data.areaId || self.data.provinceId)
		options.provinceid = self.data.areaId || self.data.provinceId;
	if (self.data.businessId || self.data.cityId)
		options.cityid = self.data.businessId || self.data.cityId;

	AreaService.queryCounty(options, function(err, data){
		if(!data || err) {
			if (err)
				console.log('area json_county_query err:' + err);
			self.respond({'code':'1001','message':'没有查询到县区'});
			return;
		} else {
			var items = data.items;
			var count = data.count;
			var arr = new Array(count);

			for (var i = 0; i < count; i++) {
				var item = items[i];
				arr[i] = {"id":item.id,"name":item.name,"businessId":item.cityid,"areaId":item.provinceid};
			}
			// Return results
			self.respond({'code':'1000','message':'success','datas':{"total":count,"rows":arr}});
			return;
		}
	});
}

// Town
function json_town_query() {
	var self = this;
	var callbackName = self.data['callback'] || 'callback';
	var options = {};
	if (self.data.areaId || self.data.provinceId)
		options.provinceid = self.data.areaId || self.data.provinceId;
	if (self.data.businessId || self.data.cityId)
		options.cityid = self.data.businessId || self.data.cityId;
	if (self.data.countyId)
		options.countyid = self.data.countyId;

	AreaService.queryTown(options, function(err, data){
		if(!data || err) {
			if (err)
				console.log('area json_town_query err:' + err);
			self.respond({'code':'1001','message':'没有查询到乡镇'});
			return;
		} else {
			var items = data.items;
			var count = data.count;
			var arr = new Array(count);

			for (var i = 0; i < count; i++) {
				var item = items[i];
				arr[i] = {"id":item.id,"name":item.name,"countyId":item.countyid,"cityId":item.cityid,"provinceId":item.provinceid};
			}
			// Return results
			self.respond({'code':'1000','message':'success','datas':{"total":count,"rows":arr}});
			return;
		}
	});
}
