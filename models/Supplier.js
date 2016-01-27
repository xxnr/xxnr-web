/**
 * Created by pepelu on 2015/12/29.
 */
var mongoose = require('mongoose');
var supplierSchema = new mongoose.Schema({
    name: {type:String, unique:true},
    description: String,
    images:[String]
});

mongoose.model('supplier', supplierSchema);