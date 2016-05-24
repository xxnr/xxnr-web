/**
 * Created by pepelu on 2016/1/22.
 */
var SKUService = require('../../services/SKU');

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