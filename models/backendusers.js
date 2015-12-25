/**
 * Created by pepelu on 2015/11/23.
 */
var mongoose = require('mongoose');

// Schema
var BackEndUserSchema = new mongoose.Schema({
    account: {type: String, required: true, unique: true},
    password:{type: String, required: true},
    dateCreated:{type: Date, default: Date.now},
    role: {type:mongoose.Schema.ObjectId, ref:'role'},              // user role id
    business: {type:mongoose.Schema.ObjectId, ref:'business'},       //the business id user belongs
    webLoginId: String,
    appLoginId: String
});

mongoose.model('backenduser', BackEndUserSchema);
