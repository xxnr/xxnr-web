/**
 * Created by pepelu on 2015/11/9.
 */
var mongoose = require('mongoose');

// Schema
var BusinessSchema = new mongoose.Schema({
    name: {type:String, required:true}  //business name
});

// Model
mongoose.model("business", BusinessSchema);
