// crawl areas

var jsonic=require('jsonic');
var tools=require('./crawl_area_tools.js');
var town_url="https://lsp.wuliu.taobao.com/locationservice/addr/output_address_town_array.do"
//?l1=410000&l2=411400&l3=411426&lang=zh-S&_ksTS=1449549840716_7542&callback=jsonp7543;
var httpHelper = tools.httpHelper;
var p = tools.p;
var c = tools.c;
var provinces = {};
var cities = {};
var counties = {};
var other = {};
var towns = {};
var all_towns = 0;
var pKey = Object.keys(p);

var totaljs = require("../node_modules/total.js");
var ProvinceModel = require('../models').province;
var CityModel = require('../models').city;
var CountyModel = require('../models').county;
var TownModel = require('../models').town;

// province
for (var i = 0; i < pKey.length; i++) {
	var pList = p[pKey[i]];
	for (var j = 0; j < pList.length; j++) {
		var province = pList[j];
		provinces[province[0]] = {'name':province[1][0],'shortName':province[1][2],'nameS':province[1][1],'tid':province[0]};
	}
}
var proKeys = Object.keys(provinces);
console.log('ALL Provinces NUM:' + j);
console.log('ALL Provinces keys:' + proKeys.length);

var city_num = 0;
var county_num = 0;
for (var i = 0; i < c.length; i++) {
	var city = c[i];
	var cid = city[0];
	var cname = city[1];
	var cpid = city[2];
	var t = false;

	for (var x = 0; x < proKeys.length; x++) {
		var _k = proKeys[x];
		if (cpid === _k) {
			var province = provinces[cpid];
			cities[cid] = {'name':cname[0],'nameS':cname[1],'tid':cid,
							'tprovinceid':province['tid'],'province':province['name']
						};
			t = true;
			city_num +=1;
		}
	}
	if (!t) {
		var cityKeys = Object.keys(cities);
		for (var x = 0; x < cityKeys.length; x++) {
			var _k = cityKeys[x];
			if (cpid === _k) {
				var city = cities[cpid];
				if (city.countyNUM) {
					city.countyNUM += 1;
				} else {
					city.countyNUM = 1;
				}
				counties[cid] = {'name':cname[0],'nameS':cname[1],'tid':cid,
								'tcityid':city['tid'],'city':city['name'],
								'tprovinceid':city['tprovinceid'],'province':city['province']
							};
				t = true;
				county_num += 1;
			}
		}
	}
	if (!t) {
		other[cid] = {'name':cname[0],'nameS':cname[1]};
	}
}
console.log('NUM:' + i);
console.log('ALL Cities NUM:' + city_num);
var cityKeys = Object.keys(cities);
console.log('ALL Cities keys:' + cityKeys.length);

// var otherc = tools.otherc;
// for (var i = 0; i < otherc.length; i++) {
// 	var city = otherc[i];
// 	var cid = city[0];
// 	var cname = city[1];
// 	var cpid = city[2];
// 	var type = city[3];
// 	var t = false;

// 	if (cid.search(',') > 0) {
// 		other[cid] = {'name':cname[0],'nameS':cname[1]};
// 		continue
// 	}
// 	if (!t) {
// 		var cityKeys = Object.keys(cities);
// 		for (var x = 0; x < cityKeys.length; x++) {
// 			var _k = cityKeys[x];
// 			if (cpid === _k) {
// 				var city = cities[cpid];
// 				if (city.countyNUM) {
// 					city.countyNUM += 1;
// 				} else {
// 					city.countyNUM = 1;
// 				}
// 				counties[cid + '-' + i] = {'name':cname[0],'nameS':cname[1],'tid':cid,
// 								'tcityid':city['tid'],'city':city['name'],
// 								'tprovinceid':city['tprovinceid'],'province':city['province']
// 							};
// 				t = true;
// 				county_num += 1;
// 			}
// 		}
// 	}
	
// 	if (!t) {
// 		other[cid] = {'name':cname[0],'nameS':cname[1]};
// 	}
// }
// console.log('Other NUM:' + i);
console.log('ALL Counties NUM:' + county_num);
var countyKeys = Object.keys(counties);
console.log('ALL Counties keys:' + countyKeys.length);
var otherKeys = Object.keys(other);
console.log('ALL Other keys:' + otherKeys.length);
if (otherKeys.length > 0 && otherKeys.length < 100) {
	console.log(otherKeys);
}
console.log('---------------------------------------------------------------------------');

