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
                    body.should.containDeep(expected_page_list_before_set_A_to_top);
                    product_A.istop = true;
                    Routing.Product.save_product(product_A, backend_admin_token, function(body){
                        body.should.have.property('code', 1000);
                        Routing.Product.query_products(test_data.category_id['化肥'], null, null, null, null, function(body) {
                            body.should.containDeep(expected_page_list_after_set_A_to_top);
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
    })
});