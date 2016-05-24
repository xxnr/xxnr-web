/**
 * Created by pepelu on 2015/12/29.
 */

var SKU = require('./SKU');
var async = require('async');

async.series({
        one: SKU.deploy_suppliers,
        two: SKU.deploy_brands,
        three: SKU.deploy_product_attributes,
        four: SKU.deploy_SKU_attributes
    },
    function() {
        console.log('done');
        process.exit(0);
    });