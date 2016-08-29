/**
 * Created by pepelu on 2016/8/20.
 */
var mongoose = require("mongoose");

var schema = new mongoose.Schema({
    name:{type:String, required:true},
    category:{type:String},
    brand: {type: mongoose.Schema.ObjectId, ref: 'brand'},
    search_more: {type:Boolean, default:false},
    show_count:{type:Number, default:4},
    online:{type:Boolean, default: false},
    products:[{type:mongoose.Schema.ObjectId, ref:'product'}],
    order:{type:Number, require:true},
    date_created:{type:Date, default:Date.now}
},{
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    id: false
});

schema.index({order:1});

// virtual
schema.virtual('query').get(function(){
    var query = {};
    if(this.brand){
        query.brand = this.brand;
        if(this.brand._id){
            query.brand = this.brand._id;
        }
    }

    return query;
});

// statics
schema.statics.query = function(options, cb, populate_products, populate_brand, fields) {
    var query = {};
    if (options) {
        if (options.hasOwnProperty('online')) {
            query.online = options.online;
        }
    }

    var querier = this.find(query)
        .sort({online:-1, order: 1});
    if (populate_products) {
        querier.populate('products');
    }
    if (populate_brand){
        querier.populate('brand');
    }
    if(fields){
        querier.select(fields);
    }
    querier.exec(function(err, nominate_categories){
        cb(err, nominate_categories);
    });
};

mongoose.model('nominate_category', schema);