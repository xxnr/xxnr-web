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
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;

exports.install = function() {
	// Auto-localize static HTML templates
	F.localize('All templates', '/templates/');

	// COMMON
	F.route(CONFIG('manager-url') + '/*', 									'~manager', ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/upload/',                  			upload, ['post', 'upload'], 3084, ['backend_auth']); // 3 MB
	F.route(CONFIG('manager-url') + '/upload/base64/',           			upload_base64, ['post'], 2048, ['backend_auth']); // 2 MB

	// Products UPLOAD IMAGE
	F.route(CONFIG('manager-url') + '/products/uploadImage/',    			CKEditor_uploadImage, ['post', 'upload'], 20480, ['backend_auth']); // 20 MB

	// News UPLOAD IMAGE
	F.route(CONFIG('manager-url') + '/news/uploadImage/',    				CKEditor_uploadImage, ['post', 'upload'], 20480, ['backend_auth']); // 20 MB

	// FILES
	F.route(CONFIG('manager-url') + '/api/files/clear/',         			json_files_clear, ['get'], ['backend_auth']);

	// DASHBOARD
	F.route(CONFIG('manager-url') + '/api/dashboard/',           			json_dashboard, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/dashboard/online/',    			json_dashboard_online, ['get'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/dashboard/clear/',     			json_dashboard_clear);

	// ORDERS
	F.route(CONFIG('manager-url') + '/api/orders/',              			json_orders_query, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/orders/{id}/',         			json_orders_read, ['get'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/orders/payments/',              	json_orders_payments_update, ['put'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/orders/subOrders/',              	json_subOrders_payments_update, ['put'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/orders/products/',              	json_orders_products_update, ['put'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/orders/SKUs/',              		json_orders_SKUs_update, ['put'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/orders/',              			json_orders_save, ['put'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/orders/',              			json_orders_remove, ['delete']);
	// F.route(CONFIG('manager-url') + '/api/orders/clear/',        			json_orders_clear);

	// USERS
	F.route(CONFIG('manager-url') + '/api/users/',              			json_users_query, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/users/{id}/',         			json_users_read, ['get'], ['backend_auth']);
    F.route(CONFIG('manager-url') + '/api/users/',              			json_users_save, ['put'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/users/',              			json_users_remove, ['delete']);
	// F.route(CONFIG('manager-url') + '/api/users/clear/',        			json_users_clear);

	// BRANDS
	F.route(CONFIG('manager-url') + '/api/brands/',							json_brands,	['get'],['backend_auth']);

	// PRODUCTS
	F.route(CONFIG('manager-url') + '/api/products/',            			json_products_query, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/products/',            			json_products_save, ['post'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/products/updateStatus',			process_products_updateStatus, ['post'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/products/{id}/',       			json_products_read, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/products/',            			json_products_remove, ['delete'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/products/clear/',      			json_products_clear);
	F.route(CONFIG('manager-url') + '/api/products/import/',     			json_products_import, ['upload'], 1024, ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/products/categories/', 			json_products_categories, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/products/category/',   			json_products_category_replace, ['post'] ,['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/products/attr/{attributeName}/',	json_products_attribute, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/products/attribute/add',			process_product_attributes_add,	['post'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/products/attributes/',			json_products_attributes, ['get'], ['backend_auth']);

	// NEWS
	F.route(CONFIG('manager-url') + '/api/news/',            				json_news_query, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/news/',            				json_news_save, ['post'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/news/{id}/',       				json_news_read, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/news/updatestatus/',            	json_news_updatestatus, ['post'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/news/',            				json_news_remove, ['delete'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/news/categories/', 				json_news_categories, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/news/category/',   				json_news_category_replace, ['post'], ['backend_auth']);

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
	F.route(CONFIG('manager-url') + '/api/newsletter/',          			json_newsletter, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/newsletter/csv/',      			file_newsletter, ['get'], ['backend_auth']);
	// F.route(CONFIG('manager-url') + '/api/newsletter/clear/',    			json_newsletter_clear);

	// SETTINGS
	F.route(CONFIG('manager-url') + '/api/settings/',            			json_settings, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/settings/',            			json_settings_save, ['put', '*Settings'], ['backend_auth']);

	// SYSTEM
	F.route(CONFIG('manager-url') + '/api/backup/website/',      			file_backup_website, [15000], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/backup/database/',     			file_backup_database, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/restore/database/',    			file_restore_database, ['upload', 15000], 20000, ['backend_auth']);

    // backend user
    F.route(CONFIG('manager-url') + '/api/login/',                          process_login, ['post']);
    F.route(CONFIG('manager-url') + '/api/backend/user/create/',            process_createUser, ['post'], ['backend_auth']);
    F.route(CONFIG('manager-url') + '/api/backend/users',                   json_be_users, ['get'], ['backend_auth']);
    F.route(CONFIG('manager-url') + '/api/backend/user/password/modify',    process_modify_password, ['post']);
    F.route(CONFIG('manager-url') + '/api/backend/users/',                  json_be_users_update, ['post'], ['backend_auth']);

    // permission
    F.route(CONFIG('manager-url') + '/api/permissions/',                    json_permissions, ['get'], ['backend_auth']);

    // role
    F.route(CONFIG('manager-url') + '/api/roles/',                          json_roles, ['get'], ['backend_auth']);

    // business
    F.route(CONFIG('manager-url') + '/api/businesses/',                     json_businesses,['get'], ['backend_auth']);

	// SKU
	F.route(CONFIG('manager-url') + '/api/v2.1/SKU/add/',               process_SKU_add,                ['post'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/v2.1/SKU/update/{id}',               process_SKU_update,             ['post'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/v2.1/SKU/attribute/add/',     process_SKU_Attribute_add,      ['post'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/v2.1/SKU/attributes',         json_SKU_Attributes_get,        ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/v2.1/SKU/query',				json_SKU_get,					['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/v2.1/SKU/online/{id}',			process_SKU_online,				['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/v2.1/SKU/additions',				json_SKU_Additions_get,		['get'],['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/v2.1/SKU/addition/add',			process_SKU_Addition_add,	['post'],['backend_auth']);

	// potential customer
	F.route(CONFIG('manager-url') + '/api/v2.1/potentialCustomer/query',	json_potential_customer_query,	['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/v2.1/potentialCustomer/{_id}',	json_potential_customer_get, ['get'], ['backend_auth']);
	F.route(CONFIG('manager-url') + '/api/v2.1/agentinfo/{_id}',				json_agent_info_get, ['get'], ['backend_auth']);
};

var files = DB('files', null, require('total.js/database/database').BUILT_IN_DB).binary;

// ==========================================================================
// COMMON
// ==========================================================================
var moment = require('moment');

// CKEditor Upload picture
function CKEditor_uploadImage() {

	var self = this;
	var CKEditorFuncNum = self.query["CKEditorFuncNum"];
	var id = '';
	var default_extension = '.jpg';
	var type_avail = ['png', 'jpg', "jpeg"]

	self.files.wait(function(file, next) {
		file.read(function(err, data) {
			// Store current file into the HDD
			var index = file.filename.lastIndexOf('.');
			file.extension = file.filename.substring(index+1);

			if (type_avail.find(file.extension.toLowerCase())) {
				if (file.length <= 2*1024*1024) {
					id = files.insert(file.filename, file.type, data) + default_extension;
					var host = self.req.uri.host;
					var url = "http://" + host;
			        //var imageurl = url + "/images/original/" + id;
			        var imageurl = "/images/original/" + id;
			        var options = {'callback':CKEditorFuncNum, 'imageurl':imageurl, 'message':''};
			        self.view('uploadImageResponse', options);
			    } else {
			    	var options = {'callback':CKEditorFuncNum, 'imageurl':'', 'message':'文件大小不得大于2M'};
		        	self.view('uploadImageResponse', options);
			    }
	    	} else {
	    		var options = {'callback':CKEditorFuncNum, 'imageurl':'', 'message':'文件格式不正确（必须为.jpg/.png文件）'};
		        self.view('uploadImageResponse', options);
	    	}
		});
	});	
}

// Upload (multiple) pictures
function upload(callback) {

	var self = this;
	var async = [];
	var id = [];

	self.files.wait(function(file, next) {
		file.read(function(err, data) {
			// Store current file into the HDD
			var index = file.filename.lastIndexOf('.');

			if (index === -1)
				file.extension = '.dat';
			else
				file.extension = file.filename.substring(index);

			id.push(files.insert(file.filename, file.type, data) + file.extension);

			// Next file
			setTimeout(next, 100);
		});

	}, function() {
		// Returns response
		callback ? callback(id) : self.json(id);
	});
}

// Upload base64
function upload_base64() {
	var self = this;

	if (!self.body.file) {
		self.json(null);
		return;
	}

	var type = self.body.file.base64ContentType();
	var data = self.body.file.base64ToBuffer();
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

	self.json('/download/' + id);
}

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

	self.json(SUCCESS(true));
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
		self.json(model);
	});
}

// Reads online users
function json_dashboard_online() {
	var self = this;
	var counter = MODULE('webcounter');
	var memory = process.memoryUsage();
	var model = {};
	model.visitors = counter.online();
	model.today = counter.today();
	model.last = counter.today().last;
	model.memoryused = (memory.heapUsed / 1024 / 1024).floor(2);
	model.memorytotal = (memory.heapTotal / 1024 / 1024).floor(2);
	self.json(model);
}

// Clear visitor statistics
function json_dashboard_clear() {
	var self = this;
	var instance = MODULE('webcounter').instance;

	F.fs.rm.database('webcounter.nosql');
	F.fs.rm.database('webcounter.cache');

	Object.keys(instance.stats).forEach(function(key) {
		instance.stats[key] = 0;
	});

	self.json(SUCCESS(true));
}

// ==========================================================================
// PRODUCTS
// ==========================================================================

// Gets all products
function json_products_query() {
	var self = this;

	ProductService.query(self.query, self.callback());
}

// Saves (update or create) specific product
function json_products_save() {
	var self = this;

    ProductService.save(self.body, function(err, product){
		if(err){
			self.respond({code:1001, message:err});
			return;
		}

		self.respond({code:1000, product:product});
	});

	// Clears view cache
	setTimeout(function() {
		F.cache.removeAll('cache.');
	}, 2000);
}

function process_products_updateStatus(){
	var self = this;
	ProductService.updateStatus(self.body._id, self.body.online, function(err){
		if(err){
			self.respond({code:1001, message:err});
			return;
		}

		self.respond({code:1000});
	})
}

// Removes specific product
function json_products_remove() {
	var self = this;
	ProductService.remove(self.body.id, self.callback());
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
function json_products_categories() {
	var self = this;

	CategoryService.all(function(err, categories){
		if(err){
			self.respond({code:1001, message:'fail to query category'});
			return;
		}

		self.respond(categories);
	})
}

// Replaces old category with new
function json_products_category_replace() {
	var self = this;
	ProductService.workflow('category', null, self.body, self.callback(), true);
}

// Reads all product attributes (brands models engines gearboxes levels etc.)
function json_products_attribute(attributeName) {
	var self = this;
	var category = self.data.category;
	var brand = self.data.brand;
	ProductService.getAttributes(category, brand, attributeName, function (err, attributes) {
		if (err) {
			console.error('query attributes error', err);
			self.respond({code: 1001, message: '获取商品属性列表失败', error: err});
			return;
		}

		self.respond(attributes.length > 0 ? attributes[0].values || [] : []);
	})
}

function json_brands(){
	var self = this;
	var category = self.data.category;
	BrandService.query(category, function(err, brands){
		if(err){
			console.error('query brands error', err);
			self.respond({code:1001, message:'获取品牌列表失败', error:err});
			return;
		}

		self.respond({code:1000, brands:brands});
	})
}

function json_products_attributes(){
	var self = this;
	ProductService.getAttributes(self.data.category, self.data.brand, self.data.name, function(err, attributes){
		if (err) {
			console.error('query attributes error', err);
			self.respond({code: 1001, message: '获取商品属性列表失败', error: err});
			return;
		}

		self.respond({code:1000, message:'success', attributes:attributes});
	}, 1)
}

// Reads a specific product by ID
function json_products_read(id) {
	var self = this;
	var options = {};
	options.id = id;
	ProductService.get(options, self.callback());
}

// ==========================================================================
// ORDERS
// ==========================================================================

// Reads all orders
function json_orders_query() {
    var self = this;
    OrderService.query(self.query, function (err, orders) {
    	if (err) {
			console.log('manager json_orders_query err: ' + err);
			self.json(err);
			return;
		}
        if (orders) {
	        var items = orders.items;
	        var length = items.length;
	        for (var i = 0; i < length; i++) {
                var item = items[i];
                // 订单合成状态
                item.typeValue = OrderService.orderType(item);
                var orderInfo = {'totalPrice':item.price.toFixed(2), 'deposit':item.deposit.toFixed(2), 'dateCreated':item.dateCreated, 'orderStatus': OrderService.orderStatus(item)};
                if (item.payStatus == PAYMENTSTATUS.PAID && item.datePaid) {
                    orderInfo.datePaid = item.datePaid;
                }
                if (item.payStatus == DELIVERSTATUS.DELIVERED && item.dateDelivered) {
                    orderInfo.dateDelivered = item.dateDelivered;
                }
                if (item.confirmed && item.dateCompleted) {
                    orderInfo.dateCompleted = item.dateCompleted;
                }
                item.order = orderInfo;
            }
        }
        self.json(orders);
    });
}

// Updates specific order sub order payments
function json_subOrders_payments_update() {
	var self = this;
	var orderid = self.body && self.body.id ? self.body.id: null;
	var subOrders = self.body && self.body.subOrders ? self.body.subOrders: null;
	if (!orderid) {
		self.json([{'error':'更新失败，缺少订单ID'}]);
		return;
	}
	if (!subOrders) {
		self.json([{'error':'更新失败，缺少子订单列表'}]);
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
    OrderService.updatePayments({'id':orderid,'payments':updatepayments}, function(err) {
		if (err) {
			console.log('manager json_subOrders_payments_update err: ' + err);
			self.json([{'error':'更新失败'}]);
			return;
		}
		self.json(SUCCESS(true));
	});
}

// Updates specific order products
function json_orders_products_update() {
	var self = this;
	var orderid = self.body && self.body.id ? self.body.id: null;
	var products = self.body && self.body.products ? self.body.products: null;
	if (!orderid) {
		self.json([{'error':'更新失败，缺少订单ID'}]);
		return;
	}
	if (!products) {
		self.json([{'error':'更新失败，缺少商品列表'}]);
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
			console.log('manager json_orders_products_update err: ' + err);
			self.json([{'error':'更新失败'}]);
			return;
		}
		self.json(SUCCESS(true));
	});
}

// Updates specific order SKUs
function json_orders_SKUs_update() {
	var self = this;
	var orderid = self.body && self.body.id ? self.body.id: null;
	var SKUs = self.body && self.body.SKUs ? self.body.SKUs: null;
	if (!orderid) {
		self.json([{'error':'更新失败，缺少订单ID'}]);
		return;
	}
	if (!SKUs) {
		self.json([{'error':'更新失败，缺少商品列表'}]);
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
    OrderService.updateSKUs({'id':orderid,'SKUs':updateSKUs}, function(err) {
		if (err) {
			console.log('manager json_orders_SKUs_update err: ' + err);
			self.json([{'error':'更新失败'}]);
			return;
		}
		self.json(SUCCESS(true));
	});
}

// Saves specific order (order must exist)
// function json_orders_save() {
// 	var self = this;
// 	OrderService.save(self.body, function(err) {
// 		if (err) {
// 			console.log('manager json_orders_save err' + err);
// 			self.json([err]);
// 			return;
// 		}
// 		self.json(SUCCESS(true));
// 	});

// }

// // Removes specific order
// function json_orders_remove() {
// 	var self = this;
// 	OrderService.remove(self.body.id, self.callback());
// }

// // Clears all orders
// function json_orders_clear() {
// 	var self = this;
// 	GETSCHEMA('Order').workflow('clear', null, null, self.callback(), true);
// }

// Reads a specific order by ID
function json_orders_read(id) {
	var self = this;
	var options = {};
	options.id = id;
	
	OrderService.get(options, function(err, order){
        self.json(convertOrderToShow(order));
    });
}

var convertOrderToShow = function(order){
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
			subOrder.price = parseFloat(subOrder.price.toFixed(2));
			subOrder.paidPrice = parseFloat(paidPrice.toFixed(2));
			subOrder.paidTimes = paidTimes;
			subOrder.closedTimes = closedTimes;
			subOrder.payments = payments;
			subOrder.datePaid = datePaid;
			subOrders.push(subOrder);
		}
		order.subOrders = subOrders;
	}
	delete order.payments;

	// order status and type
	if (order) {
		order.price = parseFloat(order.price.toFixed(2));
		if (order.deposit)
			order.deposit = parseFloat(order.deposit.toFixed(2));
		if (order.duePrice)
			order.duePrice = parseFloat(order.duePrice.toFixed(2));
		// 订单合成状态
        order.orderType = OrderService.orderType(order);
		var orderInfo = {'totalPrice':parseFloat(order.price.toFixed(2)),'deposit':parseFloat(order.deposit.toFixed(2)),'dateCreated':order.dateCreated, 'orderStatus': OrderService.orderStatus(order)};
        if (order.payStatus == PAYMENTSTATUS.PAID && order.datePaid) {
            orderInfo.datePaid = order.datePaid;
        }
        if (order.payStatus == DELIVERSTATUS.DELIVERED && order.dateDelivered) {
            orderInfo.dateDelivered = order.dateDelivered;
        }
        if (order.confirmed && order.dateCompleted) {
            orderInfo.dateCompleted = order.dateCompleted;
        }
        order.order = orderInfo;
	}

    return order;
};

// ==========================================================================
// USERS
// ==========================================================================

// Reads all users
function json_users_query() {
	var self = this;

	UserService.query(self.query, self.callback());
}

// Saves specific user (user must exist)
function json_users_save() {
	var self = this;
    if(!self.data.id){
        self.respond({code:1001, message:'id required'});
    }

    var options = {};

    if(self.data.id)
        options.id = self.data.id;
    if(self.data.type)
        options.type = self.data.type;
	if(self.data.typeVerified)
		options.typeVerified = self.data.typeVerified;

	// self.body.$save(self.callback());
	UserService.update(options, function(err){
        if(err){
            self.respond({code:1001, message:err});
            return;
        }

        self.respond({code:1000, message:'success'});
    });
}

// // Removes specific user
// function json_users_remove() {
// 	var self = this;
// 	UserService.remove(self.body.id, self.callback());
// }

// Reads a specific user by ID
function json_users_read(id) {
	var self = this;
	var options = {};
	options.userid = id;
	UserService.get(options, function(err, user) {
        if (err) {
            self.respond({code: 1001, message: 'get user err:' + err});
            return;
        }

		self.respond({code: 1000, user: user});
    });
}

// ==========================================================================
// NEWS
// ==========================================================================

// Gets all news
function json_news_query() {
	var self = this;
	NewsService.query(self.query, self.callback());
}

// Saves (update or create) specific new
function json_news_save() {
	var self = this;
    NewsService.save(self.body, self.callback());
}

// Update specific new status
function json_news_updatestatus() {
	var self = this;
    NewsService.updatestatus(self.body, self.callback());
}

// Removes specific new
function json_news_remove() {
	var self = this;
    NewsService.remove(self.body, self.callback());
}

// Reads all news categories
function json_news_categories() {
	var self = this;

	// if (!F.global.newscategories)
	// 	F.global.newscategories = [];

	// self.json(F.global.newscategories);
    NewsService.queryCategory({}, function (err, result) {
        if (err || !result) {
            self.json([]);
            return;
        }
		var length = result.length;
		var arr = [];
		for (var i = 0; i < length; i++) {
			var category = result[i];
			arr[i] = { name: category.name, linker: category.name, count: category.count };
		}
        self.json(arr);
    });
}

// Replaces old category with new
function json_news_category_replace() {
	var self = this;
    NewsService.category(self.body, self.callback());
}

// Reads a specific new by ID
function json_news_read(id) {
	var self = this;
	var options = {};
	options.id = id;
    NewsService.get(options, self.callback());
}

// ==========================================================================
// PAGES
// ==========================================================================

// Gets all pages
function json_pages_query() {
	var self = this;
	GETSCHEMA('Page').query(self.query, self.callback());
}

// Creates HTML preview
function view_pages_preview() {
	var self = this;
	self.layout('layout-preview');
	self.repository.preview = true;
	self.repository.page = self.body;
	self.view('~cms/' + self.body.template);
}

// Gets dependencies for Pages (templates and navigations)
function json_pages_dependencies() {
	var self = this;
	self.json({ templates: F.config.custom.templates, navigations: F.config.custom.navigations });
}

// Saves (update or create) specific page
function json_pages_save() {
	var self = this;

	// Is auto-creating URL?
	if (self.body.url[0] === '-')
		self.body.$async(self.callback(), 1).$workflow('create-url').$save();
	else
		self.body.$save(self.callback());

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
	GETSCHEMA('Page').remove(self.body.id, self.callback());
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
	GETSCHEMA('Widget').query(self.query, self.callback());
}

// Saves (updates or creates) specific widget
function json_widgets_save() {
	var self = this;
	self.body.$save(self.callback());

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
	GETSCHEMA('Widget').remove(self.body.id, self.callback());
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
	self.body.$async(self.callback(), 0).$save().$workflow('load');
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
		self.json(SUCCESS(true));
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
	var self = this;
	GETSCHEMA('Newsletter').workflow('clear', null, null, self.callback(), true);
}

// backend user
function process_login(){
    var self = this;

    if (!self.data.account){
        self.respond({code:1001,message:'请输入账号'});
        return;
    }

    if (!self.data.password){
        self.respond({code:1001,message:'请输入密码'});
        return;
    }

    var options = {};
    options.account = self.data.account;
    options.password = tools.decrypt_password(decodeURI(self.data.password));
//    options.password = self.data.password;
    BackEndUserService.login(options, function(err, user){
        if(err){
            // login fail
            console.log('backend user process_login err: ' + err);
            self.respond({code:1001, message:'用户名密码错误'});
            return
        }

        // login success
        // set cookie
        setCookieAndResponse.call(self, user, false);
    });
}

function process_createUser(){
    var self = this;
    var user = self.user;

    if(!self.data.account || !self.data.password || !self.data.role){
        self.respond({code:1001, message:'need account, password and role'});
        return;
    }

    self.data.password = tools.decrypt_password(decodeURI(self.data.password));
    if(!user.business) {
        // must have business id
        self.respond({code: 1001, message: 'need business'});
        return;
    }

    self.data.business = user.business;

    if(self.data.role._id){
        self.data.role = self.data.role._id;
    }

    if(self.data.business._id){
        self.data.business = self.data.business._id;
    }

    BackEndUserService.create(self.data, function(err, user){
        if(err){
            self.respond({code:1001, message:err});
            return;
        }

        self.respond({code:1000, user:user, message:'success'});
    });
}

var setCookieAndResponse = function(user, keepLogin){
    var self = this;

    // Set cookie
    var options = {_id:user._id};
    var userAgent = self.data['user-agent'];
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
            self.respond({code:1001, message:'登录失败'});
            return;
        }

        if(keepLogin){
            if(F.isDebug){
                self.res.cookie(F.config.backendtokencookie, token, new Date().add(F.config.token_cookie_expires_in));
            }else {
                self.res.cookie(F.config.backendtokencookie, token, new Date().add(F.config.token_cookie_expires_in), {domain: F.config.domain});
            }
        }else{
            if(F.isDebug){
                self.res.cookie(F.config.backendtokencookie, token);
            }else {
                self.res.cookie(F.config.backendtokencookie, token, null, {domain: F.config.domain});
            }
        }

        // Return results
        var result = {'code': '1000', 'message': 'success', 'datas': user, token:token};
        self.respond(result);
    });
};

function json_permissions(){
    var self = this;
    AuthService.getPermissionList(self.callback());
}

function json_be_users(){
    var self=this;
    BackEndUserService.getUserList(self.callback());
}

function json_roles(){
    var self = this;
    AuthService.getRoleList(self.callback());
}

function process_modify_password(){
    var self = this;
    if(!self.data.account){
        self.respond({code:1001, message:'need account'});
        return;
    }

    if(!self.data.oldPwd){
        self.respond({code:1001, message:'need oldPwd'});
        return;
    }

    if(!self.data.newPwd){
        self.respond({code:1001, message:'need newPwd'});
        return;
    }

    var decryptedNewPwd = tools.decrypt_password(decodeURI(self.data.newPwd));
    var decryptedOldPwd = tools.decrypt_password(decodeURI(self.data.oldPwd));
    if (decryptedNewPwd.length < 6) {
        self.respond({'code': '1001', 'message': '新密码长度需不小于6位'});
        return;
    }
    if (decryptedNewPwd === decryptedOldPwd) {
        self.respond({'code': '1001', 'message': '新密码与旧密码不能一致'});
        return;
    }
    BackEndUserService.validate_password(self.data.account, decryptedOldPwd, function(err, valid){
        if(err){
            self.respond({code:1001, message:err});
            return;
        }

        if(!valid){
            self.respond({code:1001, message:'密码错误'});
            return;
        }

        BackEndUserService.update(self.data, function(err){
            if(err){
                self.respond({code:1001, message:'更新失败'});
                return;
            }

            self.respond({code:1000, message:'success'});
        })
    })
}

function json_be_users_update(){
    var self = this;
    if(self.data.password) {
        self.data.password = tools.decrypt_password(decodeURI(self.data.password));
    }

    if(self.data.role._id){
        self.data.role = self.data.role._id;
    }

    if(self.data.business && self.data.business._id){
        self.data.business = self.data.business._id;
    }

    BackEndUserService.update(self.data, function(err){
        if(err){
            self.respond({code:1001, message:err});
            return;
        }

        self.respond({code:1000, message:'success'});
    });
}

function json_businesses(){
    var self= this;
    BackEndUserService.getBusinessList(self.callback());
}

function process_SKU_add() {
	var self = this;
	if (!self.data.name) {
		self.respond({code: 1001, message: '请输入SKU名称'});
		return;
	}

	if (!self.data.product) {
		self.respond({code: 1001, message: '请选择商品'});
		return;
	}

	if (!self.data.price || !self.data.price.platform_price) {
		self.respond({code: 1001, message: '请输入平台价'});
		return;
	}

	SKUService.addSKU(self.data.name, self.data.product, self.data.attributes, self.data.additions, self.data.price, function (err, SKU) {
		if (err) {
			console.error('process_SKU_add error', err);
			if(11000 == err.code){
				self.respond({code:1001, message:'相同属性的SKU已经添加过了'});
			} else {
				self.respond({code: 1001, message: '添加失败'});
			}

			return;
		}

		self.respond({code: 1000, message: 'success', SKU: SKU});
	})
}

function process_SKU_update(id){
	var self = this;
	if(!self.data.price || !self.data.price.platform_price){
		self.respond({code:1001, message:'请输入平台价'});
		return;
	}

	SKUService.updateSKU(id, self.data.price, self.data.attributes, self.data.additions, self.data.name, function(err){
		if(err){
			console.error('updateSKU error', err);
			if(11000 == err.code){
				self.respond({code:1001, message:'相同属性的SKU已经添加过了'});
			} else {
				self.respond({code: 1001, message: '更新SKU失败'});
			}
			return;
		}

		self.respond({code:1000, message:'success'});
	})
}

function process_SKU_Attribute_add(){
	var self = this;
	if(!self.data.category){
		self.respond({code:1001, message:'请填写category'});
		return;
	}

	if(!self.data.brand){
		self.respond({code:1001, message:'请填写brand'});
		return;
	}

	if(!self.data.name){
		self.respond({code:1001, message:'请填写name'});
		return;
	}

	if(!self.data.value){
		self.respond({code:1001, message:'请填写value'});
		return;
	}

	SKUService.addSKUAttribute(self.data.category, self.data.brand, self.data.name, self.data.value, null, function(err, attribute){
		if(err){
			console.error('process_SKU_Attribute_add error', err);
			if(11000 == err.code){
				self.respond({code:1001, message:'相同的SKU属性已经添加过了'});
			} else {
				self.respond({code: 1001, message: '添加SKU属性失败'});
			}
			return;
		}

		self.respond({code:1000, message:'success', attribute:attribute});
	})
}

function json_SKU_Attributes_get(){
	var self = this;
	SKUService.querySKUAttributes(self.data.category, self.data.brand, function(err, attributes){
		if(err){
			console.error('json_SKU_Attributes_get error', err);
			self.respond({code:1001, message:'获取SKU属性失败'});
			return;
		}

		self.respond({code:1000, message:'success', attributes:attributes});
	})
}

function process_product_attributes_add(){
	var self = this;
	ProductService.addAttribute(self.data.category, self.data.brand, self.data.name, self.data.value, null, function(err, new_attribute){
		if(err){
			if(11000 == err.code){
				self.respond({code:1001, message:'相同的商品属性已经添加过了'});
			} else {
				self.respond({code: 1001, message: '保存商品属性失败'});
			}
			return;
		}

		self.respond({code:1000, message:'succcess', attribute:new_attribute});
	})
}

function json_SKU_get(){
	var self = this;
	SKUService.querySKUByProductId(self.data.product, function(err, SKUs){
		if(err){
			console.log(err);
			self.respond({code:1001, message:'查询SKU失败'});
			return;
		}

		self.respond({code:1000, message:'success', SKUs:SKUs});
	})
}

function process_SKU_online(id){
	var self = this;
	if(typeof self.data.online == 'undefiled'){
		self.respond({code:1001, message:"请填写上架与否"});
		return;
	}

	SKUService.online(id, self.data.online, function(err, doc){
		if(err){
			console.log(err);
			self.respond({code:1001, message:'更新SKU失败'});
			return;
		}

		self.respond({code:1000, message:'success', SKU:doc});
	})
}

function json_SKU_Additions_get(){
	var self = this;
	SKUService.querySKUAdditions(self.data.category, self.data.brand, function(err, additions){
		if(err){
			console.error('json_SKU_Attributes_get error', err);
			self.respond({code:1001, message:'获取SKU属性失败'});
			return;
		}

		self.respond({code:1000, message:'success', additions:additions});
	})
}

function process_SKU_Addition_add(){
	var self = this;
	SKUService.addSKUAddition(self.data.category, self.data.brand, self.data.name, self.data.price, function(err, addition){
		if(err){
			console.error('process_SKU_Addition_add error', err);
			self.respond({code:1001, message:'添加SKU附加属性失败'});
			return;
		}

		self.respond({code:1000, message:'success', addition:addition});
	})
}

function json_potential_customer_query(){
	var self = this;
	PotentialCustomerService.queryPage(null, self.data.page-1, self.data.max, function(err, customers, count, pageCount){
		if(err){
			self.respond({code:1001, message:'获取潜在客户列表失败'});
			return;
		}

		self.respond({code:1000, message:'success', potentialCustomers:customers, count:count, pageCount:pageCount});
	}, self.data.search, true)
}

function json_potential_customer_get(_id){
	var self = this;
	PotentialCustomerService.getById(_id, function(err, customer){
		if(err){
			self.respond({code:1001, message:'获取潜在客户详情失败'});
			return;
		}

		if(customer.isRegistered){
			UserService.getByAccount(customer.phone, function(err, user){
				if(err){
					self.respond({code:1001, message:'获取潜在客户信息失败'});
					return;
				}

				if(user && user.inviter) {
					customer.inviter = user.inviter;
				}

				self.respond({code:1000, potentialCustomer:customer});
			})
		} else{
			self.respond({code:1000, potentialCustomer:customer});
		}
	})
}

function json_agent_info_get(id){
	var self = this;
	UserService.get({userid:id}, function(err, user){
		if(err || !user){
			self.respond({code:1001, message:'获取新农经纪人信息失败'});
			return;
		}

		PotentialCustomerService.getStatistic(user._id, function(err, totalCount, registeredAndBindedCount){
			if(err){
				self.respond({code:1001, message:'获取新农经纪人信息失败'});
				return;
			}

			self.respond({code:1000, agent:{name:user.name, phone: user.account, address:user.address, totalCount:totalCount, registeredAndBindedCount:registeredAndBindedCount}});
		})
	})
}