var mongoose = require('mongoose');

// Schema
var UserSignSchema = new mongoose.Schema({
    id_date: {type:String, unique:true, sparse: true}, //userid and sign date, unique sparse index
    datetime: Date   //datetime that user sign
});
UserSignSchema.index({"datetime":-1});

// Model
var UserSign = mongoose.model('user_sign', UserSignSchema);

// Service
UserSignDAO = function(){};

// Method
// insert obj into documents
UserSignDAO.prototype.insert = function(obj, callback){
    var instance = new UserSign(obj);
    instance.save(function(err){
        callback(err);
    })
};
// delete: delete all documents matches obj
UserSignDAO.prototype.delete = function(obj, callback){
    UserSign.find(obj).remove(function(err){
        callback(err);
    });
};

module.exports = new UserSignDAO();