// insert_counties(0);
function insert_provinces(i) {
	var proKeys = Object.keys(provinces);
	if (i >= proKeys.length) {
		console.log(i);
		console.log("---------------- INSERT Province END -------------------");
	} else {
		var Pro = provinces[proKeys[i]];
		ProvinceModel.findOne({name:Pro.name}, function(err, province) {
			if (province) {
				if (!province.tid) {
					ProvinceModel.update({id:province.id},
						{$set:{tid:Pro.tid}},
						function (err, count){if (err) console.log(err);}
					);
				}
			} else {
				var p = new ProvinceModel({id:U.GUID(10),tid:Pro.tid,name:Pro.name,uppername:Pro.nameS,shortname:Pro.shortName});
				p.save();
			}
			insert_provinces(i+1);
		});
	}
}

function insert_cities(i) {
	var cityKeys = Object.keys(cities);
	if (i >= cityKeys.length) {
		console.log(i);
		console.log("---------------- INSERT City END -------------------");
	} else {
		var City = cities[cityKeys[i]];
		ProvinceModel.findOne({name:City.province}, function(err, province) {
			if (province) {
				if (!province.tid) {
					ProvinceModel.update({id:province.id},
						{$set:{tid:City.tprovinceid}},
						function (err, count){if (err) console.log(err);}
					);
				}
				CityModel.findOne({name:City.name, provinceid:province.id}, function(err, city) {
					if (city) {
						if (!city.tid) {
							CityModel.update({id:city.id},
								{$set:{tid:City.tid}},
								function (err, count){if (err) console.log(err);}
							);
						}
					} else {
						var c = new CityModel({id:U.GUID(10),tid:City.tid,name:City.name,uppername:City.nameS,provinceid:province.id});
						c.save();
					}
					insert_cities(i+1);
				});
			} else {
				console.log('not find province: ' + City.province);
				insert_cities(i+1);
			}
		});
	}
}
function insert_counties(i) {
	var countyKeys = Object.keys(counties);
	if (i >= countyKeys.length) {
		console.log(i);
		console.log("---------------- INSERT County END -------------------");
	} else {
		var County = counties[countyKeys[i]];
		ProvinceModel.findOne({name:County.province}, function(err, province) {
			if (province) {
				if (!province.tid) {
					ProvinceModel.update({id:province.id},
						{$set:{tid:County.tprovinceid}},
						function (err, count){if (err) console.log(err);}
					);
				}
				CityModel.findOne({name:County.city, provinceid:province.id}, function(err, city) {
					if (city) {
						if (!city.tid) {
							CityModel.update({id:city.id},
								{$set:{tid:County.tcityid}},
								function (err, count){if (err) console.log(err);}
							);
						}
						CountyModel.findOne({name:County.name, cityid:city.id, provinceid:province.id}, function(err, county) {
							if (county) {
								if (!county.tid) {
									CountyModel.update({id:county.id},
										{$set:{tid:County.tid}},
										function (err, count){if (err) console.log(err);}
									);
								}
							} else {
								console.log(i);
								// var c = new CountyModel({id:U.GUID(10),tid:County.tid,name:County.name,uppername:County.nameS,cityid:city.id,provinceid:province.id});
								// c.save();
							}
							insert_counties(i+1);
						});
					} else {
						console.log('not find city: ' + County.city);
						insert_counties(i+1);
					}
				});
			} else {
				console.log('not find province: ' + County.province);
				insert_counties(i+1);
			}
		});
	}
}


// ************************* Town ****************************
// var town_list = [];
// get_towndata(0, counties);
// get_towndata(0, cities);

