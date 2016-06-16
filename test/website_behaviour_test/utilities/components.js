/**
 * Created by pepelu on 2016/6/15.
 */
var test_data = require('../test_data');
var Routing = require('../Routing');
var utils = require('../../../common/utils');

exports.prepare_SKU = function(backend_admin_token, brand_index, category, product_index, SKU, done){
    var test_product_data = test_data[category](product_index);
    Routing.Product.query_brands(test_data.category_id[test_product_data.category], backend_admin_token, function (body) {
        var brand = body.brands[brand_index];
        Routing.Product.save_product(utils.extend(test_product_data, {
            brand: brand._id
        }), backend_admin_token, function (body) {
            body.should.have.property('code', 1000);
            var product = body.product;
            Routing.Product.query_SKU_attributes(test_data.test_SKU.category, brand._id, backend_admin_token, function (body) {
                body.should.have.property('code', 1000);
                var SKU_attributes = body.attributes;
                var test_SKU_attributes = [{
                    name: SKU_attributes[0].name,
                    value: SKU_attributes[0].values[0].value,
                    ref: SKU_attributes[0].values[0].ref
                },
                    {
                        name: SKU_attributes[1].name,
                        value: SKU_attributes[1].values[0].value,
                        ref: SKU_attributes[1].values[0].ref
                    }];
                Routing.Product.create_SKU(utils.extend(test_data.test_SKU, {
                    product: product._id,
                    attributes: test_SKU_attributes
                }), backend_admin_token, function (body) {
                    body.should.have.property('code', 1000);
                    var SKU = body.SKU;
                    Routing.Product.online_SKU(SKU._id, true, backend_admin_token, function (body) {
                        body.should.have.property('code', 1000);
                        Routing.Product.online_product(product._id, true, backend_admin_token, function (body) {
                            body.should.have.property('code', 1000);
                            done(brand, product, SKU, test_SKU_attributes);
                        })
                    })
                })
            })
        })
    })
};