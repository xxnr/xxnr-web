var Useraddress = NEWSCHEMA('Useraddress');
Useraddress.define('id', String);					// ID
Useraddress.define('userid', String, true);			// 用户ID
Useraddress.define('address', String, true);		// 地址信息
Useraddress.define('provincename', String, true);	// 所属省Name
Useraddress.define('provinceid', String, true);		// 所属省ID
Useraddress.define('cityname', String, true);		// 所属市Name
Useraddress.define('cityid', String, true);			// 所属市ID
Useraddress.define('countyname', String, true);		// 所属县地区Name
Useraddress.define('countyid', String, true);		// 所属省县地区ID
Useraddress.define('receiptpeople', String, true);	// 收货人
Useraddress.define('receiptphone', String, true);	// 收货人手机号
Useraddress.define('type', Number);				// 1.默认 2.非默认 
Useraddress.define('datecreated', Date);			// 创建时间
Useraddress.define('dateupdated', Date);			// 更新时间

// Sets default values
Useraddress.setDefault(function(name) {
	switch (name) {
		case 'datecreated':
			return new Date().format('yyyy-MM-dd hh:mm:ss');
		case 'dateupdated':
			return new Date().format('yyyy-MM-dd hh:mm:ss');
	}
});


// Gets listing
Useraddress.setQuery(function(error, options, callback) {

	// Filtering documents
	var filter = function(doc) {
		if (options.userid && doc.userid !== options.userid)
			return;
		if (options.type && doc.type !== options.type)
			return;
		return doc;
	};

	// Sorting documents
	var sorting = function(a, b) {
		if (a.type !== 1)
			return 1;
		if (b.type !== 1)
			return -1;

		if (new Date(a.datecreated) > new Date(b.datecreated))
			return 1;
		return -1;
	};

	DB('useraddresses').sort(filter, sorting, function(err, docs, count) {
		var data = {};

		data.count = count;
		data.items = docs;

		// Returns data
		callback(data);

	});
});

// Creates useraddress
Useraddress.addWorkflow('create', function(error, model, options, callback) {

	var count = 0;
	var province = null;
	var city = null;
	var county = null;

	// Filter for reading
	var filter = function(doc) {
		if (options.userid && doc.id === options.userid)
			return doc;
		return;
	};

	// Gets a specific document from DB
	DB('users').one(filter, function(err, user) {
		if (!user || err) {
			error.add('user-notfind');
			callback({'code':'1001','message':'数据没有查到，未查询到用户'});
			return;
		} else {
			// Gets province
			var POptions = {};
			POptions.id = options.provinceid || '';
			GETSCHEMA('Province').get(POptions, function(err, data) {
				province = data;
				
				// Gets city
				var COptions = {};
				COptions.id = options.cityid || '';
				GETSCHEMA('City').get(COptions, function(err, data) {
					city = data;

					// Gets county
					var COptions = {};
					COptions.id = options.countyid || '';
					GETSCHEMA('County').get(COptions, function(err, data) {
						county = data;

						if (options.provinceid && !province) {
							error.add('error-args');
							callback({'code':'1001','message':'数据没有查到，没有找到请求参数中的省份'});
							return;
						}
						if (options.cityid && !city) {
							error.add('error-args');
							callback({'code':'1001','message':'数据没有查到，没有找到请求参数中的城市'});
							return;
						}
						if (options.countyid && !county) {
							error.add('error-args');
							callback({'code':'1001','message':'数据没有查到，没有找到请求参数中的县区'});
							return;
						}

						// Filtering documents
						var filter = function(doc) {
							if (options.userid && doc.userid !== options.userid)
								return;
							return doc;
						};

						DB('useraddresses').one(filter, function(err, doc) {
							if (!doc) {
								options.type = 1;
							}
						
							var model = GETSCHEMA('Useraddress').create();
							model.id = U.GUID(10);
							model.userid = options.userid;
							model.address = options.address;
							if (province) {
								model.provinceid = province.id;
								model.provincename = province.name;
							}
							if (city) {
								model.cityid = city.id;
								model.cityname = city.name;
							}
							if (county) {
								model.countyid = county.id;
								model.countyname = county.name;
							}
							model.receiptphone = options.receiptphone;
							model.receiptpeople = options.receiptpeople;
							model.type = options.type;
							DB('useraddresses').insert(model);

							// Returns response
							callback(model);
						});
					}); // get county end
				});	// get city end
			}); // get province end
		}
	}); // get user end

});

