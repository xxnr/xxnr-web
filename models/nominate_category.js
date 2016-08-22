/**
 * Created by pepelu on 2016/8/20.
 */
var mongoose = require("mongoose");

var schema = new mongoose.Schema({
    name:{type:String, required:true},
    category:{type:String, required:true},
    brand: {type: mongoose.Schema.ObjectId, ref: 'brand'},
    search_more: {type:Boolean, default:false},
    query:String,
    show_count:{type:Number, default:4},
    products:[{type:mongoose.Schema.ObjectId, ref:'product'}],
    order:{type:Number, require:true},
    date_created:{type:Date, default:Date.now}
});

schema.index({order:1});
mongoose.model('nominate_category', schema);