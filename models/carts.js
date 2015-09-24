// Supported operations:
// "render" renders category
// "render-multiple" renders multiple carts (uses "render")
// "breadcrumb" creates bredcrumb (uses "render")
// "clear" clears database

// Supported workflows
// "create-url"

var CartItem = NEWSCHEMA('CartItem');
CartItem.define('id', String, true);              //商品ID
CartItem.define('count', String, true);           //商品数量
CartItem.define('cartId', String, true);          //购物车ID

var Cart = NEWSCHEMA('Cart');
Cart.define('id', String, true);        //购物车Id
Cart.define('userId', String);          //用户Id

// Sets default values
Cart.setDefault(function(name) {
	switch (name) {
		case 'id':
			return new U.GUID(10);
	}
});

Cart.addWorkflow('getOrAdd', function(error, model, options, callback){
    var filter = function(doc){
        if(options.userId && doc.userId==options.userId){
            return doc;
        }
    };

    DB('carts').one(filter, function(err, cart){
        if(err){

        }else{
            if(!cart){
                var cartId = U.GUID(10);
                DB('carts').insert({cartId: cartId, userId: options.userId});
                callback(cartId);
            }else{
                callback(cart.cartId);
            }
        }
    });
});

CartItem.addWorkflow('addOrUpdate', function(error, model, options, callback){
    var count=0;
    var updater = function(doc){
        if(options.cartId && options.productId && options.cartId == doc.cartId && options.productId == doc.productId){
            doc.count = options.count;
            count++;
            return doc;
        }
        return doc;
    };

    DB('cart_items').update(updater, function(err, cartItem){
        if(count==0){

            DB('cart_items').insert(options);
            callback(options);
        }else{
            callback(cartItem);
        }
    })
});

CartItem.setQuery(function(error, options, callback){
    var filter = function(doc){
        if(options.cartId && options.cartId == doc.cartId){
            return doc;
        }
        return;
    }

    DB('cart_items').read(filter, function(err, docs){
        if(err){

        }else{
            callback(docs);
        }
    });
});

// Removes a specific category
CartItem.setRemove(function(error, options, callback) {
    var productId = options.productId;
    var cartId = options.cartId;
	// Filters for removing
	var updater = function(doc) {
 		if (doc.productId == productId && doc.cartId == cartId)
			return null;
		return doc;
	};

	// Updates database file
	DB('cart_items').update(updater, callback);

	// Refreshes internal informations e.g. sitemap
	setTimeout(refresh, 1000);
});

Cart.addWorkflow('update', function(error, model, options, callback){
    var count = 0;
    var updator = function(doc){
        if(doc.userId!=options.userId){
            return doc;
        }

        options.shops
    };

    DB('cart').update(updator, function(err, data){
        if(count==0){
            DB('cart').insert()
        }
    })
});

Cart.setGet(function(error, model, options, callback) {
	// options.id {String}

	// Filter for reading
	var filter = function(doc) {
		if (options.id && doc.id !== options.id)
			return;

		return doc;
	};

	// Gets a specific document from DB
	DB('carts').one(filter, function(err, doc) {
		if (doc){
			DB('cart_items').read(function(item){return item.cartId ==doc.cartId ? item : null; }, function(err, items){
				console.log('doc=' + JSON.stringify(doc) + ', and items = ' + JSON.stringify(items));
				var products = [];
				
				for(var i=0; i<items.length; i++){
				    products.push({"id": items[i].productId, "count":items[i].count});
				}
				
				doc.products = products;
			    callback(doc);
			});
			return;
		}

		error.push('error-404-cart');
		callback();
	});
});

// Clears database
Cart.addWorkflow('clear', function(error, model, options, callback) {

	DB('carts').clear(function() {
		setTimeout(refresh, 1000);
	});

	callback(SUCCESS(true));
});

// Refreshes internal informations (sitemap and navigations)
function refresh() {
}

setTimeout(refresh, 1000);