// Updates useraddress
Useraddress.addWorkflow('update', function(error, model, options, callback) {

	var count = 0;
	var province = {};
	var city = {};
	var county = {};

	var province = null;
	var city = null;
	var county = null;

	// Gets province
	var POptions = {};
	POptions.id = options.provinceid || '';
	GETSCHEMA('Province').get(POptions, function(err, data) {
		province = data;
		
		// Gets city
		var COptions = {};
		COptions.id = options.cityid || '';
		GETSCHEMA('City').get(COptions, function(err, data) {
			city = data;

			// Gets county
			var COptions = {};
			COptions.id = options.countyid || '';
			GETSCHEMA('County').get(COptions, function(err, data) {
				county = data;

				if (options.provinceid && !province) {
					error.add('error-args');
					callback({'code':'1001','message':'数据没有查到，没有找到请求参数中的省份'});
					return;
				}
				if (options.cityid && !city) {
					error.add('error-args');
					callback({'code':'1001','message':'数据没有查到，没有找到请求参数中的城市'});
					return;
				}
				if (options.countyid && !county) {
					error.add('error-args');
					callback({'code':'1001','message':'数据没有查到，没有找到请求参数中的县区'});
					return;
				}
				
				// Filter for updating
				var updater = function(doc) {

					if (doc.id !== options.id || doc.userid !== options.userid)
						return doc;
					
					count++;

					if (options.address)
						doc.address = options.address;
					if (options.provinceid) {
						doc.provinceid = province.id;
						doc.provincename = province.name;
					}
					if (options.cityid) {
						doc.cityid = city.id;
						doc.cityname = city.name;
					}
					if (options.countyid) {
						doc.countyid = county.id;
						doc.countyname = county.name;
					}
					if (options.receiptphone)
						doc.receiptphone = options.receiptphone;
					if (options.receiptpeople)
						doc.receiptpeople = options.receiptpeople;
					if (options.type)
						doc.type = options.type;
					doc.dateupdated = (new Date()).format('yyyy-MM-dd hh:mm:ss');
					return doc;
				};

				// Updates database file
				DB('useraddresses').update(updater, function() {
					// Not find record
					if (count === 0) {
						error.add('error-not-data');
						callback({'code':'1001','message':'数据没有查到，未查询到要更新的收货地址'});
						return;
					} else {
						// Returns response
						callback();
					}
				}); // update end
			}); // get county end
		}); // get city end	
	}); // get province end
});

// Removes useraddress
Useraddress.setRemove(function(error, options, callback) {

	var count = 0;

	// Filter for removing
	var updater = function(doc) {
		if (doc.id !== options.id || doc.userid !== options.userid)
			return doc;
		count++;
		return null;
	};

	// Updates database file
	DB('useraddresses').update(updater,  function() {
		// Not find record
		if (count === 0) {
			error.add('error-not-data');
			callback({'code':'1001','message':'数据没有查到，未查询到要删除的收货地址'});
			return;
		} else {
			// Returns response
			callback();
		}
	});
});

Useraddress.setGet(function(error, model, options, callback) {
	// options.id {String}

	// Filter for reading
	var filter = function(doc) {
		if (options.id && doc.id !== options.id)
			return;

		return doc;
	};

	// Gets a specific document from DB
	DB('useraddresses').one(filter, function(err, doc) {
		if (doc){
			callback(doc);
			return;
		}

		error.push('error-404-useraddress');
		callback();
	});
});
