
// API for e.g. Mobile application
// This API uses the website

exports.install = function() {
	F.route('/app/order/getOderList', getOders)
	F.route('/app/order/addOrder', addOrder)
};

var converter = require('../common/converter');
var api10 = converter.api10;
var calculatePrice = require('../common/calculator').calculatePrice;

function getOders(){
	var self = this;
	var callbackName = this.query['callback']||'callback';

	var page = self.query['page'];
	var type = self.query['type'] || self.query['typeValue'];//订单类型  所有的订单
    var userId = self.query['userId'];
    var locationUserId = self.query['locationUserId'];

    var options = {};
	options.buyer = userId;
	options.page = page;
	options.type = type;

	GETSCHEMA('Order').query(options, function(err, data) {
		/* {"buyer":"a22dd2cdd8","id":"29a96ad3835843be88936015969b371d", "paymentId":"150962576218235806","CreationTime":"2015-09-21", 
		"type":"", "typeLable":"", "recipientName":"pepe", "recipientPhone":"15110101010", "address":"安徽安庆市枞阳县本地host测试2", 
		"remarks":"多發點，份要大量要足", "deliveryTime":"2015-09-21", "products":[{"id":"8954376c7e", "count":"1"}, {"id":"8954376c7e", "count":"8"}] ,
		"delivery":"UPS", "status":"partial paid"} */

		if (data.items.length === 0){
			console.log('cannot find order queried by ' + JSON.stringify(self.query));
			// return self.throw404();
		}

		var orders = data.items;
		options = {"ids":[]};

		for(var i=0; i<orders.length; i++){
			for(var j=0; j<orders[i].products.length; j++){
				options.ids.push(orders[i].products[j].id);
			}
		}

		GETSCHEMA('Product').query(options, function(err, data) {
			if (data.items.length === 0){
				console.log('cannot find products queried by ' + JSON.stringify(options));
				// return self.throw404();
			}

			var products = {};

			for(var i=0; i<data.items.length; i++){
				products[data.items[i].id] = data.items[i];
			}

			for(var i=0; i<orders.length; i++){
				orders[i].totalPrice = 0.0;

				for(var j=0; j<orders[i].products.length; j++){
					orders[i].products[j].product = api10.convertProduct(products[orders[i].products[j].id]);
					orders[i].totalPrice += calculatePrice(orders[i].products[j].product, orders[i].products[j].count, userId);
				}
			}

			// console.log('orders = ' + JSON.stringify(orders));
			self.jsonp(callbackName, orders);
		});
	});
}

function addOrder(){
	var self = this;
	var callbackName = this.query['callback']||'callback';

	var userId = self.query['userId'];
    var shopCartId = self.query.shopCartId;
    var addressId = self.query['addressId'];
    var paymentId = self.query['paymentId'] || U.GUID(10);
	
	GETSCHEMA('User').get({"userid":userId}, function(err, user) {
		console.log("order.user = " + JSON.stringify(user));
		GETSCHEMA('Useraddress').get({"id": addressId}, function(err, address) {
		    console.log("order.address = " + JSON.stringify(address));
			GETSCHEMA('Cart').get({"cartId": shopCartId}, function(err, cart) {
				//TODO: order
				var order = {"buyer":userId, "paymentId":paymentId,
				"CreationTime":new Date(), 
				"type":1, "typeLable":"", 
				"recipientName":address.receiptpeople, 
				"recipientPhone":address.receiptphone, 
				"address":address.address,
				 "remarks":"多發點，份要大量要足", 
				 "deliveryTime":"2015-09-21", 
				 "products":cart.products
				  ,"delivery":"UPS", "status":"partial paid", "payType":"在线支付"};
				  
				console.log("order = " + JSON.stringify(order));
				  
				GETSCHEMA('Order').workflow('add', order, null, function(err, data){
						if(err){
							console.log('error = ' + err);
						}

						self.jsonp(callbackName, {"id": data.value});
					}
				);
			});
		});
	});
}