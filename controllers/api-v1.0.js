
// API for e.g. Mobile application
// This API uses the website

exports.install = function() {
	F.route('/api/v1.0/getProductDetails/', getProductDetails, ['post', 'get']);
	F.route('/api/v1.0/products/', getProducts, ['post', 'get']);
	F.route('/api/v1.0/products/categories/', getCategories);
	F.route('/api/v1.0/getShoppingCart', getShoppingCart);
    F.route('/api/v1.0/updateShoppingCart', updateShoppingCart);
    F.route('/app/v1.0/addToCart', updateShoppingCart);
    F.route('/app/shopCart/getShopCartList', getShoppingCart);
    F.route('/app/shopCart/changeNum', updateShoppingCart);
    F.route('/app/shopCart/addToCart', updateShoppingCart);
	F.route('/app/goods/getGoodsListPage', getGoodsListPage);
	F.route('/app/goods/getGoodsDetails', getGoodsDetails);
};

var converter = require('../common/converter');
var api10 = converter.api10;

function getProducts() {
	var self = this;
	var callbackName = this.query['callback']||'callback';
	
	var self = this;
	var options = {};
	var category = this.query['category'];
	var userId = this.query.userId;
	var max = this.query['max'];

	if (category)
		options.category = category;
	
	var page = this.query.page;
	
	if (page)
		options.page = page;

	if(max)
		options.max = max;

	// memorize is designed to work with view rather than api
	// Increases the performance (1 minute cache)
	//self.memorize('cache.' + category + '.' + options.page, '1 minute', DEBUG, function() {
		GETSCHEMA('Product').query(options, function(err, data) {

			if (data.items.length === 0){
				return self.throw404();
			}
			
			self.jsonp(callbackName, {'code':"1000", "message":"success",
				"products":api10.convertProducts(data.items),
				"userId": userId,
				"category":category
			});
		});
	//});
}

function getGoodsListPage(){
	var callbackName = this.query['callback']||'callback';
	var self = this;
	var userId = self.query["locationUserId"];
    var page = self.query["page"];
    var max = self.query["rowCount"];
    var category = self.query["classId"];

    var options = {};

	if (category)
		options.category = category;

	if (page)
		options.page = page;

	if(max)
		options.max = max;

	// memorize is designed to work with view rather than api
	// Increases the performance (1 minute cache)
	//self.memorize('cache.' + category + '.' + options.page, '1 minute', DEBUG, function() {
		GETSCHEMA('Product').query(options, function(err, data) {

			if (data.items.length === 0){
				return self.throw404();
			}

			var mapCategories = F.global.mapCategories || {};
			var categories = {};
			var products = api10.convertProducts(data.items);

			for(var i = 0; i<products.length; i++){
				product = products[i];
				categoryId = product.categoryId;

				if(!categories.hasOwnProperty(categoryId)){
					category = categories[product.categoryId] = {};
					category.products = [];
					category.category = mapCategories.hasOwnProperty(categoryId) ? mapCategories[categoryId] : {};
				}
				else{
					category = categories[product.categoryId];
				}
				
				category.products.push(product);
			}

			var goodsListPage = 
			{"code":"1000","message":"success",
			"datas":{"total":Object.keys(categories).length,"locationUserId":userId
			,"rows":[]}};

			for(var i in categories){
				category = categories[i];
				var goods = {"total":category.products.length,"typeName": mapCategories[i].name, /*"typeSort":5,*/
				"typeId": i,
				"rows":[]};

				for(var j =0; j<category.products.length; j++){
					var product = category.products[j];
					var good = 
					{"goodsId":product.id, "awardPoint":"","unitPrice": (product.discountPrice),
					"goodsGreatCount":(product.positiveRating || 1.0) * 100, "brandId": product.brandId,
					"brandName": product.brandName, "imgUrl": product.imgUrl,
					"allowScore": product.payWithScoresLimit,
					"thumbnail": product.thumbnail,
					"stock":"100" /*TODO*/,"originalPrice": product.price, "goodsSellCount": 2/*TODO*/,
					/*"goodsSort":3,*/ "goodsName": product.name};

					goods.rows.push(good);
				}

				goodsListPage.datas.rows.push(goods);
			}

			self.jsonp(callbackName, goodsListPage);
		});
	//});
}

function getProductDetails() {
	var self = this;
	var callbackName = this.query['callback']||'callback';
	
	var options = {};
	options.id = this.query['id'];
		
	GETSCHEMA('Product').get(options, function(err, data) {

		// TODO: error handling
		/* // NoSQL embedded database
		if (data === undefined && !util.isError(err) && (!(err instanceof Builders.ErrorBuilder))) {
			data = err;
			err = null;
		}

		if (err) {
			if (err instanceof Builders.ErrorBuilder && !viewName) {
				if (self.language)
					err.resource(self.language);
				return self.content(err.transform(), err.contentType);
			}
			return self.view500(err);
		}

		if (typeof(viewName) === 'string')
			return self.view(viewName, data);
		*/

		self.jsonp(callbackName,
		    api10.convertProduct(data)
		);
	});
}

