/**
 * Created by pepelu on 2016/5/30.
 */
var Routing = require('./Routing');
require('should-http');
var should = require('should');
var request = require('supertest');
var app = require('../../release');
var models = require('../../models');
var config = require('../../config');
var test_data = require('./test_data');
var deployment = require('../../deployment');
var utils = require('../../common/utils');
var ProductModel = models.product;
var SKUModel = models.SKU;

describe('Product', function(){
    var imgUrl = '';
    var backend_admin = test_data.backend_admin;
    var backend_admin_token;
    var test_product;
    var test_SKU;
    var test_brand;
    var test_SKU_attributes;
    before('deploy supplier, brands, product_attributes, SKU_attributes', function(done){
        deployment.deploy_SKU(done);
    });

    before('deploy roles and permissions', function(done){
        deployment.deploy_auth(done);
    });

    before('create backend admin and login', function (done) {
        Routing.User.create_backend_account(backend_admin.account, backend_admin.password, backend_admin.role, function () {
            Routing.User.backendLogin(backend_admin.account, backend_admin.password, function (err, token) {
                should.not.exist(err);
                backend_admin_token = token;
                done();
            })
        })
    });

    after('delete backend admin', function (done) {
        Routing.User.delete_backend_account(backend_admin.account, done);
    });

    before('upload ckeditor photo', function(done){
        Routing.Product.upload_product_photo(backend_admin_token, __dirname+'/test.jpg', function(text){
            var bodyRegex = /<script type="text\/javascript">[\s\S]+window\.parent\.CKEDITOR\.tools\.callFunction\(.+,'(.+)'\)[\s\S]+<\/script>/;
            text.should.match(bodyRegex);
            //imgUrl = bodyRegex.exec(text)[1];
            done();
        })
    });

    before('upload photo', function(done){
        Routing.backend_upload_photo(backend_admin_token, __dirname+'/test.jpg', function(body){
            body.should.have.a.lengthOf(1);
            var regex = /(.+)\..+/;
            body[0].should.match(regex);
            imgUrl = regex.exec(body[0])[1];
            done();
        })
    });

    before('delete all products and SKUs', function(done){
        ProductModel.find({}).remove(function(err){
            should.not.exist(err);
            SKUModel.find({}).remove(done);
        });
    });

    beforeEach('create product with SKUs', function(done){
        ProductModel.findOne({id:test_data.test_product.id}).remove(function(err) {
            should.not.exist(err);
            Routing.Product.query_brands(backend_admin_token, function(body){
                test_brand = body.brands[0];
                Routing.Product.save_product(utils.extend(test_data.test_product, {brand:test_brand._id, pictures:[imgUrl]}), backend_admin_token, function (body) {
                    body.should.have.property('code', 1000);
                    test_product = body.product;
                    Routing.Product.query_SKU_attributes(test_data.test_SKU.category, null, backend_admin_token, function(body) {
                        body.should.have.property('code', 1000);
                        test_SKU_attributes = [{name:body.attributes[0].name, value:body.attributes[0].values[0].value, ref:body.attributes[0].values[0].ref}];
                        Routing.Product.create_SKU(utils.extend(test_data.test_SKU, {product: test_product._id, attributes:test_SKU_attributes}), backend_admin_token, function (body) {
                            body.should.have.property('code', 1000);
                            test_SKU = body.SKU;
                            done();
                        })
                    })
                })
            })
        })
    });

    afterEach('delete all products and SKUs', function(done){
        ProductModel.find({}).remove(function(err){
            should.not.exist(err);
            SKUModel.find({}).remove(done);
        });
    });

    describe('new products', function(){
        it('online SKU', function(done){
            Routing.Product.web_get_product(test_product.id, function(body){
                body.should.have.properties({
                    SKUAttributes:[],
                    SKUAdditions:[],
                    referencePrice:{max:test_data.test_SKU.price.platform_price, min:test_data.test_SKU.price.platform_price},
                    SKUPrice:{min:0, max:0},
                    SKUMarketPrice:{min:0, max:0},
                    defaultSKU:null
                });
                Routing.Product.app_get_product(test_product.id, function(body){
                    body.should.containDeep({
                        code:'1000',
                        datas:{
                            SKUAttributes:[],
                            SKUAdditions:[],
                            referencePrice:{max:test_data.test_SKU.price.platform_price, min:test_data.test_SKU.price.platform_price},
                            SKUPrice:{min:0, max:0},
                            SKUMarketPrice:{min:0, max:0},
                            defaultSKU:null
                        }
                    })
                });
                Routing.Product.online_SKU(test_SKU._id, true, backend_admin_token, function(body) {
                    body.should.have.property('code', 1000);
                    Routing.Product.web_get_product(test_product.id, function(body) {
                        body.should.containDeep({
                            SKUAttributes:[{
                                name:test_SKU_attributes[0].name,
                                values:[test_SKU_attributes[0].value]
                            }],
                            SKUPrice:{max:test_data.test_SKU.price.platform_price, min:test_data.test_SKU.price.platform_price},
                            referencePrice:{max:test_data.test_SKU.price.platform_price, min:test_data.test_SKU.price.platform_price},
                            SKUMarketPrice:{max:test_data.test_SKU.price.market_price, min:test_data.test_SKU.price.market_price},
                            defaultSKU:{
                                ref:test_SKU._id,
                                name:test_SKU.name,
                                online:true,
                                price:{
                                    market_price:test_data.test_SKU.price.market_price,
                                    platform_price:test_data.test_SKU.price.platform_price
                                }
                            }
                        });
                        Routing.Product.app_get_product(test_product.id, function(body){
                            body.should.containDeep({
                                code:'1000',
                                datas:{
                                    SKUAttributes:[{
                                        name:test_SKU_attributes[0].name,
                                        values:[test_SKU_attributes[0].value]
                                    }],
                                    SKUPrice:{max:test_data.test_SKU.price.platform_price, min:test_data.test_SKU.price.platform_price},
                                    referencePrice:{max:test_data.test_SKU.price.platform_price, min:test_data.test_SKU.price.platform_price},
                                    SKUMarketPrice:{max:test_data.test_SKU.price.market_price, min:test_data.test_SKU.price.market_price},
                                    defaultSKU:{
                                        ref:test_SKU._id,
                                        name:test_SKU.name,
                                        online:true,
                                        price:{
                                            market_price:test_data.test_SKU.price.market_price,
                                            platform_price:test_data.test_SKU.price.platform_price
                                        }
                                    }
                                }
                            });
                            done();
                        })
                    });
                });
            })
        });
        it('online product', function(done){
            Routing.Product.query_products(test_data.category_id[test_data.test_product.category], null, null, null, null, function(body){
                body.should.have.properties({
                    code:'1000',
                    datas:{
                        total:0,
                        rows:[],
                        pages:1,
                        page:1
                    }
                });
                Routing.Product.online_SKU(test_SKU._id, true, backend_admin_token, function(body){
                    body.should.have.property('code', 1000);
                    Routing.Product.online_product(test_product._id, true, backend_admin_token, function(body){
                        body.should.have.property('code', 1000);
                        Routing.Product.query_products(test_data.category_id[test_data.test_product.category], null, null, null, null, function(body) {
                            body.should.containDeep({
                                code: '1000',
                                datas: {
                                    total: 1,
                                    rows: [{
                                        brandName:test_brand.name,
                                        goodsId:test_data.test_product.id,
                                        goodsName:test_data.test_product.name,
                                        originalPrice:test_data.test_SKU.price.platform_price,
                                        imgUrl:'/images/large/'+test_data.category_id[test_data.test_product.category]+'/'+imgUrl+'.jpg?category='+test_data.category_id[test_data.test_product.category],
                                        pictures:[{
                                            imgUrl:'/images/large/'+test_data.category_id[test_data.test_product.category]+'/'+imgUrl+'.jpg?category='+test_data.category_id[test_data.test_product.category],
                                            originalUrl:'/images/original/'+test_data.category_id[test_data.test_product.category]+'/'+imgUrl+'.jpg',
                                            thumbnail:'/images/thumbnail/'+test_data.category_id[test_data.test_product.category]+'/'+imgUrl+'.jpg?category='+test_data.category_id[test_data.test_product.category]+'&thumb=true'
                                        }],
                                        unitPrice:test_data.test_SKU.price.platform_price
                                    }],
                                    pages: 1,
                                    page: 1
                                }
                            });
                            done();
                        });
                    })
                });
            })
        });
        it('product detail');
        it('presale', function(done){
            Routing.Product.app_get_product(test_product.id, function(body) {
                body.datas.should.not.have.property('presale');
                Routing.Product.web_get_product(test_product.id, function(body) {
                    body.should.not.have.property('presale');
                    test_product.presale = true;
                    Routing.Product.save_product(test_product, backend_admin_token, function (body) {
                        body.should.have.property('code', 1000);
                        Routing.Product.app_get_product(test_product.id, function (body) {
                            body.should.containDeep({
                                code: '1000',
                                datas: {
                                    presale: true
                                }
                            });
                            Routing.Product.web_get_product(test_product.id, function (body) {
                                body.should.have.property('presale', true);
                                done();
                            });
                        })
                    })
                })
            })
        })
    });

    describe('category products query', function(){
        it('query by category');
        it('paging and sorting');
    });

    describe('banner', function(){
        it('old app query banner');
    })
});