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
var jobs = require('../../jobs');
var ProductModel = models.product;
var SKUModel = models.SKU;
var ProductTagModel = models.productTag;
var Components = require('./utilities/components');
var SKUAttributesModel = models.SKUAttributes;

describe('Product', function(){
    var imgUrl = '';
    var backend_admin = test_data.backend_admin;
    var backend_admin_token;
    var test_product;
    var test_SKU;
    var test_brand;
    var test_SKU_attributes;
    var SKU_attributes;
    before('delete SKU attributes', function(done){
        SKUAttributesModel.find({}).remove(done);
    });
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
    
    before('prepare 3 SKU attributes for brand A, category huafei', function(done){
        Components.prepare_SKU_attributes('化肥', 0, 0, 3, backend_admin_token, done);
    });

    before('prepare 3 SKU attributes for brand A, category huafei', function(done){
        Components.prepare_SKU_attributes('化肥', 0, 1, 3, backend_admin_token, done);
    });

    beforeEach('create product with SKUs', function(done) {
        Routing.Product.query_brands(test_data.category_id[test_data.test_product.category], backend_admin_token, function (body) {
            test_brand = body.brands[0];
            Routing.Product.save_product(utils.extend(test_data.test_product, {
                brand: test_brand._id,
                pictures: [imgUrl]
            }), backend_admin_token, function (body) {
                body.should.have.property('code', 1000);
                test_product = body.product;
                Routing.Product.query_SKU_attributes(test_data.test_SKU.category, test_brand._id, backend_admin_token, function (body) {
                    body.should.have.property('code', 1000);
                    SKU_attributes = body.attributes;
                    test_SKU_attributes = [{
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
                        product: test_product._id,
                        attributes: test_SKU_attributes
                    }), backend_admin_token, function (body) {
                        body.should.have.property('code', 1000);
                        test_SKU = body.SKU;
                        done();
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
                                name:test_data.test_product.name + ' - ' + test_SKU_attributes[0].value + ' - ' + test_SKU_attributes[1].value,
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
        it('online product and query products by category', function(done){
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
        it('product detail', function(done){
            var expected_web_product_detail = {
                productDesc:test_data.test_product.body,
                support:test_data.test_product.support,
                standard:test_data.test_product.standard
            };
            var expected_app_product_detail = {
                code:1000,
                datas: {
                    app_body_url: 'http://127.0.0.1/product/app_body/'+test_data.test_product.id,
                    app_support_url: 'http://127.0.0.1/product/app_support/'+test_data.test_product.id,
                    app_standard_url: 'http://127.0.0.1/product/app_standard/'+test_data.test_product.id
                }
            };
            Routing.Product.web_get_product(test_product.id, function(body){
                body.should.containDeep(expected_web_product_detail);
                Routing.Product.app_get_product(test_product.id, function(body){
                    body.should.containDeep(expected_app_product_detail);
                    request('http://127.0.0.1')
                        .get('/product/app_body/'+test_data.test_product.id)
                        .end(function(err, res){
                            should.not.exist(err);
                            res.text.should.be.match(new RegExp(test_data.test_product.app_body));
                            request('http://127.0.0.1')
                                .get('/product/app_support/'+test_data.test_product.id)
                                .end(function(err, res) {
                                    should.not.exist(err);
                                    res.text.should.be.match(new RegExp(test_data.test_product.app_support));
                                    request('http://127.0.0.1')
                                        .get('/product/app_standard/' + test_data.test_product.id)
                                        .end(function (err, res) {
                                            should.not.exist(err);
                                            res.text.should.be.match(new RegExp(test_data.test_product.app_standard));
                                            done();
                                        })
                                })
                        })
                })
            })
        });
        it('presale', function(done){
            Routing.Product.app_get_product(test_product.id, function(body) {
                body.should.containDeep({
                    code: '1000',
                    datas: {
                        presale: false
                    }
                });
                Routing.Product.web_get_product(test_product.id, function(body) {
                    body.should.have.property('presale', false);
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
                                test_product.presale = false;
                                Routing.Product.save_product(test_product, backend_admin_token, function (body) {
                                    body.should.have.property('code', 1000);
                                    Routing.Product.app_get_product(test_product.id, function (body) {
                                        body.should.containDeep({
                                            code: '1000',
                                            datas: {
                                                presale: false
                                            }
                                        });
                                        Routing.Product.web_get_product(test_product.id, function (body) {
                                            body.should.have.property('presale', false);
                                            done();
                                        })
                                    })
                                })
                            });
                        })
                    })
                })
            })
        })
    });

    describe('category products query', function(){
        it('query product attributes', function(done){
            var expected_attributes_list = {
                code:1000,
                attributes:[{
                    _id:{
                        name:'品类'
                    },
                    values:['氮磷钾肥', '复合肥', '有机肥']
                }]
            };
            Routing.Product.query_product_attributes(test_data.category_id[test_data.test_product.category], [0, test_brand._id], null, function(body) {
                body.should.containDeep(expected_attributes_list);
                done();
            });
        });
        it('query by category', function(done) {
            var expected_category_list = {
                code: 1000,
                categories: [{name: '化肥', title: '农肥产品', id: '531680A5'}]
            };

            var expected_product_list_with_right_attributes = {
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
            };

            var expected_product_list_with_wrong_attributes = {
                code: '1000',
                datas: {
                    total: 0,
                    rows: [],
                    pages: 1,
                    page: 1
                }
            };

            Routing.Product.backend_query_product_attributes(test_data.category_id[test_data.test_product.category], [0, test_brand._id], null, backend_admin_token, function(body) {
                var attribute = body.attributes[0];
                test_product.attributes = [{name:attribute._id.name, value:attribute.values[0].value, ref:attribute.values[0].ref}];
                var right_product_attributes = [{name:attribute._id.name, value:{$in:[attribute.values[0].value]}}];
                var wrong_product_attributes = [{name:attribute._id.name, value:{$in:[attribute.values[1].value]}}];
                Routing.Product.save_product(test_product, backend_admin_token, function (body) {
                    Routing.Product.query_category_list(function (body) {
                        body.should.containDeep(expected_category_list);
                        Routing.Product.online_SKU(test_SKU._id, true, backend_admin_token, function (body) {
                            Routing.Product.online_product(test_product._id, true, backend_admin_token, function (body) {
                                Routing.Product.query_products(test_data.category_id[test_data.test_product.category], [test_brand._id], null, null, right_product_attributes, function (body) {
                                    body.should.containDeep(expected_product_list_with_right_attributes);
                                    Routing.Product.query_products(test_data.category_id[test_data.test_product.category], [test_brand._id], null, null, wrong_product_attributes, function (body) {
                                        body.should.containDeep(expected_product_list_with_wrong_attributes);
                                        done();
                                    });
                                });
                            });
                        });
                    })
                })
            })
        });
        describe('paging and sorting', function(){
            var product_A, product_B, product_C;
            beforeEach('create product A, B, C in order', function(done){
                Components.prepare_SKU(backend_admin_token, 0, '化肥', 0, test_data.test_SKU, 0, function(brand, product, SKU, test_SKU_attributes){
                    product_A = product;
                    Components.prepare_SKU(backend_admin_token, 0, '化肥', 1, test_data.test_SKU, 0, function(brand, product, SKU, test_SKU_attributes){
                        product_B = product;
                        Components.prepare_SKU(backend_admin_token, 0, '化肥', 2, test_data.test_SKU, 0, function(brand, product, SKU, test_SKU_attributes){
                            product_C = product;
                            done();
                        })
                    })
                })
            });
            it('paging', function(done){
                var expected_page_1_list = {
                    code: '1000',
                    datas: {
                        total: 3,
                        rows: [{
                            goodsId:product_B.id
                        },{
                            goodsId:product_C.id
                        }],
                        pages: 2,
                        page: 1
                    }
                };
                var expected_page_2_list = {
                    code: '1000',
                    datas: {
                        total: 3,
                        rows: [{
                            goodsId:product_A.id
                        }],
                        pages: 2,
                        page: 2
                    }
                };
                Routing.Product.query_products(test_data.category_id['化肥'], null, null, null, null, function(body){
                    body.should.containDeep(expected_page_1_list);
                    Routing.Product.query_products(test_data.category_id['化肥'], null, null, null, null, function(body){
                        body.should.containDeep(expected_page_2_list);
                        done();
                    }, 2, 2)
                }, 1, 2)
            });
            it('sorting', function(done){
                var expected_page_list_before_set_A_to_top = {
                    code: '1000',
                    datas: {
                        total: 3,
                        rows: [{
                            goodsId:product_C.id
                        },{
                            goodsId:product_B.id
                        },{
                            goodsId:product_A.id
                        }],
                        pages: 1,
                        page: 1
                    }
                };

                var expected_page_list_after_set_A_to_top = {
                    code: '1000',
                    datas: {
                        total: 3,
                        rows: [{
                            goodsId:product_A.id
                        },{
                            goodsId:product_C.id
                        },{
                            goodsId:product_B.id
                        }],
                        pages: 1,
                        page: 1
                    }
                };

                Routing.Product.query_products(test_data.category_id['化肥'], null, null, null, null, function(body){
                    body.should.containDeepOrdered(expected_page_list_before_set_A_to_top);
                    product_A.istop = true;
                    Routing.Product.save_product(product_A, backend_admin_token, function(body){
                        body.should.have.property('code', 1000);
                        Routing.Product.query_products(test_data.category_id['化肥'], null, null, null, null, function(body) {
                            body.should.containDeepOrdered(expected_page_list_after_set_A_to_top);
                            done();
                        })
                    })
                })
            });
        });
    });

    describe('banner', function(){
        it('old app query banner', function(done){
            Routing.Product.query_old_banner(function(body){
                body.should.containDeep({
                    code:'1000',
                    datas:{
                        total:1,
                        rows:[{
                            imgUrl:'/images/banners/upgrade/App10Upgrade.png',
                            id:'App10Upgrade.png'
                        }]
                    }
                });
                done();
            })
        });
    });

    describe('SKU attributes and additions', function(){
        it('query SKU attributes and additions', function(done){
            var test_SKU_2 = {
                name:'test_sku_2',
                price:{
                    market_price:100,
                    platform_price:99
                },
                product:test_product._id,
                attributes:[{name:SKU_attributes[0].name, value:SKU_attributes[0].values[1].value, ref:SKU_attributes[0].values[1].ref},
                    {name:SKU_attributes[1].name, value:SKU_attributes[1].values[1].value, ref:SKU_attributes[1].values[1].ref}]
            };
            var expected_SKU_attributes_with_none_selected = {
                code:1000,
                data:{
                    attributes:[{
                        name:SKU_attributes[0].name,
                        values:[SKU_attributes[0].values[0].value, SKU_attributes[0].values[1].value]
                    },{
                        name:SKU_attributes[1].name,
                        values:[SKU_attributes[1].values[0].value, SKU_attributes[1].values[1].value]
                    }],
                    price:{
                        min:test_SKU.price.platform_price,
                        max:test_SKU_2.price.platform_price
                    },
                    market_price:{
                        min:test_SKU.price.market_price,
                        max:test_SKU_2.price.market_price
                    },
                    additions:[]
                }
            };
            var expected_SKU_attributes_with_1_attribute_selected = {
                code:1000,
                data:{
                    attributes:[{
                        name:SKU_attributes[0].name,
                        values:[SKU_attributes[0].values[0].value, SKU_attributes[0].values[1].value]
                    },{
                        name:SKU_attributes[1].name,
                        values:[SKU_attributes[1].values[1].value]
                    }],
                    price:{
                        min:test_SKU_2.price.platform_price,
                        max:test_SKU_2.price.platform_price
                    },
                    market_price:{
                        min:test_SKU_2.price.market_price,
                        max:test_SKU_2.price.market_price
                    },
                    additions:[]
                }
            };
            var unexpected_SKU_attributes_with_1_attribute_selected = {
                data:{
                    attributes:[{
                        name:SKU_attributes[1].name,
                        values:[SKU_attributes[1].values[0].value]
                    }]
                }
            };
            var expected_SKU_attributes_with_all_attribute_selected = {
                code:1000,
                data:{
                    attributes:[{
                        name:SKU_attributes[0].name,
                        values:[SKU_attributes[0].values[1].value]
                    },{
                        name:SKU_attributes[1].name,
                        values:[SKU_attributes[1].values[1].value]
                    }],
                    price:{
                        min:test_SKU_2.price.platform_price,
                        max:test_SKU_2.price.platform_price
                    },
                    market_price:{
                        min:test_SKU_2.price.market_price,
                        max:test_SKU_2.price.market_price
                    },
                    additions:[],
                    SKU:{
                        price:test_SKU_2.price,
                        attributes:test_SKU_2.attributes,
                        product:test_SKU_2.product
                    }
                }
            };
            var unexpected_SKU_attributes_with_all_attribute_selected = {
                data: {
                    attributes: [{
                        name: SKU_attributes[0].name,
                        values: [SKU_attributes[0].values[0].value]
                    }, {
                        name: SKU_attributes[1].name,
                        values: [SKU_attributes[1].values[0].value]
                    }]
                }
            };
            Routing.Product.create_SKU(test_SKU_2, backend_admin_token, function (body) {
                body.should.have.property('code', 1000);
                test_SKU_2 = body.SKU;
                Routing.Product.online_SKU(test_SKU._id, true, backend_admin_token, function(body) {
                    Routing.Product.online_SKU(test_SKU_2._id, true, backend_admin_token, function(body) {
                        Routing.Product.online_product(test_product._id, true, backend_admin_token, function(body){
                            Routing.Product.query_SKU_attributes_and_price(test_product._id, [], function(body){
                                body.should.containDeep(expected_SKU_attributes_with_none_selected);
                                Routing.Product.query_SKU_attributes_and_price(test_product._id, [{name:SKU_attributes[0].name, value:SKU_attributes[0].values[1].value}], function(body) {
                                    body.should.containDeep(expected_SKU_attributes_with_1_attribute_selected);
                                    body.should.not.containDeep(unexpected_SKU_attributes_with_1_attribute_selected);
                                    body.data.should.not.have.property('SKU');
                                    Routing.Product.query_SKU_attributes_and_price(test_product._id, [{
                                        name: SKU_attributes[0].name,
                                        value: SKU_attributes[0].values[1].value
                                    }, {
                                        name: SKU_attributes[1].name,
                                        value: SKU_attributes[1].values[1].value
                                    }], function (body) {
                                        body.should.containDeep(expected_SKU_attributes_with_all_attribute_selected);
                                        body.should.not.containDeep(unexpected_SKU_attributes_with_all_attribute_selected);
                                        done();
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    });

    describe('Brands Products Collection', function(){
        var brand_A, brand_B;
        var attributes, attribute_A, attribute_B, attribute_C;
        var product_A, product_B, product_C, product_D, product_E;
        var products_10 = [];
        var oldproducts_num = 5, newproducts_num = 10;
        var containDeepBrandProducts = function(brandProducts, testList) {
            for (var i=0; i<brandProducts.length; i++) {
                var brandProduct = brandProducts[i];
                if (brandProduct.brandId == brand_A._id) {
                    brandProduct.levels.should.have.length(brand_A.levels_length);
                } else if (brandProduct.brandId == brand_B._id) {
                    brandProduct.levels.should.have.length(brand_B.levels_length);
                }
                for (var j=0; j<brandProduct.levels.length; j++) {
                    var level = brandProduct.levels[j];
                    var expected_level;
                    var products = [];
                    var expected_product;
                    if (level.name == attribute_A.value) {
                        expected_level = attribute_A;
                        if (brandProducts.brandId == brand_A._id) {
                            expected_product = product_A;
                        } else if (brandProducts.brandId == brand_B._id) {
                            expected_product = product_C;
                        }
                    } else if (level.name == attribute_B.value) {
                        expected_level = attribute_B;
                        if (brandProducts.brandId == brand_A._id) {
                            expected_product = product_B;
                        } else if (brandProducts.brandId == brand_B._id) {
                            expected_product = product_D;
                        }
                    } else if (level.name == attribute_C.value) {
                        expected_level = attribute_C;
                        if (brandProducts.brandId == brand_B._id) {
                            if (testList) {
                                for (var len = products_10.length - 1; len>=0; len--) {
                                    products.push({
                                        categoryId: products_10[len].linker_category,
                                        name: products_10[len].name,
                                        id: products_10[len].id,
                                        ref: products_10[len]._id,
                                        imgUrl: '/images/large/'+products_10[len].linker_category+'/'+products_10[len].pictures[0]+'.jpg?category='+products_10[len].linker_category,
                                        thumbnail: '/images/thumbnail/'+products_10[len].linker_category+'/'+products_10[len].pictures[0]+'.jpg?category='+products_10[len].linker_category+'&thumb=true',
                                        originalPrice: test_data.test_SKU.price.platform_price,
                                        unitPrice: test_data.test_SKU.price.platform_price
                                    });
                                }
                            } else {
                                expected_product = product_E;
                            }
                        }
                    }
                    if (expected_product) {
                        var img = expected_product.pictures[0];
                        products = [
                            {
                                categoryId: expected_product.linker_category,
                                name: expected_product.name,
                                id: expected_product.id,
                                ref: expected_product._id,
                                imgUrl: '/images/large/'+expected_product.linker_category+'/'+img+'.jpg?category='+expected_product.linker_category,
                                thumbnail: '/images/thumbnail/'+expected_product.linker_category+'/'+img+'.jpg?category='+expected_product.linker_category+'&thumb=true',
                                originalPrice: test_data.test_SKU.price.platform_price,
                                unitPrice: test_data.test_SKU.price.platform_price
                            }];
                    }
                    level.should.containDeep(
                        {
                            name: expected_level.value,
                            products: products
                        }
                    );
                }
            }
        };
        before('get product attributes', function(done){
            Routing.Product.backend_query_product_attributes(test_data.category_id['汽车'], null, '车型级别', backend_admin_token, function(body) {
                if (!body.attributes) {
                    should.not.exist('not query product attributes');
                } else if (body.attributes.length < 0) {
                    should.not.exist('not find product attributes');
                } else {
                    attributes = body.attributes[0];
                    if (attributes.values.length < 3) {
                        should.not.exist('product attributes length less 3');
                    } else {
                        attribute_A = attributes.values[0];
                        attribute_B = attributes.values[1];
                        attribute_C = attributes.values[2];
                    }
                }
                done();
            });
        });
        before('create product A(brandA attributeA), B(brandA attributeB), C(brandB attributeA), D(brandB attributeB), E(brandB attributeC) in order', function(done){
            var promises = [];
            promises.push(new Promise(function(resolve, reject){
                var product_A_attributes;
                if (attribute_A) {
                    product_A_attributes = [{name:attributes._id.name, value:attribute_A.value, ref:attribute_A.ref}];
                }
                Components.prepare_SKU(backend_admin_token, 0, '汽车', 0, test_data.test_SKU, 0, function(brand, product, SKU, test_SKU_attributes){
                    if (!product || !brand) {
                        reject('brand A product A prepare err');
                        return;
                    }
                    product_A = product;
                    brand_A = brand;
                    resolve();
                }, product_A_attributes);
            }));
            promises.push(new Promise(function(resolve, reject){
                var product_B_attributes;
                if (attribute_B) {
                    product_B_attributes = [{name:attributes._id.name, value:attribute_B.value, ref:attribute_B.ref}];
                }
                Components.prepare_SKU(backend_admin_token, 0, '汽车', 1, test_data.test_SKU, 1, function(brand, product, SKU, test_SKU_attributes){
                    if (!product || !brand) {
                        reject('brand A product B prepare err');
                        return;
                    }
                    product_B = product;
                    resolve();
                }, product_B_attributes);
            }));
            promises.push(new Promise(function(resolve, reject){
                var product_C_attributes;
                if (attribute_A) {
                    product_C_attributes = [{name:attributes._id.name, value:attribute_A.value, ref:attribute_A.ref}];
                }
                Components.prepare_SKU(backend_admin_token, 1, '汽车', 2, test_data.test_SKU, 2, function(brand, product, SKU, test_SKU_attributes){
                    if (!product || !brand) {
                        reject('brand B product C prepare err');
                        return;
                    }
                    product_C = product;
                    brand_B = brand;
                    resolve();
                }, product_C_attributes);
            }));
            promises.push(new Promise(function(resolve, reject){
                var product_D_attributes;
                if (attribute_B) {
                    product_D_attributes = [{name:attributes._id.name, value:attribute_B.value, ref:attribute_B.ref}];
                }
                Components.prepare_SKU(backend_admin_token, 1, '汽车', 3, test_data.test_SKU, 3, function(brand, product, SKU, test_SKU_attributes){
                    if (!product || !brand) {
                        reject('brand B product D prepare err');
                        return;
                    }
                    product_D = product;
                    resolve();
                }, product_D_attributes);
            }));
            promises.push(new Promise(function(resolve, reject){
                var product_E_attributes;
                if (attribute_C) {
                    product_E_attributes = [{name:attributes._id.name, value:attribute_C.value, ref:attribute_C.ref}];
                }
                Components.prepare_SKU(backend_admin_token, 1, '汽车', 4, test_data.test_SKU, 4, function(brand, product, SKU, test_SKU_attributes){
                    if (!product || !brand) {
                        reject('brand B product E prepare err');
                        return;
                    }
                    product_E = product;
                    resolve();
                }, product_E_attributes);
            }));
            Promise.all(promises)
            .then(function(){
                done();
            })
            .catch(function(err){
                should.not.exist(err);
                done();
            });
        });
        before('create product 1~10(brandB attributeC offline) in order', function(done){
            this.timeout(5000);
            var promises = [];
            for (var i=oldproducts_num; i<(oldproducts_num+newproducts_num); i++) {
                promises.push(new Promise(function(resolve, reject){
                    var product_attributes;
                    if (attribute_C) {
                        product_attributes = [{name:attributes._id.name, value:attribute_C.value, ref:attribute_C.ref}];
                    }
                    Components.prepare_SKU(backend_admin_token, 1, '汽车', i, test_data.test_SKU, 0, function(brand, product, SKU, test_SKU_attributes){
                        if (!product || !brand) {
                            reject('brand B 10 products prepare err');
                            return;
                        }
                        products_10.push(product);
                        resolve();
                    }, product_attributes, false);
                }));
            }
            Promise.all(promises)
            .then(function(){
                done();
            })
            .catch(function(err){
                should.not.exist(err);
                done();
            });
        });
        it('get Brands Products Collection, 1) Offline product D then get Brands Products Collection 2) online 10 products(brandB), then get Brands Products Collection', function(done){
            this.timeout(5000);
            jobs.generate_products_by_brands(function(err) {
                should.not.exist(err);
                if (err) {
                    done();
                    return;
                }
                var expected_brandsProducts = {
                    code:1000,
                    brandProducts: [
                        {
                            brandId: brand_A._id,
                            total: 2,
                            brandName: brand_A.name,
                            ref: brand_A._id
                        },
                        {
                            brandId: brand_B._id,
                            total: 3,
                            brandName: brand_B.name,
                            ref: brand_B._id
                        }
                    ]
                };
                Routing.Product.get_brandsProducts_collection(function(body) {
                    body.should.have.property('code', 1000);
                    body.brandProducts.should.have.length(2);
                    body.should.containDeep(expected_brandsProducts);
                    brand_A.levels_length = 2;
                    brand_B.levels_length = 3;
                    containDeepBrandProducts(body.brandProducts);
                    Routing.Product.online_product(product_D._id, false, backend_admin_token, function(body){
                        body.should.have.property('code', 1000);
                        jobs.generate_products_by_brands(function(err) {
                            var expected_brandsProducts = {
                                code:1000,
                                brandProducts: [
                                    {
                                        brandId: brand_A._id,
                                        total: 2,
                                        brandName: brand_A.name,
                                        ref: brand_A._id
                                    },
                                    {
                                        brandId: brand_B._id,
                                        total: 2,
                                        brandName: brand_B.name,
                                        ref: brand_B._id
                                    }
                                ]
                            };
                            Routing.Product.get_brandsProducts_collection(function(body) {
                                body.should.have.property('code', 1000);
                                body.brandProducts.should.have.length(2);
                                body.should.containDeep(expected_brandsProducts);
                                brand_A.levels_length = 2;
                                brand_B.levels_length = 2;
                                containDeepBrandProducts(body.brandProducts);
                                var promises = [];
                                for (var i=0; i<products_10.length; i++) {
                                    promises.push(new Promise(function(resolve, reject){
                                        Routing.Product.online_product(products_10[i]._id, true, backend_admin_token, function(body){
                                            if (!body || body.code !== 1000) {
                                                reject('brand B 10 products online err');
                                                return;
                                            }
                                            resolve();
                                        });
                                    }));
                                }
                                Promise.all(promises)
                                .then(function(){
                                    jobs.generate_products_by_brands(function(err) {
                                        should.not.exist(err);
                                        if (err) {
                                            done();
                                            return;
                                        }
                                        var expected_brandsProducts = {
                                            code:1000,
                                            brandProducts: [
                                                {
                                                    brandId: brand_A._id,
                                                    total: 2,
                                                    brandName: brand_A.name,
                                                    ref: brand_A._id
                                                },
                                                {
                                                    brandId: brand_B._id,
                                                    total: 11,
                                                    brandName: brand_B.name,
                                                    ref: brand_B._id
                                                }
                                            ]
                                        };
                                        Routing.Product.get_brandsProducts_collection(function(body) {
                                            body.should.have.property('code', 1000);
                                            body.brandProducts.should.have.length(2);
                                            body.should.containDeep(expected_brandsProducts);
                                            brand_A.levels_length = 2;
                                            brand_B.levels_length = 2;
                                            containDeepBrandProducts(body.brandProducts, true);
                                            done();
                                        });
                                    });
                                })
                                .catch(function(err){
                                    should.not.exist(err);
                                    done();
                                    return;
                                });
                                return;
                            });
                        });
                    });
                });
            });
        });
    });

    describe('Products Tags', function(){
        beforeEach('delete all tags', function(done){
            ProductTagModel.find({}).remove(function(err){
                should.not.exist(err);
                done();
            });
        });
        afterEach('delete all tags', function(done){
            ProductTagModel.find({}).remove(function(err){
                should.not.exist(err);
                done();
            });
        });
        it('add category(汽车) new tag a1(success) a1(error) a2(success)', function(done) {
            var a1, a2;
            var expected_tag_1 = {code:1000, message:'success', tag:{name:'a1', category:test_data.category_id['汽车'], order:0, productsNum:0}};
            Routing.Product.add_product_tag(test_data.category_id['汽车'], 'a1', backend_admin_token, function(body) {
                body.should.containDeep(expected_tag_1);
                a1 = body.tag;
                var expected_tag_2 = {code: 1001, message: '标签已存在'};
                Routing.Product.add_product_tag(test_data.category_id['汽车'], 'a1', backend_admin_token, function(body) {
                    body.should.containDeep(expected_tag_2);
                    var expected_tag_3 = {code:1000, message:'success', tag:{name:'a2', category:test_data.category_id['汽车'], order:0, productsNum:0}};
                    Routing.Product.add_product_tag(test_data.category_id['汽车'], 'a2', backend_admin_token, function(body) {
                        body.should.containDeep(expected_tag_3);
                        a2 = body.tag;
                        Routing.Product.backup_query_product_tags(test_data.category_id['汽车'], backend_admin_token, function(body) {
                            body.should.containDeep({
                                code:1000,
                                message:'success',
                                tags:[
                                    {category:a2.category,name:a2.name,order:0,productsNum:0},
                                    {category:a1.category,name:a1.name,order:0,productsNum:0}
                                ]
                            });
                            done();
                        });
                    });
                });
            });
        });
        it('add category(汽车) new tag a1 a2 a3 a4 productA, 1)add productA 4 tags(error) 2)add 3 tags(success) ', function(done) {
            this.timeout(5000);
            var a1, a2, a3, a4;
            var productA;
            var brandA;
            Routing.Product.add_product_tag(test_data.category_id['汽车'], 'a1', backend_admin_token, function(body) {
                body.should.have.property('code', 1000);
                a1 = body.tag;
                Routing.Product.add_product_tag(test_data.category_id['汽车'], 'a2', backend_admin_token, function(body) {
                    body.should.have.property('code', 1000);
                    a2 = body.tag;
                    Routing.Product.add_product_tag(test_data.category_id['汽车'], 'a3', backend_admin_token, function(body) {
                        body.should.have.property('code', 1000);
                        a3 = body.tag;
                        Routing.Product.add_product_tag(test_data.category_id['汽车'], 'a4', backend_admin_token, function(body) {
                            body.should.have.property('code', 1000);
                            a4 = body.tag;
                            Components.prepare_SKU(backend_admin_token, 0, '汽车', 0, test_data.test_SKU, 0, function(brand, product, SKU, test_SKU_attributes){
                                productA = product;
                                brandA = brand;
                                productA.tags = [{ref:a1._id, name:a1.name},{ref:a2._id, name:a2.name},{ref:a3._id, name:a3.name},{ref:a4._id, name:a4.name}];
                                Routing.Product.save_product(productA, backend_admin_token, function(body){
                                    body.should.containDeep({code:1001, message:'商品的标签最多只能3个'});
                                    var tags = [{ref:a2._id, name:a2.name},{ref:a4._id, name:a4.name},{ref:a1._id, name:a1.name}];
                                    productA.tags = tags;
                                    Routing.Product.save_product(productA, backend_admin_token, function(body){
                                        body.should.have.property('code', 1000);
                                        productA = body.product;
                                        Routing.Product.query_products(test_data.category_id['汽车'], null, null, null, null, function(body) {
                                            var categoryId = test_data.category_id[productA.category];
                                            var img = productA.pictures[0];
                                            body.should.containDeep({
                                                code: '1000',
                                                datas: {
                                                    total: 1,
                                                    rows: [{
                                                        brandName:brandA.name,
                                                        goodsId:productA.id,
                                                        goodsName:productA.name,
                                                        originalPrice:test_data.test_SKU.price.platform_price,
                                                        imgUrl:'/images/large/'+categoryId+'/'+img+'.jpg?category='+categoryId,
                                                        pictures:[{
                                                            imgUrl:'/images/large/'+categoryId+'/'+img+'.jpg?category='+categoryId,
                                                            originalUrl:'/images/original/'+categoryId+'/'+img+'.jpg',
                                                            thumbnail:'/images/thumbnail/'+categoryId+'/'+img+'.jpg?category='+categoryId+'&thumb=true'
                                                        }],
                                                        unitPrice:test_data.test_SKU.price.platform_price,
                                                        tags:tags
                                                    }],
                                                    pages: 1,
                                                    page: 1
                                                }
                                            });
                                            Routing.Product.query_products(test_data.category_id['汽车'], null, null, null, null, function(body) {
                                                var categoryId = test_data.category_id[productA.category];
                                                body.should.containDeep({
                                                    code: '1000',
                                                    datas: {
                                                        total: 0,
                                                        rows: [],
                                                        pages: 1,
                                                        page: 1
                                                    }
                                                });
                                                Routing.Product.query_products(test_data.category_id['汽车'], null, null, null, null, function(body) {
                                                    var categoryId = test_data.category_id[productA.category];
                                                    var img = productA.pictures[0];
                                                    body.should.containDeep({
                                                        code: '1000',
                                                        datas: {
                                                            total: 1,
                                                            rows: [{
                                                                brandName:brandA.name,
                                                                goodsId:productA.id,
                                                                goodsName:productA.name,
                                                                originalPrice:test_data.test_SKU.price.platform_price,
                                                                imgUrl:'/images/large/'+categoryId+'/'+img+'.jpg?category='+categoryId,
                                                                pictures:[{
                                                                    imgUrl:'/images/large/'+categoryId+'/'+img+'.jpg?category='+categoryId,
                                                                    originalUrl:'/images/original/'+categoryId+'/'+img+'.jpg',
                                                                    thumbnail:'/images/thumbnail/'+categoryId+'/'+img+'.jpg?category='+categoryId+'&thumb=true'
                                                                }],
                                                                unitPrice:test_data.test_SKU.price.platform_price,
                                                                tags:tags
                                                            }],
                                                            pages: 1,
                                                            page: 1
                                                        }
                                                    });
                                                    done();
                                                }, 1, 20, a1.name);
                                            }, 1, 20, a3.name);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
        it('add category(汽车) new tag a1 a2 productA productB, 1)add productA tag a1, add productB tag a2, run offline tags jobs, query tags 2)offline productB run offline tags jobs, query tags', function(done) {
            this.timeout(5000);
            var a1, a2;
            var productA, productB;
            Routing.Product.add_product_tag(test_data.category_id['汽车'], 'a1', backend_admin_token, function(body) {
                body.should.have.property('code', 1000);
                a1 = body.tag;
                Routing.Product.add_product_tag(test_data.category_id['汽车'], 'a2', backend_admin_token, function(body) {
                    body.should.have.property('code', 1000);
                    a2 = body.tag;
                    Components.prepare_SKU(backend_admin_token, 0, '汽车', 0, test_data.test_SKU, 0, function(brand, product, SKU, test_SKU_attributes){
                        productA = product;
                        Components.prepare_SKU(backend_admin_token, 0, '汽车', 1, test_data.test_SKU, 0, function(brand, product, SKU, test_SKU_attributes){
                            productB = product;
                            productA.tags = [{ref:a1._id, name:a1.name}];
                            Routing.Product.save_product(productA, backend_admin_token, function(body){
                                body.should.have.property('code', 1000);
                                productB.tags = [{ref:a2._id, name:a2.name}];
                                Routing.Product.save_product(productB, backend_admin_token, function(body){
                                    body.should.have.property('code', 1000);
                                    jobs.generate_producttags_values(function(err) {
                                        should.not.exist(err);
                                        Routing.Product.query_product_tags(test_data.category_id['汽车'], function(body) {
                                            body.should.containDeep({
                                                code:1000,
                                                message:'success',
                                                tags:[
                                                    {category:a2.category,name:a2.name},
                                                    {category:a1.category,name:a1.name}
                                                ]
                                            });
                                            Routing.Product.online_product(productB._id, false, backend_admin_token, function(body){
                                                body.should.have.property('code', 1000);
                                                Routing.Product.query_product_tags(test_data.category_id['汽车'], function(body) {
                                                    body.should.containDeep({
                                                        code:1000,
                                                        message:'success',
                                                        tags:[
                                                            {category:a2.category,name:a2.name},
                                                            {category:a1.category,name:a1.name}
                                                        ]
                                                    });
                                                    jobs.generate_producttags_values(function(err) {
                                                        should.not.exist(err);
                                                        Routing.Product.query_product_tags(test_data.category_id['汽车'], function(body) {
                                                            body.should.containDeep({
                                                                code:1000,
                                                                message:'success',
                                                                tags:[{category:a1.category,name:a1.name}]
                                                            });
                                                            done();
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});