function getGoodsDetails(){
	var self = this;
	var callbackName = this.query['callback']||'callback';
	
	var options = {};
	options.id = this.query['goodsId'];
		
	GETSCHEMA('Product').get(options, function(err, data) {
		var product = api10.convertProduct(data);
		var goodDetails = {"code":"1000","message":"success",
		"datas":{"total":1,"rows":[
		]},"locationUserId":self.query["locationUserId"]};

		var goodDetail = {"goodsId": product.id,"goodsHabitatName":null,
		"support":"<p>AAA</p>",
		"standard":"<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;参数对比如下：</p>\n\n<p><img alt=\"\" src=\"http://101.200.181.247:80/app/res/show/3352f2cba8b44ae68b42d56805fe87d5\" style=\"height:2876px; width:879px\" /></p>",
		"recommendedStar":product.stars,
		"awardPoint":"",
		"unitPrice": (product.discountPrice),
		"goodsGreatCount": (product.positiveRating || 1.0) * 100,
		"imgUrl":product.imgUrl,
		"productDesc": product.description,
		"allowScore": product.payWithScoresLimit,
		"originalPrice": product.price,
		"goodsSellCount":4/*TODO:*/,
		"description":"新生代宽适智能家庭轿车"/*TODO*/,
		"comment":null/*TODO:*/,
		"goodsName": product.name};

		goodDetails.datas.rows.push(goodDetail);
		self.jsonp(callbackName, goodDetails);
	});
}

function getCategories(){
	var self = this;
	var callbackName = this.query['callback']||'callback';
	
	if (!F.global.categories)
		F.global.categories = [];

	self.jsonp(callbackName, api10.convertCategories(F.global.categories, F.global.mapCategories));
}

function getShoppingCart(){
	var self = this;
	var callbackName = this.query['callback']||'callback';
	var userId = self.query["userId"];
    if(!userId){
        self.jsonp(callbackName, {code:1001, message:'param userId required'});
        return;
    }
    var options = {};
    options.userId = userId;
    GETSCHEMA('Cart').workflow('getOrAdd', null, options, function(err, data){
        if(err){
            if(data){
                self.jsonp(callbackName, data);
                return;
            }else{
                self.jsonp(callbackName, {code:1001, message: '获取购物车失败'});
                return;
            }
        }else {
            var options = {};
            options.cartId = data;
            GETSCHEMA('CartItem').query(options, function (err, data) {
                if (err) {
                    if (data) {
                        self.jsonp(callbackName, data);
                        return;
                    } else {
                        self.jsonp(callbackName, {code: 1001, message: '获取购物车列表失败'});
                        return;
                    }
                } else {
                    var goodDetails = {"code":"1000","message":"success",
                    "datas":{"total":0, "DiscountPrice":0, "locationUserId":self.query["locationUserId"], "totalPrice":0, "rows":[
                    ]}};
                    var options = {};
                    options.id = '';
                    var goodsCount = [];
                    for(var itemIndex=0; itemIndex<data.length; itemIndex++) {
                    	if(data[itemIndex].count == 0){
                    		GETSCHEMA('CartItem').remove({productId:data[itemIndex].productId,cartId:data[itemIndex].cartId}, null);
                    		continue;
                    	}
                        options.id += data[itemIndex].productId;
                        if(itemIndex != data.length-1){
                            options.id +=  ',';
                        }
                        goodsCount[data[itemIndex].productId] = data[itemIndex].count;
                    }
                    if(options.id == ''){
                        self.jsonp(callbackName, goodDetails);
                    }
                    GETSCHEMA('Product').query(options, function(err, data) {
                        var brands = [];
                        var brandNames = [];
                        for(var i=0; i<data.items.length; i++) {
                            var product = api10.convertProduct(data.items[i]);
                            var goodDetail = {"goodsId": product.id,
                                "unitPrice": product.discountPrice,
                                "imgUrl": product.thumbnail,
                                "productDesc": product.description,
                                "allowScore": product.payWithScoresLimit,
                                "originalPrice": product.price,
                                "goodsName": product.name,
                                "goodsCount":goodsCount[product.id]};
                            var brandName = product.brandName;
                            // console.log(product);
                            if(!brands[brandName]){
                                brands[brandName] = [];
                                brandNames.push(brandName);
                            }
                            brands[brandName].push(goodDetail);
                        }
                        //console.log(brands);
                        //console.log(brandNames[0]);
                        for(var brandNameIndex=0; brandNameIndex<brandNames.length; brandNameIndex++) {
                            //console.log(brands[brandNames[brandNameIndex]]);
                            var brand = {"brandName":brandNames[brandNameIndex], "goodsList":brands[brandNames[brandNameIndex]]};
                            goodDetails.datas.rows.push(brand);
                        }
                        self.jsonp(callbackName, goodDetails);
                    });
                }
            })
        }
    }, true);
}

function updateShoppingCart(){
    var self = this;
    var callbackName = this.query['callback']||'callback';
    var userId = self.query['userId'];
    var goodsId = self.query['goodsId'];
    var count = self.query['quantity'];
    if(!userId){
        self.jsonp(callbackName, {code:1001, message:'param userId required'});
        return;
    }
    if(!goodsId){
        self.jsonp(callbackName, {code:1001, message:'param goodsId required'});
        return;
    }
    if(!count){
        count = self.query['count'];//This is to support addToCart api
        if(!count) {
            self.jsonp(callbackName, {code: 1001, message: 'param quantity/count required'});
            return;
        }
    }
    var options = {};
    options.userId = userId;
    options.goodsId = goodsId;
    options.count = count;

    GETSCHEMA('Cart').workflow('getOrAdd', null, options, function(err, data){
        if(err){
            if(data){
                self.jsonp(callbackName, data);
                return;
            }else{
                self.jsonp(callbackName, {code:1001, message: '获取购物车失败'});
                return;
            }
        }else{
            // console.log(data);
            var options = {};
            options.cartId = data;
            options.productId = goodsId;
            options.count = count;
            GETSCHEMA('CartItem').workflow('addOrUpdate', null, options, function(err, data){
                if(err){
                    if(data){
                        self.jsonp(callbackName, data);
                        return;
                    }else{
                        self.jsonp(callbackName, {code:1001, message:'更新购物车失败'});
                        return;
                    }
                }else{
                    self.jsonp(callbackName, {code:1000, message:'success'});
                }
            }, true);
        }
    }, true);
}

