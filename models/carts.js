var mongoose = require('mongoose');
var schema = new mongoose.Schema({
    cartId:{type:String, required:true, unique:true},
    userId:{type:String, required: true},
    items:[{
        product:{type:mongoose.Schema.ObjectId, ref:'product', required:true},
        count:Number
    }],
    SKU_items:[{
        SKU:{type:mongoose.Schema.ObjectId, ref:'SKU', required:true},
        product:{type:mongoose.Schema.ObjectId, ref:'product', required:true},          // product reference for improving query performance
        category:{type:mongoose.Schema.ObjectId, ref:'category', required:true},        // category reference for improving query performance
        additions:[{type:mongoose.Schema.ObjectId, ref:'SKUAddition', required:true}],  // the additions added to cart
        count:Number
    }]
});

mongoose.model('cart', schema);

// Keep these old schema to do convert
var cartItemSchema = new mongoose.Schema({
    'productId' : {type:String, required: true},
	'count' : {type: Number, required: true},
	'cartId' : {type: String, required: true, index: true}
});

mongoose.model('cart_item', cartItemSchema);

//mongoose.set('debug', true);