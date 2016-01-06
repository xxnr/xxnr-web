/**
 * Created by pepelu on 2015/12/23.
 */
var mongoose = require('mongoose');
var SKUSchema = new mongoose.Schema({
    name: {type: String},                                       // sku name, will be like %productname%_%serialnumber%
    product: {type: mongoose.Schema.ObjectId, ref: 'product', required: true},   // product reference
    attributes: [{                                                             // sku attributes, list all attributes this sku has, will be like [{name:车型,value:舒适性}, {name:排量,value:1.5L}]
        ref: {type: mongoose.Schema.ObjectId, ref:'SKUAttribute'},
        name: {type: String, required: true},         // attribute name
        value: {type: String, required: true}          // attribute value
    }],
    additions: [{                                                               // sku additions, list all additions of this sku, will be like [{name:全景天窗,price:2000}, {name:大灯, price:1000}]
        ref: {type: mongoose.Schema.ObjectId, ref:'SKUAddition'},
        name:{type:String, required: true},
        price:{type:Number, required: true}
    }],
    price: {                                                                   // price of sku
        market_price: {type: Number},                  // market price
        platform_price: {type: Number, required: true} // platform price
    }
});

var SKUAttributesSchema = new mongoose.Schema({
    name: {type: String, required: true},                                          // name of attribute, will be like 车型
    value:{type:String, required: true},                                           // all values of this attribute, will be like 舒适性,豪华型
    category: {type: String, required: true},   // category
    brand: {type: mongoose.Schema.ObjectId, ref: 'brand', required: true}          // brand
});

var SKUAdditionsSchema = new mongoose.Schema({              // sku additions, list all additions for one category/brand, will be like {name:全景天窗,price:2000}...
    name:{type:String, required:true},
    price:{type:Number, required:true},
    category:{type: String, required: true},
    brand: {type: mongoose.Schema.ObjectId, ref: 'brand', required: true}
});

// indexes
SKUSchema.index({product:1});
SKUSchema.index({name:1, product:1}, {unique:true});
SKUAttributesSchema.index({category:1, brand:1, name:1, value:1}, {unique:true});
SKUAttributesSchema.index({category:1, brand:1, name:1});
SKUAdditionsSchema.index({category:1, brand:1, name:1}, {unique:true});
SKUAdditionsSchema.index({category:1, brand:1});

mongoose.model('SKU', SKUSchema);
mongoose.model('SKUAttribute', SKUAttributesSchema);
mongoose.model('SKUAddition', SKUAdditionsSchema);