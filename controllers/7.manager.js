var services = require('../services');
var BackEndUserService = services.backenduser;
var tools = require('../common/tools');
var bcrypt = require('bcrypt-nodejs');
var REG_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|IOS/i;
var UserService = services.user;
var AuthService = services.auth;
var OrderService = services.order;
var ProductService = services.product;
var NewsService = services.news;
var SKUService = services.SKU;
var BrandService = services.brand;
var CategoryService = services.category;
var PotentialCustomerService = services.potential_customer;
var AuditlogService = services.auditservice;
var PayService = services.pay;
var AreaService = services.area;
var RSCService = services.RSC;
var AgentService = services.agent;
var DashboardService = services.dashboard;
var LoyaltypointService = services.loyaltypoint;
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;
var DELIVERYTYPENAME = require('../common/defs').DELIVERYTYPENAME;
var OFFLINEPAYTYPE = require('../common/defs').OFFLINEPAYTYPE;
var DELIVERYTYPE =  require('../common/defs').DELIVERYTYPE;
var config = require('../config');
var path = require('path');

exports.install = function() {
	// Auto-localize static HTML templates
	F.localize('All templates', '/templates/');

	// COMMON
	//F.route(CONFIG('manager-url') + '/*', 									'~manager', ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/upload/',                  			upload, ['post', 'upload'], 3084, ['backend_auth']); // 3 MB
	F.route(CONFIG('manager-url') + '/upload/base64/',           			upload_base64, ['post'], 2048, ['backend_auth']); // 2 MB
	// AREA
	//F.route(CONFIG('manager-url') + '/api/area/getProvinceList/',			json_province_query, ['get', 'post'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/area/getCityList/',				json_city_query, ['get', 'post'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/area/getCountyList/',				json_county_query, ['get', 'post'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/area/getTownList/',				json_town_query, ['get', 'post'], ['backend_auth']);

	// Products UPLOAD IMAGE
	//F.route(CONFIG('manager-url') + '/products/uploadImage/',    			CKEditor_uploadImage, ['post', 'upload'], 20480, ['backend_auth']); // 20 MB

	// News UPLOAD IMAGE
	//F.route(CONFIG('manager-url') + '/news/uploadImage/',    				CKEditor_uploadImage, ['post', 'upload'], 20480, ['backend_auth']); // 20 MB

	// FILES
	// // F.route(CONFIG('manager-url') + '/api/files/clear/',         			json_files_clear, ['get'], ['backend_auth']);

	// DASHBOARD
	// F.route(CONFIG('manager-url') + '/api/dashboard/',           			json_dashboard, ['get'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/dashboard/online/',    			json_dashboard_online, ['get'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/dashboard/clear/',     			json_dashboard_clear);

	// ORDERS
	//F.route(CONFIG('manager-url') + '/api/orders/',              			json_orders_query, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/orders/{id}/',         			json_orders_read, ['get'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/orders/payments/',              	json_orders_payments_update, ['put'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/orders/subOrders/',              	json_subOrders_payments_update, ['put'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/orders/products/',              	json_orders_products_update, ['put'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/orders/SKUs/',              		json_orders_SKUs_update, ['put'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/orders/SKUsDelivery/',            json_orders_SKUs_delivery, ['put'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/orders/RSCInfo/',					process_orders_RSCInfo_update, ['put'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/orders/confirmOfflinePay',    	process_order_confirm_OfflinePay, ['post'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/getOfflinePayType',          json_offline_pay_type, ['get'], ['backend_auth']);

	// F.route(CONFIG('manager-url') + '/api/orders/',              			json_orders_save, ['put'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/orders/',              			json_orders_remove, ['delete']);
	// F.route(CONFIG('manager-url') + '/api/orders/clear/',        			json_orders_clear);

	// USERS
	//F.route(CONFIG('manager-url') + '/api/users/',              			json_users_query, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/users/{id}/',         			json_users_read, ['get'], ['backend_auth']);
    //F.route(CONFIG('manager-url') + '/api/users/',              			json_users_save, ['put'], ['backend_auth', 'auditing']);
	// F.route(CONFIG('manager-url') + '/api/users/',              			json_users_remove, ['delete']);
	// F.route(CONFIG('manager-url') + '/api/users/clear/',        			json_users_clear);

	// BRANDS
	//F.route(CONFIG('manager-url') + '/api/brands/',							json_brands,	['get'],['backend_auth']);

	// PRODUCTS
	//F.route(CONFIG('manager-url') + '/api/products/',            			json_products_query, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/products/',            			json_products_save, ['post'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/products/updateStatus',			process_products_updateStatus, ['post'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/products/{id}/',       			json_products_read, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/products/',            			json_products_remove, ['delete'], ['backend_auth', 'auditing']);
	// // F.route(CONFIG('manager-url') + '/api/products/clear/',      			json_products_clear);
	// // F.route(CONFIG('manager-url') + '/api/products/import/',     			json_products_import, ['upload'], 1024, ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/products/categories/', 			json_products_categories, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/products/category/',   			json_products_category_replace, ['post'] ,['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/products/attr/{attributeName}/',	json_products_attribute, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/products/attribute/add',			process_product_attributes_add,	['post'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/products/attributes/',			json_products_attributes, ['get'], ['backend_auth']);

	// NEWS
	//F.route(CONFIG('manager-url') + '/api/news/',            				json_news_query, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/news/',            				json_news_save, ['post'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/news/{id}/',       				json_news_read, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/news/updatestatus/',            	json_news_updatestatus, ['post'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/news/',            				json_news_remove, ['delete'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/news/categories/', 				json_news_categories, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/news/category/',   				json_news_category_replace, ['post'], ['backend_auth', 'auditing']);

	// Audit logs
	//F.route(CONFIG('manager-url') + '/api/auditlogs/',            			json_auditlog_query, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/auditlogs/{id}/',       			json_auditlog_read, ['get'], ['backend_auth']);

	// PAGES
	F.route(CONFIG('manager-url') + '/api/pages/',               			json_pages_query, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/pages/',               			json_pages_save, ['post', '*Page'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/pages/',               			json_pages_remove, ['delete'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/pages/{id}/',          			json_pages_read, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/pages/preview/',       			view_pages_preview, ['json'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/pages/dependencies/',  			json_pages_dependencies, ['get'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/pages/clear/',         			json_pages_clear);
	F.route(CONFIG('manager-url') + '/api/pages/sitemap/',       			json_pages_sitemap, ['get'], ['backend_auth']);

	// WIDGETS
	F.route(CONFIG('manager-url') + '/api/widgets/',             			json_widgets_query, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/widgets/',             			json_widgets_save, ['post', '*Widget'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/widgets/',             			json_widgets_remove, ['delete'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/widgets/{id}/',        			json_widgets_read, ['get'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/widgets/clear/',       			json_widgets_clear);

	// NEWSLETTER
	// F.route(CONFIG('manager-url') + '/api/newsletter/',          			json_newsletter, ['get'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/newsletter/csv/',      			file_newsletter, ['get'], ['backend_auth']);
	// // F.route(CONFIG('manager-url') + '/api/newsletter/clear/',    			json_newsletter_clear);

	// SETTINGS
	F.route(CONFIG('manager-url') + '/api/settings/',            			json_settings, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/settings/',            			json_settings_save, ['put', '*Settings'], ['backend_auth']);

	// SYSTEM
	// F.route(CONFIG('manager-url') + '/api/backup/website/',      			file_backup_website, [15000], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/backup/database/',     			file_backup_database, ['get'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/restore/database/',    			file_restore_database, ['upload', 15000], 20000, ['backend_auth']);

    // backend user
    //F.route(CONFIG('manager-url') + '/api/login/',                          process_login, ['post'], ['auditing']);
    //F.route(CONFIG('manager-url') + '/api/backend/user/create/',            process_createUser, ['post'], ['backend_auth', 'auditing']);
    //F.route(CONFIG('manager-url') + '/api/backend/users',                   json_be_users, ['get'], ['backend_auth']);
    //F.route(CONFIG('manager-url') + '/api/backend/user/password/modify',    process_modify_password, ['post'], ['auditing']);
    //F.route(CONFIG('manager-url') + '/api/backend/users/',                  json_be_users_update, ['post'], ['backend_auth', 'auditing']);

    // permission
    //F.route(CONFIG('manager-url') + '/api/permissions/',                    json_permissions, ['get'], ['backend_auth']);

    // role
    //F.route(CONFIG('manager-url') + '/api/roles/',                          json_roles, ['get'], ['backend_auth']);

    // business
    //F.route(CONFIG('manager-url') + '/api/businesses/',                     json_businesses,['get'], ['backend_auth']);

	// SKU
	//F.route(CONFIG('manager-url') + '/api/v2.1/SKU/add/',               	process_SKU_add,                ['post'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/v2.1/SKU/update/{id}',        	process_SKU_update,             ['post'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/v2.1/SKU/attribute/add/',     	process_SKU_Attribute_add,      ['post'], ['backend_auth', 'auditing']);
	//F.route(CONFIG('manager-url') + '/api/v2.1/SKU/attributes',         	json_SKU_Attributes_get,        ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/v2.1/SKU/query',					json_SKU_get,					['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/v2.1/SKU/online/{id}',			process_SKU_online,				['get'], ['backend_auth']);

	//F.route(CONFIG('manager-url') + '/api/v2.1/SKU/additions',				json_SKU_Additions_get,		['get'],['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/v2.1/SKU/addition/add',			process_SKU_Addition_add,	['post'],['backend_auth', 'auditing']);

	// potential customer
	//F.route(CONFIG('manager-url') + '/api/v2.1/potentialCustomer/query',	json_potential_customer_query,	['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/v2.1/potentialCustomer/{_id}',	json_potential_customer_get, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/v2.1/agentinfo/{_id}',			json_agent_info_get, ['get'], ['backend_auth']);

	// RSC
	//F.route(CONFIG('manager-url') + '/api/v2.2/RSCInfo/{_id}',				json_RSC_info_get, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/v2.2/RSCs',						json_RSC_query, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/v2.2/RSC/modify',					process_RSC_modify, ['put'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/v2.2/RSC/queryByProducts',		json_RSC_query_by_products,['get'],['backend_auth']);
	// RSC orders
	//F.route(CONFIG('manager-url') + '/api/v2.2/RSC/orders/',              	json_RSCorders_query, ['get'], ['backend_auth']);

	// pay refund
	//F.route(CONFIG('manager-url') + '/api/payrefunds/',            			json_payrefund_query, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/payrefunds/{id}/',       			json_payrefund_read, ['get'], ['backend_auth']);
	//F.route(CONFIG('manager-url') + '/api/payrefunds/refundsubmit/',       	json_payrefund_update, ['put'], ['backend_auth', 'auditing']);

};

var files = DB('files', null, require('../modules/database/database').BUILT_IN_DB).binary;
var moment = require('moment');

// ==========================================================================
// rewardshop
// ==========================================================================

// pages
exports.rewardshop = function(req, res, next) {
	res.render(path.join(__dirname, '../views/7.manager/rewardshop/manager-rewardshop'),
		{}
	);
}

exports.rewardshop_gifts = function(req, res, next) {
	res.render(path.join(__dirname, '../views/7.manager/rewardshop/manager-gifts'),
		{
			manager_url:F.config['manager-url'],
			page:'manager-gifts'
		}
	);
}

exports.rewardshop_gifts_detail = function(req, res, next) {
	res.render(path.join(__dirname, '../views/7.manager/rewardshop/manager-gifts-detail'),
		{
			manager_url:F.config['manager-url'],
			page:'manager-gifts-detail'
		}
	);
}


// apis
exports.json_rewardshop_categories = function(req, res, next) {
	LoyaltypointService.queryRewardshopGiftCategories(req.data.search, function(err, categories) {
		if (err) {
			res.respond({code:1002, message:'获取礼品类目失败'});
			return;
		}

		res.respond({code:1000, message:'success', categories:categories});
	});
}

exports.json_rewardshop_category_save = function(req, res, next) {
	LoyaltypointService.getRewardshopGiftCategory(null, req.data.category, function(err, category) {
		if (err) {
			res.respond({code:1002, message:'保存礼品类目失败'});
			return;
		}
		if (category) {
			res.respond({code:1001, message:'新添加的礼品类目已存在'});
			return;
		}
		LoyaltypointService.createRewardshopGiftCategory(req.data.category, function(err, category) {
			if (err) {
				res.respond({code:1002, message:'保存礼品类目失败'});
				return;
			}

			res.respond({code:1000, message:'success', category:category});
		});
	});
}

exports.json_rewardshop_gift_save = function(req, res, next) {
	if (!req.data.name) {
		res.respond({code:1001, message:'请填写礼品名称'});
		return;
	}
	if (!req.data.category) {
		res.respond({code:1001, message:'请选择礼品类目'});
		return;
	}
	if (!req.data.points) {
		res.respond({code:1001, message:'请填写礼品所需积分'});
		return;
	}

	LoyaltypointService.getRewardshopGift(null, req.data.name, function(err, gift) {
		if (err) {
			res.respond({code:1002, message:'获取礼品详情失败'});
			return;
		}
		if (gift) {
			res.respond({code:1001, message:'新添加的礼品已存在'});
			return;
		}
		LoyaltypointService.createRewardshopGift(req.data, function(err, gift) {
			if (err) {
				res.respond({code:1002, message:'保存礼品失败'});
				return;
			}

			res.respond({code:1000, message:'success', gift:gift});
		});
	});
}

exports.json_rewardshop_gift_update = function(req, res, next) {
	if (!req.data._id) {
		res.respond({code:1001, message:'请填写礼品ID'});
		return;
	}

	LoyaltypointService.getRewardshopGift(req.data._id, null, function(err, gift) {
		if (err || !gift) {
			res.respond({code:1002, message:'获取礼品详情失败'});
			return;
		}
		LoyaltypointService.updateRewardshopGift(req.data, function(err, gift) {
			if (err) {
				res.respond({code:1002, message:'更新礼品失败'});
				return;
			}

			res.respond({code:1000, message:'success', gift:gift});
		});
	});
}

exports.json_rewardshop_gifts = function(req, res, next) {
	var page = U.parseInt(req.data.page, 1) - 1;
	var max = U.parseInt(req.data.max, 20);
	LoyaltypointService.queryRewardshopGifts(page, max, req.data.type, req.data.category, req.data.search, function(err, gifts, count, pageCount) {
		if (err) {
			res.respond({code:1002, message:'获取礼品列表失败'});
			return;
		}

		res.respond({code:1000, message:'success', gifts:gifts, count:count, pageCount:pageCount, page:page+1});
	});
}

exports.json_rewardshop_gift_get = function(req, res, next) {
	LoyaltypointService.getRewardshopGift(req.params._id, null, function(err, gift) {
		if (err || !gift) {
			res.respond({code:1002, message:'获取礼品详情失败'});
			return;
		}

		var result = gift;
		if (result) {
			if (result.category)
				result.category = result.category.ref;
		}
		res.respond({code:1000, message:'success', gift:result});
	});
}


// ==========================================================================
// COMMON
// ==========================================================================

// admin manager page render
exports.manager = function(req, res, next){
	res.render(path.join(__dirname, '../views/manager'),
		{
			manager_url:F.config['manager-url'],
			user_types:F.config['user_types'],
			currency_entity:F.config['currency_entity'],
			user:req.user,
			version:F.config['version'],
			author:F.config['author']
		}
	);
};

// CKEditor Upload picture
exports.CKEditor_uploadImage = function(req, res, next) {
	var CKEditorFuncNum = req.query["CKEditorFuncNum"];
	var id = '';
	var default_extension = '.jpg';
	var type_avail = ['png', 'jpg', "jpeg"];

	req.files.forEach(function (file) {
		// Store current file into the HDD
		var index = file.originalname.lastIndexOf('.');
		var extension = file.originalname.substring(index + 1);
		if (type_avail.find(extension.toLowerCase())) {
			if (file.size <= 2 * 1024 * 1024) {
				id = files.insert(file.originalname, file.mimetype, file.buffer) + default_extension;
				var imageurl = "/images/original/" + id;
				var options = {'callback': CKEditorFuncNum, 'imageurl': imageurl, 'message': ''};
				res.render(path.join(__dirname, '../views/7.manager/uploadImageResponse'), options);
			} else {
				var options = {'callback': CKEditorFuncNum, 'imageurl': '', 'message': '文件大小不得大于2M'};
				res.render(path.join(__dirname, '../views/7.manager/uploadImageResponse'), options);
			}
		} else {
			var options = {'callback': CKEditorFuncNum, 'imageurl': '', 'message': '文件格式不正确（必须为.jpg/.png文件）'};
			res.render(path.join(__dirname, '../views/7.manager/uploadImageResponse'), options);
		}
	});
};

// Upload (multiple) pictures
exports.upload = function(req, res, next) {
	var id = [];

	req.files.forEach(function (file) {
		// Store current file into the HDD
		var index = file.originalname.lastIndexOf('.');
		var extension = file.originalname.substring(index + 1);

		if (index === -1)
			extension = '.dat';
		else
			extension = file.originalname.substring(index);

		id.push(files.insert(file.originalname, file.mimetype, file.buffer) + extension);
	});

	res.json(id);
};

// Upload base64
function upload_base64() {
	var self = this;

	if (!req.body.file) {
		res.json(null);
		return;
	}

	var type = req.body.file.base64ContentType();
	var data = req.body.file.base64ToBuffer();
	var id = files.insert('unknown', type, data);

	switch (type) {
		case 'image/png':
			id += '.png';
			break;
		case 'image/jpeg':
			id += '.jpg';
			break;
		case 'image/gif':
			id += '.gif';
			break;
	}

	res.json('/download/' + id);
}

// ==========================================================================
// AREA
// ==========================================================================
// Province
exports.json_province_query = function(req, res, next) {
	var options = {};

	AreaService.queryProvince(options, function(err, data){
		if(!data || err){
			if (err)
				console.log('area json_province_query err:' + err);
			res.respond({'code':'1001','message':'没有查询到省份'});
			return;
		} else{
			res.respond({'code':'1000','message':'success','datas':{"total":data.count,"rows":data.items}});
			return;
		}
	});
};

// City
exports.json_city_query = function(req, res, next) {
	var options = {};
	if (req.data.provinceId)
		options.provinceid = req.data.provinceId;

	AreaService.queryCity(options, function(err, data){
		if(!data || err){
			if (err)
				console.log('area json_city_query err:' + err);
			res.respond({'code':'1001','message':'没有查询到城市'});
			return;
		} else{
			res.respond({'code':'1000','message':'success','datas':{"total":data.count,"rows":data.items}});
			return;
		}
	});
};

// County
exports.json_county_query = function(req, res, next) {
	var options = {};
	if (req.data.provinceId)
		options.provinceid = req.data.provinceId;
	if (req.data.cityId)
		options.cityid = req.data.cityId;

	AreaService.queryCounty(options, function(err, data){
		if(!data || err) {
			if (err)
				console.log('area json_county_query err:' + err);
			res.respond({'code':'1001','message':'没有查询到县区'});
			return;
		} else {
			res.respond({'code':'1000','message':'success','datas':{"total":data.count,"rows":data.items}});
			return;
		}
	});
};

// Town
exports.json_town_query = function(req, res, next) {
	var options = {};
	if (req.data.provinceId)
		options.provinceid = req.data.provinceId;
	if (req.data.cityId)
		options.cityid = req.data.cityId;
	if (req.data.countyId)
		options.countyid = req.data.countyId;

	AreaService.queryTown(options, function(err, data){
		if(!data || err) {
			if (err)
				console.log('area json_town_query err:' + err);
			res.respond({'code':'1001','message':'没有查询到乡镇'});
			return;
		} else {
			res.respond({'code':'1000','message':'success','datas':{"total":data.count,"rows":data.items}});
			return;
		}
	});
};

// ==========================================================================
// FILES
// ==========================================================================

// Clears all uploaded files
function json_files_clear() {
	var Fs = require('fs');
	U.ls(files.directory, function(files) {
		files.wait(function(item, next) {
			Fs.unlink(item, next);
		});
	});

	res.json(SUCCESS(true));
}

// ==========================================================================
// DASHBOARD
// ==========================================================================

// Reads basic informations for dashboard
function json_dashboard() {

	var self = this;
	var model = {};
	var counter = MODULE('webcounter');

	model.webcounter = {};
	model.webcounter.today = counter.today();
	model.webcounter.online = counter.online();

	if (!model.webcounter.today.pages)
		model.webcounter.today.pages = 0;

	model.webcounter.today.pages = Math.floor(parseFloat(model.webcounter.today.pages));

	var async = [];

	// Reads all monthly stats
	async.push(function(next) {
		counter.monthly(function(stats) {
			model.webcounter.stats = stats;
			next();
		});
	});

	// Reads dashboard information from all registered schemas which they have defined `dashboard` operation.
	async.push(function(next) {

		var pending = [];

		EACHSCHEMA(function(group, name, schema) {
			if (!schema.operations || !schema.operations['dashboard'])
				return;
			pending.push(schema);
		});

		pending.wait(function(schema, next) {
			schema.operation('dashboard', null, function(err, data) {
				if (!err && data)
					model[schema.name] = data;
				next();
			});
		}, next);
	});

	async.async(function() {
		res.json(model);
	});
}

// Reads online users
exports.json_dashboard_online = function(req,res,next) {
	var self = this;
	//var counter = require('../modules/webcounter');
	//var memory = process.memoryUsage();
	var model = {};
	//model.visitors = counter.online();
	//model.today = counter.today();
	//model.last = counter.today().last;
	//model.memoryused = (memory.heapUsed / 1024 / 1024).floor(2);
	//model.memorytotal = (memory.heapTotal / 1024 / 1024).floor(2);
	res.json(model);
};

// Clear visitor statistics
function json_dashboard_clear() {
	var self = this;
	var instance = MODULE('webcounter').instance;

	F.fs.rm.database('webcounter.nosql');
	F.fs.rm.database('webcounter.cache');

	Object.keys(instance.stats).forEach(function(key) {
		instance.stats[key] = 0;
	});

	res.json(SUCCESS(true));
}

// ==========================================================================
// PRODUCTS
// ==========================================================================

// Gets all products
exports.json_products_query =function(req,res,next) {
	var self = this;
	ProductService.query(req.query, function(err,data){
		if (err) {
			console.error('manager json_products_query err:', err);
			res.respond(err);
			return;
		}
		if(data){
			res.respond(data);
		}
	});
}

// Saves (update or create) specific product
exports.json_products_save = function(req,res,next) {
	var self = this;

    ProductService.save(req.body, function(err, product){
		if(err){
			console.error('manager json_products_save err:', err);
			res.respond({code:1004, message:err});
			return;
		}

		res.respond({code:1000, product:product});
	});

	// Clears view cache
	//setTimeout(function() {
	//	F.cache.removeAll('cache.');
	//}, 2000);
}

exports.process_products_updateStatus = function(req,res,next){
	var self = this;
	ProductService.updateStatus(req.body._id, req.body.online, function(err){
		if(err){
			console.error('manager process_products_updateStatus err:', err);
			res.respond({code:1004, message:err});
			return;
		}

		res.respond({code:1000});
	})
}

// Removes specific product
exports.json_products_remove = function(req,res,next) {
	var self = this;
	ProductService.remove(req.body.id, function(err,data) {
		if (err) {
			console.error('manager json_products_remove err:', err);
			res.respond(err);
			return;
		}
		if (data) {
			res.respond(data);
		}
	});
}

// Clears all products
function json_products_clear() {
	var self = this;
	ProductService.workflow('clear', null, null, self.callback(), true);
}

// Imports products from CSV
function json_products_import() {
	var self = this;
	var file = self.files[0];
	ProductService.workflow('import', null, file.path, self.callback(), true);
}

// Reads all product categories
exports.json_products_categories = function(req,res,next){
	var self = this;

	CategoryService.all(function(err, categories){
		if(err){
			res.respond({code:1004, message:'fail to query category'});
			return;
		}

		res.respond(categories);
	})
}

// Replaces old category with new
function json_products_category_replace() {
	var self = this;
	ProductService.workflow('category', null, req.body, self.callback(), true);
}

// Reads all product attributes (brands models engines gearboxes levels etc.)
exports.json_products_attribute = function(req, res, next) {
	var attributeName = req.params.attributeName;
	var category = req.data.category;
	var brand = req.data.brand;
	ProductService.getAttributes(category, brand, attributeName, function (err, attributes) {
		if (err) {
			console.error('manager json_products_attribute query attributes err:', err);
			res.respond({code: 1004, message: '获取商品属性列表失败', error: err});
			return;
		}

		res.respond(attributes.length > 0 ? attributes[0].values || [] : []);
	})
};

exports.json_brands = function(req,res,next){
	var self = this;
	var category = req.data.category;
	BrandService.query(category, function(err, brands){
		if(err){
			console.error('manager json_brands query brands err:', err);
			res.respond({code:1004, message:'获取品牌列表失败', error:err});
			return;
		}
		res.respond({code:1000, brands:brands});
	})
}

exports.json_products_attributes = function(req,res,next){
	var self = this;
	ProductService.getAttributes(req.data.category, req.data.brand, req.data.name, function(err, attributes){
		if (err) {
			console.error('manager json_products_attributes err:', err);
			res.respond({code: 1004, message: '获取商品属性列表失败', error: err});
			return;
		}
		res.respond({code:1000, message:'success', attributes:attributes});
	}, 1)
}

// Reads a specific product by ID
exports.json_products_read = function(req,res,next) {
	var self = this;
	var options = {};
	options.id = req.params.id;
	ProductService.get(options, function(err,data){
		if (err) {
			console.error('manager json_products_read err:', err);
			res.respond(err);
			return;
		}
        if (!data) {
			res.respond({'code':1001,'message':'未查询到商品'});
			return;
		}
		if(data){
			res.respond(data);
		}
	});
}

// ==========================================================================
// ORDERS
// ==========================================================================

// Reads all orders
exports.json_orders_query = function(req,res,next) {
	var self = this;
	OrderService.query(req.query, function (err, orders) {
		if (err) {
			console.error('manager json_orders_query err:', err);
			res.respond({code:1004, message:'系统错误，没有找到订单信息。'});
			return;
		}
		if (orders) {
			var items = orders.items;
			var length = items.length;
			var arr = [];
			for (var i = 0; i < length; i++) {
				// var item = items[i];
				var order = items[i];
				var item = {
					'id': order.id,
					'paymentId': order.paymentId,
					'price': order.price,
					'deposit': order.deposit,
					'consigneeAddress': order.consigneeAddress,
					'consigneeName': order.consigneeName,
					'consigneePhone': order.consigneePhone,
					'buyerName': order.buyerName,
					'buyerPhone': order.buyerPhone,
					'payType': order.payType,
					'products': order.products || [],
					'SKUs': order.SKUs || [],
					'duePrice': typeof(order.duePrice) != 'undefined' ? parseFloat(order.duePrice.toFixed(2)) : null,
					'deliveryType': order.deliveryType,
					'payStatus': order.payStatus,
					'deliverStatus': order.deliverStatus,
					'RSCInfo': order.RSCInfo,
					'isClosed': order.isClosed
				};
				// 订单合成状态
				item.typeValue = OrderService.orderType(order);
				// 创建时间
				item.dateCreated = order.dateCreated;
				// 支付时间
				if (order.payStatus == PAYMENTSTATUS.PAID && order.datePaid) {
					item.datePaid = order.datePaid;
				}
				// 待收货时间
				if (order.payStatus == PAYMENTSTATUS.PAID && order.deliverStatus !== DELIVERSTATUS.UNDELIVERED && order.datePendingDeliver) {
					item.datePendingDeliver = order.datePendingDeliver;
				}
				// 全部发货时间
				if (order.deliverStatus == DELIVERSTATUS.DELIVERED && order.dateDelivered) {
					item.dateDelivered = order.dateDelivered;
				}
				// 完成时间
				if (order.deliverStatus == DELIVERSTATUS.RECEIVED && order.dateCompleted) {
					item.dateCompleted = order.dateCompleted;
				}
				var orderInfo = {
					'totalPrice': order.price.toFixed(2),
					'deposit': order.deposit.toFixed(2),
					'dateCreated': order.dateCreated,
					'orderStatus': OrderService.orderStatus(order),
					'pendingDeliverToRSC': OrderService.pendingDeliverToRSC(order)
				};
				item.order = orderInfo;
				arr[i] = item;
			}
			orders.items = arr;
		}
		res.respond({code:1000, message:'success', datas:orders});
	});
};

// Updates specific order sub order payments
exports.json_subOrders_payments_update = function(req,res,next) {
	var self = this;
	var orderid = req.body && req.body.id ? req.body.id: null;
	var subOrders = req.body && req.body.subOrders ? req.body.subOrders: null;
	if (!orderid) {
		res.respond({code:1001, message:'请求参数错误', error:[{'error':'更新失败，缺少订单ID'}]});
		return;
	}
	if (!subOrders) {
		res.respond({code:1001, message:'请求参数错误', error:[{'error':'更新失败，缺少子订单列表'}]});
		return;
	}
	var updatepayments = {};
	if (subOrders && subOrders.length > 0) {
       	for (var i = 0; i < subOrders.length; i++) {
	    	var suborder = subOrders[i];
	    	if (suborder.payments) {
		    	for (var j = 0; j < suborder.payments.length; j++) {
		    		var payment = suborder.payments[j];
			    	if (!updatepayments.hasOwnProperty(payment.id)) {
			    		updatepayments[payment.id] = payment;
			    	}
			    }
			}
       	}
    }
    var options = {'id':orderid,'payments':updatepayments};
    if (req.user) {
    	options.backendUser = req.user;
    }
    OrderService.updatePayments(options, function(err) {
		if (err) {
			console.error('manager json_subOrders_payments_update err:', err);
			res.respond({code:1004, message:'系统错误，更新失败', error:[{'error':'系统错误，更新失败'}]});
			return;
		}
		res.respond({code:1000, message:'success', success: true});
	});
}

// Updates specific order products
exports.json_orders_products_update = function(req, res, next) {
	var orderid = req.body && req.body.id ? req.body.id: null;
	var products = req.body && req.body.products ? req.body.products: null;
	if (!orderid) {
		res.respond({code:1001, message:'请求参数错误', error:[{'error':'更新失败，缺少订单ID'}]});
		return;
	}
	if (!products) {
		res.respond({code:1001, message:'请求参数错误', error:[{'error':'更新失败，缺少商品列表'}]});
		return;
	}
	var updateproducts = {};
	if (products && products.length > 0) {
       	for (var i = 0; i < products.length; i++) {
	    	var product = products[i];

	    	if (!updateproducts.hasOwnProperty(product.id)) {
	    		updateproducts[product.id] = product;
	    	}
       	}
    }
    OrderService.updateProducts({'id':orderid,'products':updateproducts}, function(err) {
		if (err) {
			console.error('manager json_orders_products_update err:', err);
			res.respond({code:1004, message:'系统错误，更新失败', error:[{'error':'系统错误，更新失败'}]});
			return;
		}
		res.respond({code:1000, message:'success', success: true});
	});
};

// Updates specific order SKUs
exports.json_orders_SKUs_update = function(req,res,next) {
	var self = this;
	var orderid = req.body && req.body.id ? req.body.id: null;
	var SKUs = req.body && req.body.SKUs ? req.body.SKUs: null;
	if (!orderid) {
		res.respond({code:1001, message:'请求参数错误', error:[{'error':'更新失败，缺少订单ID'}]});
		return;
	}
	if (!SKUs) {
		res.respond({code:1001, message:'请求参数错误', error:[{'error':'更新失败，缺少商品列表'}]});
		return;
	}
	var updateSKUs = {};
	if (SKUs && SKUs.length > 0) {
       	for (var i = 0; i < SKUs.length; i++) {
	    	var sku = SKUs[i];

	    	if (!updateSKUs.hasOwnProperty(sku.ref)) {
	    		updateSKUs[sku.ref] = sku;
	    	}
       	}
    }
	var options = {'id':orderid,'SKUs':updateSKUs};
	if (req.user) {
		options.backendUser = req.user;
	}
    OrderService.updateSKUs(options, function(err) {
		if (err) {
			console.error('manager json_orders_SKUs_update err:', err);
			res.respond({code:1004, message:'系统错误，更新失败', error:[{'error':'系统错误，更新失败'}]});
			return;
		}
		res.respond({code:1000, message:'success', success: true});
	});
}

//  SKUs deliver
exports.json_orders_SKUs_delivery = function(req, res, next) {
	var orderid = req.body && req.body.id ? req.body.id: null;
	var SKUs = req.body && req.body.SKUs ? req.body.SKUs: null;
	if (!orderid) {
		res.respond({code:1001, message:'请求参数错误', error:[{'error':'更新失败，缺少订单ID'}]});
		return;
	}
	if (!SKUs) {
		res.respond({code:1001, message:'请求参数错误', error:[{'error':'更新失败，缺少商品列表'}]});
		return;
	}

	OrderService.getById(orderid, function(err, order) {
		if (err) {
			console.error('manager json_orders_read error:', err);
			res.respond({code:1004, message:'系统错误，没有找到订单信息', error:[{'error':'系统错误，没有找到订单信息'}]});
			return;
		}

		var postSKUs = {};
		if (SKUs && SKUs.length > 0) {
			for (var i = 0; i < SKUs.length; i++) {
				var sku = SKUs[i];

				if (!postSKUs.hasOwnProperty(sku.ref)) {
					postSKUs[sku.ref] = sku;
				}
			}
		}

		var updateSKUs = {};
		if (order.SKUs && order.SKUs.length > 0) {
			for(var i = 0; i < order.SKUs.length; i++) {
				var deliverStatus = order.SKUs[i].deliverStatus;
				var sku_ref = order.SKUs[i].ref;
				if(postSKUs[sku_ref] && deliverStatus != postSKUs[sku_ref].deliverStatus) {
					if(!((deliverStatus == DELIVERSTATUS.UNDELIVERED && postSKUs[sku_ref].deliverStatus == DELIVERSTATUS.RSCRECEIVED)
						|| (deliverStatus == DELIVERSTATUS.RSCRECEIVED && postSKUs[sku_ref].deliverStatus == DELIVERSTATUS.DELIVERED && order.deliveryType == DELIVERYTYPE.SONGHUO.id))) {
						res.respond({code:1001, message:'状态不符合', error:[{'error':'状态不符合'}]});
						return;
					}
					updateSKUs[sku_ref] = postSKUs[sku_ref];
				}
			}


			if (!U.isEmpty(updateSKUs)) {
				var options = {'id':orderid,'SKUs':updateSKUs};
				if (req.user) {
					options.backendUser = req.user;
				}
				OrderService.updateSKUs(options, function(err) {
					if (err) {
						console.error('manager json_orders_SKUs_update err:', err);
						res.respond({code:1004, message:'系统错误，更新失败', error:[{'error':'系统错误，更新失败'}]});
						return;
					}
					res.respond({code:1000, message:'success', success: true});
				});
			} else {
				res.respond({code:1001, message:'没有需要修改的SKU', error:[{'error':'没有需要修改的SKUs'}]});
				return;
			}
		} else {
			res.respond({code:1001, message:'没有查找到SKUs', error:[{'error':'没有查找到SKUs'}]});
			return;
		}
	});
};

// order offline pay notify function
exports.process_order_confirm_OfflinePay = function(req, res, next){
	var paymentId = req.data.paymentId;
	var offlinePayType = req.data.offlinePayType;
	var RSCId = req.data.RSCId;
	//var RSC = req.user;
	if(!paymentId){
		res.respond({code:1001, message:'paymentId required'});
		return;
	}

	if(!offlinePayType){
		res.respond({code:1001, message:'offlinePayType required'});
		return;
	}

	if(!RSCId){
		res.respond({code:1001, message:'RSCId required'});
		return;
	}

	OrderService.get({"paymentId": paymentId}, function(err, order) {
		if (err) {
			res.respond({code:1002, message:'获取订单失败'});
			return;
		}

		//if(!order.RSCInfo || order.RSCInfo.RSC.toString() != RSC._id.toString()){
		//	res.respond({code:1002, message:'该订单未分配到县级网点'});
		//	return;
		//}

        if (!order) {
			res.respond({'code':1001,'message':'未查询到订单'});
			return;
		}

		if(!order.pendingApprove){
			res.respond({code:1002, message:'该订单没有待审核的线下支付'});
			return;
		}

		var payment = OrderService.getPaymentInOrder(order, paymentId);
		if(!payment){
			res.respond({code:1002, message:'确认付款失败'});
			return;
		}

		UserService.getRSCInfoById(RSCId, function(err, RSC) {

			if(err || !RSC) {
				if(err) console.error('manager process_order_confirm_OfflinePay UserService getRSCInfoById err:', err);
				res.respond({code:1002, message:'未查找到RSC'});
				return;
			}

			var options = {
				payType: offlinePayType,
				price: payment.payPrice ? payment.payPrice : payment.price,
				datePaid: new Date()
			};

			if (req.user) {
				options.backendUser = req.user;
			}

			RSC._id = RSCId;
			options.RSC = RSC;

			OrderService.payNotify(paymentId, options);
			res.respond({code: 1000, message: 'success'});
		});
	});
};

exports.json_offline_pay_type = function(req, res, next){
	res.respond({code:1000, message:'success', offlinePayType:OFFLINEPAYTYPE});
};

// Reads a specific order by ID
exports.json_orders_read = function(req,res,next) {
	var self = this;
	var options = {};
	options.id = req.params.id;
	
	OrderService.get(options, function(err, order, payment) {
		if (err) {
			console.error('manager json_orders_read error:', err);
			res.respond({code:1004, message:'系统错误，没有找到订单信息', error:[{'error':'系统错误，没有找到订单信息'}]});
			return;
		}
		if (!order) {
			res.respond({'code':1001,'message':'未查询到订单'});
			return;
		}
        res.respond({code:1000, message:'success', datas: convertOrderToShow(order, payment)});
    });
};

var convertOrderToShow = function(order, orderpayment){
    var subOrdersPayments = {};					// suborder all payments

	if (order && order.payments) {
       	for (var i = 0; i < order.payments.length; i++) {
	    	var payment = order.payments[i];

	    	if (!subOrdersPayments.hasOwnProperty(payment.suborderId)) {
	    		subOrdersPayments[payment.suborderId] = [];
	    	}
	    	subOrdersPayments[payment.suborderId].push(payment);
       	}
    }

	if (order && order.subOrders) {
		var subOrders = [];
		for (var i=0; i < order.subOrders.length; i++) {
			var subOrder = order.subOrders[i];
			var payments = subOrdersPayments[subOrder.id] || [];
			var paidPrice = 0;
			var paidTimes = 0;
			var closedTimes = 0;
			var datePaid = null;
			for (var j = 0; j < payments.length; j++) {
				var payment = payments[j];

				if (parseInt(payment.payStatus) === PAYMENTSTATUS.PAID) {
					paidPrice += payment.price;
					paidTimes += 1;
					if (payment.datePaid) {
						if ((datePaid && datePaid < payment.datePaid) || !datePaid)
							datePaid = payment.datePaid;
					}
				}

				if (typeof(payment.isClosed) != 'undefined' && payment.isClosed === true && parseInt(payment.payStatus) === PAYMENTSTATUS.UNPAID) {
					closedTimes += 1;
				}
				payment.price = parseFloat(payment.price.toFixed(2));
			}
			// 本阶段要付金额
			subOrder.price = parseFloat(subOrder.price.toFixed(2));
			// 本阶段已付金额
			subOrder.paidPrice = parseFloat(paidPrice.toFixed(2));
			// 本阶段已支付次数
			subOrder.paidTimes = paidTimes;
			// 本阶段支付已关闭次数
			subOrder.closedTimes = closedTimes;
			// 本阶段的所有支付信息列表
			subOrder.payments = payments;
			// 本阶段支付时间
			subOrder.datePaid = datePaid;
			subOrders.push(subOrder);
		}
		order.subOrders = subOrders;
		delete order.payments;
	}

	// order status and type
	if (order) {
		// 总价
		order.price = parseFloat(order.price.toFixed(2));
		// 定金
		if (order.deposit)
			order.deposit = parseFloat(order.deposit.toFixed(2));
		// 待付金额
		if (order.duePrice)
			order.duePrice = parseFloat(order.duePrice.toFixed(2));
		// 订单合成状态
		order.orderType = OrderService.orderType(order);
		var orderInfo = {
			'totalPrice': parseFloat(order.price.toFixed(2)),
			'deposit': parseFloat(order.deposit.toFixed(2)),
			'dateCreated': order.dateCreated,
			'orderStatus': OrderService.orderStatus(order),
			'pendingDeliverToRSC': OrderService.pendingDeliverToRSC(order)
		};
		// 支付时间
		if (order.payStatus == PAYMENTSTATUS.PAID && order.datePaid) {
			orderInfo.datePaid = order.datePaid;
		}
		// 待收货时间
		if (order.datePendingDeliver) {
			orderInfo.datePendingDeliver = order.datePendingDeliver;
		}
		// 全部发货时间
		if (order.deliverStatus == DELIVERSTATUS.DELIVERED && order.dateDelivered) {
			orderInfo.dateDelivered = order.dateDelivered;
		}
		// 完成时间
		if (order.deliverStatus == DELIVERSTATUS.RECEIVED && order.dateCompleted) {
			orderInfo.dateCompleted = order.dateCompleted;
		}
		orderInfo.payment = orderpayment;
		order.order = orderInfo;
	}

    return order;
};

// ==========================================================================
// USERS
// ==========================================================================

// Reads all users
exports.json_users_query = function(req,res,next) {
	UserService.query(req.query, function(err,data){
		if (err) {
			console.error('manager json_users_query err:', err);
			res.respond(err);
			return;
		}
		if(data){
			res.respond({code:1000, users:data || []});
		}
	});
};

// Saves specific user (user must exist)
exports.json_users_save = function(req,res,next) {
	var self = this;
    if(!req.data.id){
        res.respond({code:1001, message:'id required'});
    }

    var options = {};

    if(req.data.id)
        options.id = req.data.id;
    if(req.data.type)
        options.type = req.data.type;
	if(req.data.typeVerified)
		options.typeVerified = req.data.typeVerified;

	// req.body.$save(self.callback());
	UserService.update(options, function(err){
        if(err){
        	console.error('manager json_users_save err:', err);
            res.respond({code:1004, message:'系统错误，更新失败'});
            return;
        }

        res.respond({code:1000, message:'success'});
    });
}

// // Removes specific user
// function json_users_remove() {
// 	var self = this;
// 	UserService.remove(req.body.id, self.callback());
// }

// Reads a specific user by ID
exports.json_users_read = function(req,res,next) {
	var self = this;
	var options = {};
	options.userid = req.params.id;
	UserService.get(options, function(err, user) {
        if (err) {
        	console.error('manager json_users_read err:', err);
            res.respond({code: 1004, message: 'get user err:' + err});
            return;
        }
        if (!user) {
			res.respond({'code':1001,'message':'未查询到用户'});
			return;
		}

		res.respond({code: 1000, user: user});
    });
}

// ==========================================================================
// NEWS
// ==========================================================================

// Gets all news
exports.json_news_query = function(req, res, next) {
	NewsService.query(req.query, function(err, news){
		res.respond(news);
	});
};

// Saves (update or create) specific new
exports.json_news_save = function(req, res, next) {
    NewsService.save(req.body, function(err){
        if(err){
            console.error('manager json_news_save err:', err);
			res.respond({code:1004, message:'系统错误，更新失败', error:[{'error':'系统错误，更新失败'}]});
            return;
        }

        res.respond({code:1000, message:'success', success:true});
    });
};

// Update specific new status
exports.json_news_updatestatus = function(req, res, next) {
    NewsService.updatestatus(req.body, function(err){
        if(err){
            console.error('manager json_news_updatestatus err:', err);
			res.respond({code:1004, message:'系统错误，更新失败', error:[{'error':'系统错误，更新失败'}]});
            return;
        }

        res.respond({code:1000, message:'success', success:true});
    });
};

// Removes specific new
exports.json_news_remove = function(req, res, next) {
    NewsService.remove(req.body, function(err){
        if(err){
            console.error('manager json_news_remove err:', err);
			res.respond({code:1004, message:'系统错误，删除失败', error:[{'error':'系统错误，删除失败'}]});
            return;
        }

        res.respond({code:1000, message:'success', success:true});
    });
};

// Reads all news categories
exports.json_news_categories = function(req, res, next) {
    NewsService.queryCategory({}, function (err, result) {
        if (err || !result) {
            res.json([]);
            return;
        }
		var length = result.length;
		var arr = [];
		for (var i = 0; i < length; i++) {
			var category = result[i];
			arr[i] = { name: category.name, linker: category.name, count: category.count };
		}
        res.json(arr);
    });
};

// Replaces old category with new
exports.json_news_category_replace = function(req, res, next) {
    NewsService.category(req.body, function(err){
        if(err){
            console.error('manager json_news_category_replace err:', err);
			res.respond({code:1004, message:'系统错误，替换失败', error:[{'error':'系统错误，替换失败'}]});
            return;
        }

        res.respond({code:1000, message:'success', success:true});
    });
};

// Reads a specific new by ID
exports.json_news_read = function(req, res, next) {
	var id = req.params.id;
	var options = {};
	options.id = id;
    NewsService.get(options, function(err, news){
    	if(err){
            console.error('manager json_news_read err:', err);
			res.respond({code:1004, message:'系统错误，没有找到资讯', error:[{'error':'系统错误，没有找到资讯'}]});
            return;
        }
        if (!news) {
			res.respond({'code':1001,'message':'未查询到资讯'});
			return;
		}
		res.respond(news);
	});
};

// ==========================================================================
// Audit logs
// ==========================================================================

// Gets all audit logs
exports.json_auditlog_query = function(req, res, next) {
	AuditlogService.query(req.query, function(err, datas){
		if (err) {
			console.error('manager json_auditlog_query err:', err);
			res.respond({code: 1004, message: 'query audit logs err:' + err});
			return;
		}
		res.respond({code:1000, message:'success', datas:datas});
	});
};

// Reads a specific audit log by ID
exports.json_auditlog_read = function(req, res, next) {
	var id = req.params.id;
	var options = {};
	options.id = id;
    AuditlogService.get(options, function(err, datas){
		if (err) {
			console.error('manager json_auditlog_read err:', err);
			res.respond({code: 1004, message: 'get audit logs err:' + err});
			return;
		}
        if (!datas) {
			res.respond({'code':1001,'message':'未查询到audit log'});
			return;
		}
		res.respond({code:1000, message:'success', datas:datas});
	});
};

// ==========================================================================
// PAGES
// ==========================================================================

// Gets all pages
function json_pages_query() {
	var self = this;
	GETSCHEMA('Page').query(req.query, self.callback());
}

// Creates HTML preview
function view_pages_preview() {
	var self = this;
	self.layout('layout-preview');
	self.repository.preview = true;
	self.repository.page = req.body;
	self.view('~cms/' + req.body.template);
}

// Gets dependencies for Pages (templates and navigations)
function json_pages_dependencies() {
	var self = this;
	res.json({ templates: F.config.custom.templates, navigations: F.config.custom.navigations });
}

// Saves (update or create) specific page
function json_pages_save() {
	var self = this;

	// Is auto-creating URL?
	if (req.body.url[0] === '-')
		req.body.$async(self.callback(), 1).$workflow('create-url').$save();
	else
		req.body.$save(self.callback());

	// Clears view cache
	setTimeout(function() {
		F.cache.removeAll('cache.');
	}, 2000);
}

// Reads a specific page
function json_pages_read(id) {
	var self = this;
	var options = {};
	options.id = id;
	GETSCHEMA('Page').get(options, self.callback());
}

// Removes specific page
function json_pages_remove() {
	var self = this;
	GETSCHEMA('Page').remove(req.body.id, self.callback());
}

// Clears all pages
function json_pages_clear() {
	var self = this;
	GETSCHEMA('Page').workflow('clear', null, null, self.callback(), true);
}

function json_pages_sitemap() {
	this.json(F.global.sitemap);
}

// ==========================================================================
// WIDGETS
// ==========================================================================

// Gets all widgets
function json_widgets_query() {
	var self = this;
	GETSCHEMA('Widget').query(req.query, self.callback());
}

// Saves (updates or creates) specific widget
function json_widgets_save() {
	var self = this;
	req.body.$save(self.callback());

	// Clears view cache
	setTimeout(function() {
		F.cache.removeAll('cache.');
	}, 2000);
}

// Reads specific widget
function json_widgets_read(id) {
	var self = this;
	var options = {};
	options.id = id;
	GETSCHEMA('Widget').get(options, self.callback());
}

// Removes specific widget
function json_widgets_remove() {
	var self = this;
	GETSCHEMA('Widget').remove(req.body.id, self.callback());
}

// Clears all widgets
function json_widgets_clear() {
	var self = this;
	GETSCHEMA('Widget').workflow('clear', null, null, self.callback(), true);
}

// ==========================================================================
// SETTINGS
// ==========================================================================

// Reads custom settings
function json_settings() {
	var self = this;
	GETSCHEMA('Settings').get(null, self.callback());
}

// Saves and refresh custom settings
function json_settings_save() {
	var self = this;
	req.body.$async(self.callback(), 0).$save().$workflow('load');
}

// ==========================================================================
// SYSTEM
// ==========================================================================

// Full backup
// How do I restore backup? Total.js must be installed as global module, terminal:
// $ tpm restore filename
function file_backup_website() {
	var self = this;
	var filename = F.path.temp('website.backup');
	var filter = function(path) {
		return !path.startsWith('/tmp');
	};

	F.backup(filename, F.path.root(), function() {
		self.file('~' + filename, 'website.backup', null, function() {
			F.fs.rm.temp('website.backup');
		});
	}, filter);
}

// Backup databases
function file_backup_database() {
	var self = this;
	var filename = F.path.temp('databases.backup');
	F.backup(filename, F.path.databases(), function() {
		self.file('~' + filename, 'databases.backup', null, function() {
			F.fs.rm.temp('databases.backup');
		});
	});
}

// Restore databases
function file_restore_database() {
	var self = this;
	var filename = F.path.temp('databases.backup');
	F.restore(self.files[0].path, F.path.databases(), function() {
		// Clear all databases instances
		F.databases = {};
		ProductService.workflow('refresh', null, null, NOOP, true);
		res.json(SUCCESS(true));
	});
}

// ==========================================================================
// NEWSLETTER
// ==========================================================================

// Reads all emails from newsletter file
function json_newsletter() {
	var self = this;
	GETSCHEMA('Newsletter').query(self.callback());
}

// Downloads all email address as CSV
function file_newsletter() {
	var self = this;
	GETSCHEMA('Newsletter').workflow('download', null, self, null, true);
}

// Clears all email addreses in newsletter
function json_newsletter_clear() {
	//var self = this;
	GETSCHEMA('Newsletter').workflow('clear', null, null, self.callback(), true);
}

// backend user
exports.process_login = function(req, res, next) {
    if (!req.data.account){
		res.respond({code:1001,message:'请输入账号'});
        return;
    }

    if (!req.data.password){
		res.respond({code:1001,message:'请输入密码'});
        return;
    }

    var options = {};
    options.account = req.data.account;
    options.password = tools.decrypt_password(decodeURI(req.data.password));
//    options.password = req.data.password;
    BackEndUserService.login(options, function(err, user){
        if(err){
            // login fail
            console.log('backend user process_login err: ' + err);
			res.respond({code:1001, message:'用户名或密码错误'});
            return
        }

        // login success
        // set cookie
        setCookieAndResponse(req, res ,user, false);
    });
};

exports.process_createUser = function(req, res, next){
    var user = req.user;

    if(!req.data.account || !req.data.password || !req.data.role){
        res.respond({code:1001, message:'need account, password and role'});
        return;
    }

    req.data.password = tools.decrypt_password(decodeURI(req.data.password));
    if(!user.business) {
        // must have business id
        res.respond({code: 1001, message: 'need business'});
        return;
    }

    req.data.business = user.business;

    if(req.data.role._id){
        req.data.role = req.data.role._id;
    }

    if(req.data.business._id){
        req.data.business = req.data.business._id;
    }

    BackEndUserService.create(req.data, function(err, user){
        if(err){
            res.respond({code:1004, message:err});
            return;
        }

        res.respond({code:1000, user:user, message:'success'});
    });
};

var setCookieAndResponse = function(req, res, user, keepLogin){
    //var self = this;

    // Set cookie
	var options = {_id:user._id};
	var userAgent = req.data["user-agent"] || 'web';
    if(REG_MOBILE.test(userAgent)){
        // is app
        options.appLoginId = U.GUID(10);
    }else{
        // is web
        options.webLoginId = U.GUID(10);
    }

    var token = tools.generate_token(user._id, options.appLoginId, options.webLoginId);
    BackEndUserService.update(options, function(err){
        if(err){

            console.log('setCookieAndResponse err: ' + err);
            res.respond({code:1004, message:'登录失败'});
            return;
        }

        if(keepLogin){
            if(config.isDebug){
                res.cookie(config.backendtokencookie, token, {expires:new Date().add(config.token_cookie_expires_in)});
            }else {
                res.cookie(config.backendtokencookie, token, {expires:new Date().add(config.token_cookie_expires_in), domain: config.domain});
            }
        }else{
            if(config.isDebug){
                res.cookie(config.backendtokencookie, token);
            }else {
                res.cookie(config.backendtokencookie, token, {domain: config.domain});
            }
        }

        // Return results
        var result = {code: 1000, message: 'success', datas: user, token:token};
        res.respond(result);
    });
};

exports.json_permissions = function(req, res, next){
    AuthService.getPermissionList(function(err, permissionList){
		res.respond(permissionList);
	});
};

exports.json_be_users = function(req,res,next){
    var self=this;
    BackEndUserService.getUserList(function(err,data){
		if (err) {
			console.error('manager json_be_users err:', err);
			res.respond(err);
			return;
		}
		if(data){
			res.respond(data);
		}

	});
};

exports.json_roles = function(req, res, next){
    AuthService.getRoleList(function(err, roleList){
		res.respond(roleList);
	});
};

exports.process_modify_password = function(req, res, next){
    if(!req.data.account){
        res.respond({code:1001, message:'need account'});
        return;
    }

    if(!req.data.oldPwd){
        res.respond({code:1001, message:'need oldPwd'});
        return;
    }

    if(!req.data.newPwd){
        res.respond({code:1001, message:'need newPwd'});
        return;
    }

    var decryptedNewPwd = tools.decrypt_password(decodeURI(req.data.newPwd));
    var decryptedOldPwd = tools.decrypt_password(decodeURI(req.data.oldPwd));
    if (decryptedNewPwd.length < 6) {
        res.respond({code: 1001, 'message': '新密码长度需不小于6位'});
        return;
    }
    if (decryptedNewPwd === decryptedOldPwd) {
        res.respond({code: 1001, 'message': '新密码与旧密码不能一致'});
        return;
    }
    BackEndUserService.validate_password(req.data.account, decryptedOldPwd, function(err, valid){
        if(err){
            res.respond({code:1004, message:err});
            return;
        }

        if(!valid){
            res.respond({code:1001, message:'密码错误'});
            return;
        }

        BackEndUserService.update(req.data, function(err){
            if(err){
                res.respond({code:1004, message:'更新失败'});
                return;
            }

            res.respond({code:1000, message:'success'});
        })
    })
};

exports.json_be_users_update = function(req, res, next){
    if(req.data.password) {
        req.data.password = tools.decrypt_password(decodeURI(req.data.password));
    }

    if(req.data.role._id){
        req.data.role = req.data.role._id;
    }

    if(req.data.business && req.data.business._id){
        req.data.business = req.data.business._id;
    }

    BackEndUserService.update(req.data, function(err){
        if(err){
            res.respond({code:1004, message:err});
            return;
        }

        res.respond({code:1000, message:'success'});
    });
};

exports.json_businesses = function(req, res, next){
    BackEndUserService.getBusinessList(function(err, businessList){
		res.respond(businessList);
	});
};

exports.process_SKU_add = function(req, res, next) {
	if (!req.data.name) {
		res.respond({code: 1001, message: '请输入SKU名称'});
		return;
	}

	if (!req.data.product) {
		res.respond({code: 1001, message: '请选择商品'});
		return;
	}

	if (!req.data.price || !req.data.price.platform_price) {
		res.respond({code: 1001, message: '请输入平台价'});
		return;
	}

	SKUService.addSKU(req.data.product, req.data.attributes, req.data.additions, req.data.price, function (err, SKU) {
		if (err) {
			console.error('process_SKU_add error', err);
			if(11000 == err.code){
				res.respond({code:1001, message:'相同属性的SKU已经添加过了'});
			} else {
				res.respond({code: 1004, message: '添加失败'});
			}

			return;
		}

		res.respond({code: 1000, message: 'success', SKU: SKU});
	})
};

exports.process_SKU_update = function(req, res, next){
	var id = req.params.id;
	if(!req.data.price || !req.data.price.platform_price){
		res.respond({code:1001, message:'请输入平台价'});
		return;
	}

	SKUService.updateSKU(id, req.data.price, req.data.attributes, req.data.additions, function(err){
		if(err){
			console.error('updateSKU error', err);
			if(11000 == err.code){
				res.respond({code:1001, message:'相同属性的SKU已经添加过了'});
			} else {
				res.respond({code: 1004, message: '更新SKU失败'});
			}
			return;
		}

		res.respond({code:1000, message:'success'});
	})
};

exports.process_SKU_Attribute_add = function(req, res, next){
	if(!req.data.category){
		res.respond({code:1001, message:'请填写category'});
		return;
	}

	if(!req.data.brand){
		res.respond({code:1001, message:'请填写brand'});
		return;
	}

	if(!req.data.name){
		res.respond({code:1001, message:'请填写name'});
		return;
	}

	if(!req.data.value){
		res.respond({code:1001, message:'请填写value'});
		return;
	}

	SKUService.addSKUAttribute(req.data.category, req.data.brand, req.data.name, req.data.value, null, function(err, attribute){
		if(err){
			console.error('process_SKU_Attribute_add error', err);
			if(11000 == err.code){
				res.respond({code:1001, message:'相同的SKU属性已经添加过了'});
			} else {
				res.respond({code: 1004, message: '添加SKU属性失败'});
			}
			return;
		}

		res.respond({code:1000, message:'success', attribute:attribute});
	})
};

exports.json_SKU_Attributes_get = function(req, res, next){
	SKUService.querySKUAttributes(req.data.category, req.data.brand, function(err, attributes){
		if(err){
			console.error('json_SKU_Attributes_get error', err);
			res.respond({code:1004, message:'获取SKU属性失败'});
			return;
		}

		res.respond({code:1000, message:'success', attributes:attributes});
	})
};

exports.process_product_attributes_add = function(req, res, next){
	ProductService.addAttribute(req.data.category, req.data.brand, req.data.name, req.data.value, null, function(err, new_attribute){
		if(err){
			if(11000 == err.code){
				res.respond({code:1001, message:'相同的商品属性已经添加过了'});
			} else {
				res.respond({code: 1004, message: '保存商品属性失败'});
			}
			return;
		}

		res.respond({code:1000, message:'success', attribute:new_attribute});
	})
};

exports.json_SKU_get = function(req, res, next){
	SKUService.querySKUByProductId(req.data.product, function(err, SKUs){
		if(err){
			console.error('manager json_SKU_get err:', err);
			res.respond({code:1004, message:'查询SKU失败'});
			return;
		}

		res.respond({code:1000, message:'success', SKUs:SKUs});
	})
};

exports.process_SKU_online = function(req, res, next){
	var id = req.params.id;
	if(typeof req.data.online == 'undefined'){
		res.respond({code:1001, message:"请填写上架与否"});
		return;
	}

	SKUService.online(id, req.data.online, function(err, doc){
		if(err){
			console.error('manager process_SKU_online err:', err);
			res.respond({code:1004, message:'更新SKU失败'});
			return;
		}

		res.respond({code:1000, message:'success', SKU:doc});
	})
};

exports.json_SKU_Additions_get = function(req, res, next){
	SKUService.querySKUAdditions(req.data.category, req.data.brand, function(err, additions){
		if(err){
			console.error('json_SKU_Attributes_get error', err);
			res.respond({code:1004, message:'获取SKU属性失败'});
			return;
		}

		res.respond({code:1000, message:'success', additions:additions});
	})
};

exports.process_SKU_Addition_add = function(req, res, next){
	SKUService.addSKUAddition(req.data.category, req.data.brand, req.data.name, req.data.price, function(err, addition){
		if(err){
			console.error('process_SKU_Addition_add error', err);
			res.respond({code:1004, message:'添加SKU附加属性失败'});
			return;
		}

		res.respond({code:1000, message:'success', addition:addition});
	})
};

exports.json_potential_customer_query = function(req, res, next){
	PotentialCustomerService.queryPage(null, req.data.page-1, req.data.max, function(err, customers, count, pageCount){
		if(err){
			res.respond({code:1001, message:'获取潜在客户列表失败'});
			return;
		}

		res.respond({code:1000, message:'success', potentialCustomers:customers, count:count, pageCount:pageCount});
	}, req.data.search, true)
};

exports.json_potential_customer_get = function(req, res, next){
	var _id = req.params._id;
	PotentialCustomerService.getById(_id, function(err, customer){
		if(err){
			res.respond({code:1001, message:'获取潜在客户详情失败'});
			return;
		}

		if(customer.isRegistered){
			UserService.getByAccount(customer.phone, function(err, user){
				if(err){
					res.respond({code:1001, message:'获取潜在客户信息失败'});
					return;
				}

				if(user && user.inviter) {
					customer.inviter = user.inviter;
				}

				res.respond({code:1000, potentialCustomer:customer});
			})
		} else{
			res.respond({code:1000, potentialCustomer:customer});
		}
	})
};

exports.json_agent_info_get = function(req,res,next){
	UserService.get({userid:req.params.id}, function(err, user){
		if(err || !user){
			res.respond({code:1001, message:'获取新农经纪人信息失败'});
			return;
		}

		PotentialCustomerService.getStatistic(user._id, function(err, totalCount, registeredCount, registeredAndBindedCount){
			if(err){
				res.respond({code:1001, message:'获取新农经纪人信息失败'});
				return;
			}

			res.respond({code:1000, agent:{name:user.name, phone: user.account, address:user.address, totalCount:totalCount, registeredCount:registeredCount, registeredAndBindedCount:registeredAndBindedCount}});
		})
	})
};

// ==========================================================================
// agents
// ==========================================================================
exports.json_agents_query = function(req,res,next){
	var page = U.parseInt(req.data.page, 1) - 1;
	var max = U.parseInt(req.data.max, 20);
	AgentService.getAgentList(null, null, null, null, page, max, req.data.search, null, function(err, agents, count, pageCount) {
		if(err){
			res.respond({code:1002, message:err});
			return;
		}

		res.respond({code:1000, message:'success', agents:agents, count:count, pageCount:pageCount, page:page+1});
	});
};

exports.json_agents_get = function(req,res,next){
	AgentService.getAgent(req.params._id, function(err, agent){
		if(err || !agent){
			res.respond({code:1001, message:'获取新农经纪人信息失败'});
			return;
		}
		res.respond({code:1000, message:'success', agent:agent});
	});
};

exports.json_agents_invitees_query = function(req,res,next){
	var page = U.parseInt(req.data.page, 1) - 1;
	var max = U.parseInt(req.data.max, 20);
	AgentService.getInviteeList(req.data.agentId, page, max, function(err, invitees, count, pageCount){
		if(err || !invitees){
			res.respond({code:1001, message:'获取新农经纪人客户列表失败'});
			return;
		}
		res.respond({code:1000, message:'success', invitees:invitees, count:count, pageCount:pageCount, page:page+1});
	});
};

exports.json_agents_potentialCustomers_query = function(req,res,next){
	var page = U.parseInt(req.data.page, 1) - 1;
	var max = U.parseInt(req.data.max, 20);
	PotentialCustomerService.queryPage({_id:req.data.agentId}, page, max, function(err, customers, count, pageCount){
		if (err || !customers) {
			res.respond({code:1001, message:'获取潜在客户列表失败'});
			return;
		}

		res.respond({code:1000, message:'success', potentialCustomers:customers, count:count, pageCount:pageCount, page:page+1});
	}, null, true);
};

// ==========================================================================
// RSC
// ==========================================================================

exports.json_RSC_info_get = function(req,res,next){
	UserService.getRSCInfoById(req.params._id, function(err, user){
		if(err){
			res.respond({code:1001, message:'查询失败'});
			return;
		}

		var RSCInfo = user.RSCInfo ? user.RSCInfo.toObject() : user.RSCInfo;
		if (U.isEmpty(RSCInfo)) {
			RSCInfo = null;
		} else {
			if (U.isEmpty(RSCInfo.companyAddress)) {
				delete RSCInfo.companyAddress;
			}
			if (U.isEmpty(RSCInfo.products)) {
				delete RSCInfo.products;
			}
		}
		res.respond({code:1000, message:'success', RSCInfo:RSCInfo, id:user.id, account:user.account});
	})
};

exports.json_RSC_query = function(req, res, next){
	var page = U.parseInt(req.data.page, 1) - 1;
	var max = U.parseInt(req.data.max, 20);
	RSCService.getRSCList(null, null, null, null, null, page, max, function(err, RSCs, count, pageCount){
		if(err){
			res.respond({code:1002, message:err});
			return;
		}

		res.respond({code:1000, message:'success', RSCs:RSCs, count:count, pageCount:pageCount});
	}, req.data.search)
};

exports.process_RSC_modify = function(req, res, next){
	if(req.data.IDNo && !tools.isValidIdentityNo(req.data.IDNo)){
		res.respond({code:1001, message:'请填写正确的身份证号'});
		return;
	}

	if(req.data.phone && !tools.isPhone(req.data.phone)){
		res.respond({code:1001, message:'请填写正确的手机号'});
		return;
	}

	if(typeof req.data.EPOSNo != 'undefined' && req.data.EPOSNo) {
		UserService.getRSCInfoByEPOSNo(req.data.EPOSNo, function(err, RSC) {
			if(err){
				console.error('manager process_RSC_modify UserService getRSCInfoByEPOSNo err:', err);
				res.respond({code:1002, message:err});
				return;
			}
			if (RSC) {
				res.respond({code:1002, message:"此设备号已经被绑定过了", RSC: RSC});
				return;
			} else {
				RSCService.modifyRSCInfo(req.data.id, req.data, function(err){
					if(err){
						res.respond({code:1002, message:err});
						return;
					}

					res.respond({code:1000, message:'success'});
				});
			}
		});
	} else {
		console.log(req.data);
		RSCService.modifyRSCInfo(req.data.id, req.data, function(err){
			if(err){
				res.respond({code:1002, message:err});
				return;
			}

			res.respond({code:1000, message:'success'});
		});
	}
}

exports.json_RSCorders_query = function(req, res, next) {
    if (!req.data.RSCId) {
    	res.respond({code:1001, message:'获取订单失败，需要RSCId'});
    	return;
    }
    var RSC = req.data.RSCId;
    var page = U.parseInt(req.data.page, 1) - 1;
    var max = U.parseInt(req.data.max, 20);
    var type = U.parseInt(req.data.type);
    if (page < 0)
		page = 0;
	if(max > 50)
        max = 50;
    OrderService.getByRSC(RSC, page, max, type, function (err, orders, count, pageCount) {
        if (err) {
            res.respond({code:1002, message:'获取订单失败'});
            return;
        }
        
        if (orders) {
        	var results = [];
	        var length = orders.length;
	        for (var i = 0; i < length; i++) {
                var order = orders[i];
                var orderInfo = {
                	id: order.id,
                	totalPrice: order.price,
                	deposit: order.deposit,
                	duePrice: order.duePrice,
                	// 下单时间
                	dateCreated: order.dateCreated,
                	// 配送方式
                	delivery: {type:order.deliveryType, value:DELIVERYTYPENAME[order.deliveryType]},
                	SKUs: order.SKUs,
                	consigneeName: order.consigneeName,
					consigneePhone: order.consigneePhone,
					consigneeAddress: order.consigneeAddress,
					RSCInfo: order.RSCInfo
                };
                // 订单状态
            	orderInfo.orderStatus 				= OrderService.orderStatus(order);
                // 订单合成状态
                orderInfo.typeValue 				= OrderService.orderType(order);
                // 订单RSC的合成状态
                orderInfo.RSCtypeValue 				= OrderService.RSCOrderStatus(order);
                // 支付状态
	            orderInfo.payStatus         		= order.payStatus;
	            // 发货状态
	            orderInfo.deliverStatus     		= order.deliverStatus;
                // 支付时间
                if (order.payStatus == PAYMENTSTATUS.PAID && order.datePaid) {
                    orderInfo.datePaid 				= order.datePaid;
                }
                // 待收货时间
			    if (order.datePendingDeliver) {
			        orderInfo.datePendingDeliver 	= order.datePendingDeliver;
			    }
               	// 全部发货时间
                if (order.deliverStatus == DELIVERSTATUS.DELIVERED && order.dateDelivered) {
                    orderInfo.dateDelivered 		= order.dateDelivered;
                }
                // 收货时间 完成时间
                if (order.deliverStatus == DELIVERSTATUS.RECEIVED && order.dateCompleted) {
                    orderInfo.dateCompleted 		= order.dateCompleted;
                }
                results.push(orderInfo);
            }
            res.respond({code:1000, message:'success', orders:results, count:count, pageCount:pageCount, page:page+1});
        } else {
        	res.respond({code:1000, message:'success', orders:[], count:0, pageCount:1, page:page+1});
        }
    });
};

exports.json_RSC_query_by_products = function(req,res,next){
	var productIds = req.data.productIds.split(',');

	ProductService.queryProductsById(productIds, function(err, products){
		if(err){
			res.respond({code: 1002, message: '查询失败' + err});
			return;
		}

		var product_ids = [];
		products.forEach(function(product){
			product_ids.push(product._id.toString());
		});

		RSCService.getRSCList(product_ids, null, null, null, null, null, null, function(err, RSCs, count, pageCount){
			if(err){
				res.respond({code: 1002, message: '查询失败' + err});
				return;
			}

			res.respond({code:1000, message:'success', RSCs:RSCs});
		});
	})
};

// ==========================================================================
// Pay Refund
// ==========================================================================

// Gets all pay refund
exports.json_payrefund_query = function(req, res, next) {
	var self = this;
	PayService.queryPaymentRefund(req.query, function(err, datas){
		if (err) {
			console.error('manager json_payrefund_query err:', err);
			res.respond({code: 1004, message: 'query pay refund err:' + err});
			return;
		}
		res.respond({code:1000, message:'success', datas:datas});
	});
};

// Reads a specific pay refund by ID
exports.json_payrefund_read = function(req, res, next) {
	var id = req.params.id;
	var options = {};
	options.id = id;
    PayService.getPaymentRefund(options, function(err, datas){
		if (err) {
			console.error('manager json_payrefund_read err:', err);
			res.respond({code: 1004, message: 'get pay refund err:' + err, error:[{'error':'没有找到退款信息'}]});
			return;
		}
		res.respond({code:1000, message:'success', datas:datas});
	});
};

// Update pay refund
exports.json_payrefund_update = function(req, res, next) {
	var refundid = req.body && req.body.id ? req.body.id: null;
	var refundstatus = req.body.status;
	if(!refundid) {
		res.respond({code:1001, message:'请填写refund ID', error:[{'error':'请填写refund ID'}]});
		return;
	}
	if(refundstatus !== 0 && !refundstatus) {
		res.respond({code:1001, message:'请填写退款状态', error:[{'error':'请填写退款状态'}]});
		return;
	}
	var options = {};
	options.id = refundid;
	options.status = refundstatus;
	if (req.user) {
    	options.backendUser = req.user;
    }
    PayService.getPaymentRefund({id: refundid}, function(err, refundData){
    	if (err) {
			console.error('manager json_payrefund_read err:', err);
			res.respond({code: 1004, message: 'get pay refund err:' + err, error:[{'error':'没有找到退款信息'}]});
			return;
		}
		if (options.status === 1) {
			options.notifyPrice = refundData.price;
		}
	    PayService.updatePaymentRefund(options, function(err, datas){
			if (err) {
				console.error('manager json_payrefund_update err:', err);
				res.respond({code: 1004, message: 'update pay refund err:' + err, error:[{'error':'系统错误，更新失败'}]});
				return;
			}
			res.respond({code:1000, message:'success'});
		});
	});
};

exports.process_orders_RSCInfo_update= function(req,res,next){
	var orderId = req.data.id;
	var RSCInfo = req.data.RSCInfo;
	OrderService.updateRSCInfo(orderId, RSCInfo, function(err){
		if(err){
			res.respond({code:1002, message:err});
			return;
		}

		res.respond({code:1000, message:'success'});
	})
};

exports.lastUpdateTime = function(req, res, next){
	DashboardService.lastUpdateTime(function(err, lastUpdateTime){
		if(err){
			res.respond({code:1001, message:'获取更新时间失败'});
			return;
		}

		res.respond({code:1000, lastUpdateTime: lastUpdateTime, serviceStartTime: F.config.serviceStartTime});
	})
};

exports.getDailyReport = function(req, res, next) {
	var currentTime = new Date();
	var date = currentTime.format('yyyyMMdd');
	if (req.data.date) {
		date = new Date(req.data.date).format('yyyyMMdd');
	}

	var dailyReportResult = {
		code: 1000,
		registeredUserCount: 0,
		orderCount: 0,
		paidOrderCount: 0,
		paidAmount: 0,
		lastUpdateTime: currentTime
	};

	DashboardService.lastUpdateTime(function (err, lastUpdateTime) {
		if (err) {
			res.respond({code:1001, message:'获取更新时间失败'});
			return;
		}
		if (lastUpdateTime) {
			if (lastUpdateTime.hourly) {
				dailyReportResult.lastUpdateTime = lastUpdateTime.hourly;
			}
			DashboardService.queryDailyReport(date, date, function (err, dailyReports) {
				if (!err) {
					var dailyReport = dailyReports[0];
					dailyReportResult.registeredUserCount = dailyReport.registeredUserCount;
					dailyReportResult.orderCount = dailyReport.orderCount;
					dailyReportResult.paidOrderCount = dailyReport.paidOrderCount;
					dailyReportResult.paidAmount = parseFloat(dailyReport.paidAmount.toFixed(2));
				}

				res.respond(dailyReportResult);
			});
		} else {
			res.respond({code:1001, message:'没有获取到更新时间'});
			return;
		}
	});
};

exports.getStatistic = function(req, res, next) {
	var statisticResult = {
		code:1000,
		registeredUserCount: 0,
		orderCount: 0,
		completedOrderCount: 0,
		paidAmount: 0,
		serviceStartTime: config.serviceStartTime
	};

	DashboardService.getStatistic(function (err, statistic) {
		if (!err) {
			statisticResult.registeredUserCount = statistic.registeredUserCount;
			statisticResult.orderCount = statistic.orderCount;
			statisticResult.completedOrderCount = statistic.completedOrderCount;
			statisticResult.paidAmount = parseFloat(statistic.paidAmount.toFixed(2));
		}

		res.respond(statisticResult);
	})
};

exports.getWeeklyReport = function(req, res, next) {
	// var weekMinus = U.parseInt(req.data.week, 0);
	// var weekStartEndTime = tools.getWeekStartEndTime(weekMinus);
	// var date = weekStartEndTime.startTime.format('yyyyMMdd');
	var currentTime = new Date();
	var date = currentTime;
	if (req.data.date) {
		date = new Date(req.data.date);
	}
	var startDate = tools.getWeekStartTimeByDate(date).format('yyyyMMdd');

	var weeklyReportResult = {
		code: 1000,
		registeredUserCount: 0,
		orderCount: 0,
		paidOrderCount: 0,
		paidAmount: 0
	};

	DashboardService.queryWeeklyReport(startDate, startDate, function(err, weeklyReports){
		if(!err){
			var weeklyReport = weeklyReports[0];
			weeklyReportResult.registeredUserCount = weeklyReport.registeredUserCount;
			weeklyReportResult.orderCount = weeklyReport.orderCount;
			weeklyReportResult.paidOrderCount = weeklyReport.paidOrderCount;
			weeklyReportResult.paidAmount = parseFloat(weeklyReport.paidAmount.toFixed(2));
		}

		res.respond(weeklyReportResult);
	})
};

exports.queryDailyReport = function(req, res, next){
	var dateStart = new Date(req.data.dateStart).format('yyyyMMdd');
	var dateEnd = new Date(req.data.dateEnd).format('yyyyMMdd');

	DashboardService.queryDailyReport(dateStart, dateEnd, function(err, dailyReports){
		if(err){
			res.respond({code:1001, message:'获取每日概况失败'});
			return;
		}

		res.respond({code:1000, dailyReports:dailyReports || []});
	})
};

exports.queryWeeklyReport = function(req, res, next){
	var dateStart = tools.getWeekStartTimeByDate(new Date(req.data.dateStart)).format('yyyyMMdd');
	var dateEnd = new Date(req.data.dateEnd).format('yyyyMMdd');

	DashboardService.queryWeeklyReport(dateStart, dateEnd, function(err, WeeklyReports){
		if(err){
			res.respond({code:1001, message:'获取每周业绩失败'});
			return;
		}

		res.respond({code:1000, weeklyReports:WeeklyReports || []});
	})
};

exports.queryAgentReportYesterday = function(req, res, next){
	DashboardService.queryAgentReportYesterday(function(err, result){
		if(err){
			res.respond({code:1001, message:'获取经纪人数据失败'});
			return;
		}

		DashboardService.lastUpdateTime(function(err, lastUpdateTime){
			if(err){
				res.respond({code:1001, message:'获取更新时间失败'});
				return;
			}
			if (result) {
				res.respond({code:1000, agentReportYesterday:result.items, lastUpdateTime:lastUpdateTime.agentReport, page: result.page, pages: result.pages, count: result.count});
				return;
			}
			res.respond({code:1001, message:'没有获取到经纪人数据'});
		})
	}, req.data.sort, req.data.sortOrder, req.data.page)
};