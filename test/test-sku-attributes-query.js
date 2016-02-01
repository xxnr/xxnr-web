/**
 * Created by pepelu on 2016/1/13.
 */
//var mongoose = require('mongoose');
//mongoose.connect('mongodb://127.0.0.1:27017/xxnr',{user:'xxnr',pass:'xxnr001'});
//var SKUService = require('../services/SKU');
//var product = '5649bd6d8eba3c20360afbc3';
//var attributes = [{name:"变速器", value:"自动挡"}
//    , {name:"排量", value:"6.0L"}
//    //, {name:"颜色", value:"黑色"}
//    //, {name:"车型配置", value:"白痴型"}
//];
//var startTime = new Date();
//SKUService.querySKUAttributesAndPrice(product,attributes, function(err, results){
//    var currentQuery = new Date();
//    console.log('1次index+4次并行的aggregate+一次aggregate', currentQuery-startTime);
//    console.log(JSON.stringify(results));
//});
//startTime2 = new Date();
//SKUService.queryAttributesAndPrice(product,attributes, function(err, results){
//    var currentQuery2 = new Date();
//    console.log('1次index+2次aggregate', currentQuery2-startTime2);
//    //console.log(JSON.stringify(results));
//});
//startTime3 = new Date();
//SKUService.getSKU("568d4a3caf53c4a0553d180d", function(err, SKU){
//    var currentQuery3 = new Date();
//    console.log('1次index', currentQuery3-startTime3);
//});

var client = require('mongodb').MongoClient;
client.connect('mongodb://127.0.0.1:27017/xxnr', function(err, db){
    var startTime4 = new Date();
    db.collection('skus').findOne({online:true}, function(err, doc){
        var currentQuery4 = new Date();
        console.log('1次index', currentQuery4-startTime4);
        console.log(doc);
    });
});