function get_towndata(i, DATAS) {
	var Keys = Object.keys(DATAS);
	if (i >= Keys.length) {
		console.log(town_list.length);
		// console.log(town_list);
		process_towns(town_list);
	} else {
		var data = DATAS[Keys[i]];
		if (data && data.countyNUM && data.countyNUM > 0) {
			get_towndata(i+1, DATAS);
		} else {
			if (data['city']) {
			    var countyName = data['name'];
			    var cityName = data['city'];
			    var provinceName = data['province'];
			    var l2 = data['tcityid'];
			    var l3 = data['tid'];
			} else {
				var countyName = '';
			    var cityName = data['name'];
			    var provinceName = data['province'];
			    var l2 = data['tid'];
			    var l3 = '';
			}
		    var result = null;
		    //?l1=410000&l2=411400&l3=411426&lang=zh-S&_ksTS=1449549840716_7542&callback=jsonp7543;
		    // if (county['tprovinceid'] === "410000" && county['tcityid'] === "411400" && county['tid'] === '411481') {
		    if (data['tprovinceid'] !== "410000") {
		    	// console.log(provinceName+' - '+cityName+' - '+countyName);
		        var url = town_url + '?l1=' + data['tprovinceid'] + '&l2=' + l2 + '&l3=' + l3 + '&lang=zh-S&_ksTS=1449549840716_7542';
				httpHelper.get(url,30000,function(err,data){    
			        if(err) {
			            console.log('err:' + err);
			        } else {
			        	if (data) {
				        	var regStr = /callback\((.*)\);/gi;
				            var townStr = regStr.exec(data);
				            if (townStr) {
				            	var dataStr = townStr[1];
				            	var dataJson = jsonic(dataStr);
				            	if (dataJson && dataJson.result) {
				            		result = dataJson.result;
				            	}
				            }
				        }

			        }
			        if (result) {
				    	town_list.push({'result':result,'county':countyName,'city':cityName,'province':provinceName,
				    		'tprovinceid':data['tprovinceid'],'tcityid':l2,'tcountyid':l3});	
				    }
				    console.log(town_list.length);
					setTimeout(function() {get_towndata(i+1, DATAS);}, 2000);
			    },'UTF-8');
			} else {
				get_towndata(i+1, DATAS);
			}
		}
	}
}


function process_towns(towndata_list) {
	parse_towns(towndata_list);
	var townKeys = Object.keys(towns);
	console.log('all town:' + townKeys.length);
	insert_towns(0);
}

function parse_towns(towndata_list) {
	for (var i=0; i < towndata_list.length; i++) {
		var townData = towndata_list[i];
		for (var j=0; j < townData['result'].length; j++) {
			// [ '411481219', '陈官庄乡', '411481', 'chen guan zhuang xiang' ]
			var town = townData['result'][j];
			towns[town[0]] = {'name':town[1],'nameCP':town[3],'tid':town[0],
								'county':townData['county'],'tcountyid':townData['tcountyid'],
								'city':townData['city'], 'tcityid':townData['tcityid'],
								'province':townData['province'], 'tprovinceid':townData['tprovinceid']
							};
		}
	}
}

function insert_towns(i) {
	var townKeys = Object.keys(towns);
	if (i >= townKeys.length) {
		console.log(i);
		console.log(all_towns);
		console.log("---------------- END -------------------");
	} else {
		var town = towns[townKeys[i]];
		ProvinceModel.findOne({name:town.province}, function(err, province) {
			if (province) {
				if (!province.tid) {
					console.log(province.name);
					ProvinceModel.update({id:province.id},
						{$set:{tid:town.tprovinceid}},
						function (err, count){if (err) console.log(err);}
					);
				}
				CityModel.findOne({name:town.city, provinceid:province.id}, function(err, city) {
					if (city) {
						if (!city.tid) {
							CityModel.update({id:city.id},
								{$set:{tid:town.tcityid}},
								function (err, count){if (err) console.log(err);}
							);
						}
						if (town.county !== '') {
							CountyModel.findOne({name:town.county, cityid:city.id, provinceid:province.id}, function(err, county) {
								if (county) {
									if (!county.tid) {
										CountyModel.update({id:county.id},
											{$set:{tid:town.tcountyid}},
											function (err, count){if (err) console.log(err);}
										);
									}
									var query = {name:town.name, countyid:county.id, cityid:city.id, provinceid:province.id};
									townSAVE(town, query, i);
								} else {
									insert_towns(i+1);
								}
							});
						} else {
							var query = {name:town.name, cityid:city.id, provinceid:province.id};
							townSAVE(town, query, i);
						}
					} else {
						insert_towns(i+1);
					}
				});
			} else {
				insert_towns(i+1);
			}
		});
	}
}

function townSAVE(town, queryoptions, i) {
	TownModel.findOne(queryoptions, function(err, townD) {
		if (!townD) {
			// console.log(i);
			all_towns += 1;
			var t = {};
			t.id = U.GUID(10);
			t.tid = town.tid;
			t.name = town.name;
			t.chinesepinyin = town.nameCP;
			t.countyid = queryoptions.countyid ? queryoptions.countyid : null;
			t.cityid = queryoptions.cityid ? queryoptions.cityid : null;
			t.provinceid = queryoptions.provinceid ? queryoptions.provinceid : null;
			var townDB = new TownModel(t);
			townDB.save();
			//console.log(t);
		}
		insert_towns(i+1);
	});
}
