exports.install = function() {
	// area
	F.route('/app/area/getAreaList/', 							json_province_query);
	F.route('/app/businessDistrict/getBusinessByAreaId/', 		json_city_query);
	F.route('/app/build/getBuildByBusiness/', 					json_county_query);
};

// ==========================================================================
// AREA
// ==========================================================================

// Province
//http://127.0.0.1:3000/app/area/getAreaList?callback=angular.callbacks._3&locationUserId=290583a6fd3140a3a99bf155e53d890e&methodname=app%2Farea%2FgetAreaList
function json_province_query() {
	var self = this;
	var callbackName = this.query['callback'] || 'callback';
	var locationUserId = this.query['locationUserId'] || '';

	GETSCHEMA('Province').query(null, function(err, data){
		if(!data || err){
			self.jsonp(callbackName, {'code':'1001','message':'没有查询到省份'});
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
			self.jsonp(callbackName, {'code':'1000','message':'success','datas':{"total":count,"rows":arr,"locationUserId":locationUserId}});
			return;
		}
	});
	
}

// City
//http://127.0.0.1:3000/app/businessDistrict/getBusinessByAreaId?callback=angular.callbacks._3&locationUserId=290583a6fd3140a3a99bf155e53d890e&methodname=app%2FbusinessDistrict%2FgetBusinessByAreaId&areaId=0b150a29a8684c359759dce63e7b59c2
function json_city_query() {
	var self = this;
	var callbackName = this.query['callback'] || 'callback';
	var locationUserId = this.query['locationUserId'] || '';
	var options = {};
	if (this.query.areaId)
		options.provinceid = this.query.areaId

	GETSCHEMA('City').query(options, function(err, data){
		if(!data || err){
			self.jsonp(callbackName, {'code':'1001','message':'没有查询到城市'});
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
			self.jsonp(callbackName, {'code':'1000','message':'success','datas':{"total":count,"rows":arr,"locationUserId":locationUserId}});
			return;
		}
	});
}

// County
//http://127.0.0.1:3000/app/build/getBuildByBusiness?callback=angular.callbacks._3&locationUserId=290583a6fd3140a3a99bf155e53d890e&methodname=app%2Fbuild%2FgetBuildByBusiness&businessId=14eb710ccdca90d37c6a90534f9039e9
function json_county_query() {
	var self = this;
	var callbackName = this.query['callback'] || 'callback';
	var locationUserId = this.query['locationUserId'] || '';
	var options = {};
	if (this.query.areaId)
		options.provinceid = this.query.areaId
	if (this.query.businessId)
		options.cityid = this.query.businessId

	GETSCHEMA('County').query(options, function(err, data){
		if(!data || err){
			self.jsonp(callbackName, {'code':'1001','message':'没有查询到县区'});
			return;
		} else{
			var items = data.items;
			var count = data.count;
			var arr = new Array(count);

			for (var i = 0; i < count; i++) {
				var item = items[i];
				arr[i] = {"id":item.id,"name":item.name,"businessId":item.cityid,"areaId":item.provinceid};
			}
			// Return results
			self.jsonp(callbackName, {'code':'1000','message':'success','datas':{"total":count,"rows":arr,"locationUserId":locationUserId}});
			return;
		}
	});
}
