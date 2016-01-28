/**
 * Created by pepelu on 2016/1/22.
 */
var config = require('../../configuration/mongoose_config');
var mongoose = require('mongoose');
var SKUService = require('../../services/SKU');
mongoose.connect(config.db[config.environment],{user:'xxnr',pass:'xxnr001'});

SKUService.removeSKUAttributesByName('排量', function(err){
    if(err){
        console.log(err);
    }else{
        console.log('remove 排量 done');
    }
});
SKUService.removeSKUAttributesByName('变速器', function(err){
    if(err){
        console.log(err);
    }else{
        console.log('remove 变速器 done');
    }
});
SKUService.removeSKUAttributesByName('包装规格', function(err){
    if(err){
        console.log(err);
    }else{
        console.log('remove 包装规格 done');
    }
});