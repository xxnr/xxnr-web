/**
 * Created by pepelu on 2015/12/24.
 */
var mongoose = require('mongoose');
var brandSchema = new mongoose.Schema({
    parent:{type:mongoose.Schema.ObjectId, ref:'brand'},
    name: {type:String, unique:true},
    categories:[{type:String}],
    suppliers:[{type:mongoose.Schema.ObjectId, ref:'supplier'}],
    description: String,
    images:[String]
});

var model = mongoose.model('brand', brandSchema);

//mongoose.set('debug', true);
//model.on('index', function(err){
//    if(err){
//        console.error(err);
//    }else{
//        console.info()
//    }
//});