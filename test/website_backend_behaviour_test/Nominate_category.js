/**
 * Created by pepelu on 2016/8/17.
 */
var should = require('should');
var Components = require('./utilities/components');
var test_data = require('./test_data');
var Routing = require('./Routing');
var utils = require('../../common/utils');
var fs = require('fs');
var models = require('../../models');
var deployment = require('../../deployment');
var SKUAttributesModel = models.SKUAttributes;
var NominateCategoryModel = models.nominate_category;
var ProductModel = models.product;
var SKUModel = models.SKU;

describe('nominated products', function(){
    var backend_admin_token;
    before('delete SKU attributes', function(done){
        SKUAttributesModel.find({}).remove(done);
    });
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
        var backend_admin = test_data.backend_admin;
        Routing.User.create_backend_account(backend_admin.account, backend_admin.password, backend_admin.role, function () {
            Routing.User.backendLogin(backend_admin.account, backend_admin.password, function (err, token) {
                should.not.exist(err);
                backend_admin_token = token;
                done();
            })
        })
    });
    before('delete all products and SKUs', function(done){
        ProductModel.find({}).remove(function(err){
            should.not.exist(err);
            SKUModel.find({}).remove(done);
        });
    });
    before('delete all nominate category', function(done){
        NominateCategoryModel.find({}).remove(done);
    });
    var category_1 = test_data.category_id['汽车'];
    var brand_1;
    var product_c1, product_c2, product_c3, product_c4, product_c5;
    var SKU_1, SKU_attributes_1;
    beforeEach('create products c1, c2, c3, c4, c5 online', function(done){
        Components.prepare_SKU(backend_admin_token, 0, '汽车', 0, test_data.test_SKU, function (brand, product, SKU, SKU_attributes) {
            product_c1 = product;
            brand_1 = brand;
            Components.prepare_SKU(backend_admin_token, 0, '汽车', 1, test_data.test_SKU, function (brand, product, SKU, SKU_attributes) {
                product_c2 = product;
                Components.prepare_SKU(backend_admin_token, 0, '汽车', 2, test_data.test_SKU, function (brand, product, SKU, SKU_attributes) {
                    product_c3 = product;
                    Components.prepare_SKU(backend_admin_token, 0, '汽车', 3, test_data.test_SKU, function (brand, product, SKU, SKU_attributes) {
                        product_c4 = product;
                        Components.prepare_SKU(backend_admin_token, 0, '汽车', 4, test_data.test_SKU, function (brand, product, SKU, SKU_attributes) {
                            product_c5 = product;
                            SKU_1 = SKU;
                            SKU_attributes_1 = SKU_attributes;
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

    describe('new nominate category', function(){
        afterEach('delete all nominate category', function(done){
            NominateCategoryModel.find({}).remove(done);
        });

        //输入分类名称，类目a1，品牌b1，查看更多（是），跳转至（categoryId），筛选query，展示个数4，（不配置商品列表）保存分类
        //    -> 上架分类
        //    -> 前台query，得到对应字段（query， categoryid， 查看更多， 名称），商品列表c5, c4, c3, c2(查看商品字段：主图，标题，minprice, defaultSKU， 是否预售)
        //    –> 下架c4
        //    –> query，得到c5, c3, c2, c1
        it('create w/o product list', function(done){
            var nominate_category = {
                name: '测试分类1',
                category: category_1,
                brand:brand_1._id,
                search_more:true,
                query:{brand:brand_1._id},
                show_count:4
            };
            var expected_nominate_category = {
                name: '测试分类1',
                category: category_1,
                brand:brand_1._id,
                search_more:true,
                query:{brand:brand_1._id},
                show_count:4,
                products:[{
                    id: product_c5.id,
                    thumbnail: product_c5.thumbnail,
                    defaultSKU:{
                        ref:SKU_1._id,
                        name:product_c5.name + ' - ' + SKU_attributes_1[0].value + ' - ' + SKU_attributes_1[1].value,
                        price:{
                            market_price:SKU_1.price.market_price,
                            platform_price:SKU_1.price.platform_price
                        }
                    },
                    presale:product_c5.presale
                },{
                    id: product_c4.id
                },{
                    id: product_c3.id
                },{
                    id: product_c2.id
                }]
            };
            var expected_nominate_category_after_offline_c4 = {
                name: '测试分类1',
                category: category_1,
                brand:brand_1._id,
                search_more:true,
                query:{brand:brand_1._id},
                show_count:4,
                products:[{
                    id: product_c5.id,
                    thumbnail: product_c5.thumbnail,
                    defaultSKU:{
                        ref:SKU_1._id,
                        name:product_c5.name + ' - ' + SKU_attributes_1[0].value + ' - ' + SKU_attributes_1[1].value,
                        price:{
                            market_price:SKU_1.price.market_price,
                            platform_price:SKU_1.price.platform_price
                        }
                    },
                    presale:product_c5.presale
                },{
                    id: product_c3.id
                },{
                    id: product_c2.id
                },{
                    id: product_c1.id
                }]
            };
            var frontend_list = {
                code:1000,
                nominate_categories: [expected_nominate_category]
            };
            var backend_list = {
                code:1000,
                nominate_categories: [nominate_category]
            };
            Routing.Nominate_category.create_nominate_category(nominate_category, backend_admin_token, function(body){
                body.should.have.property('code', 1000);
                Routing.Nominate_category.query_nominate_category_frontend(function(body){
                    body.should.have.properties({
                        code:1000,
                        nominate_categories: []
                    });
                    Routing.Nominate_category.query_nominate_category_backend(backend_admin_token, function(body){
                        body.should.containDeep(backend_list);
                        var c1 = body.nominate_categories[0];
                        c1.online = true;
                        Routing.Nominate_category.modify_nominate_category(c1, backend_admin_token, function(body){
                            body.should.have.property('code', 1000);
                            Routing.Nominate_category.query_nominate_category_frontend(function(body){
                                body.should.containDeepOrdered(frontend_list);
                                Routing.Product.online_product(product_c4, false, backend_admin_token, function(body){
                                    body.should.have.property('code', 1000);
                                    Routing.Nominate_category.query_nominate_category_frontend(function(body) {
                                        body.should.containDeepOrdered({
                                            code: 1000,
                                            nominate_categories: [expected_nominate_category_after_offline_c4]
                                        });
                                        body.nominate_categories[0].products.should.have.a.lengthOf(4);
                                        done();
                                    })
                                })
                            })
                        })
                    })
                })
            })
        });

        //新增分类，a1, b1，查看更多（否） 商品列表（顺序：c2, c3, c1, c5, c4）
        //-> query，得到商品列表c2, c3, c1, c5(查看商品字段：主图，标题，minprice, defaultSKU， 是否预售)
        //-> 下架c1
        //–> query, 得到c2, c3, c5, c4
        it('create w/ product list', function(done){
            var nominate_category = {
                name: '测试分类1',
                category: category_1,
                brand:brand_1._id,
                search_more:false,
                query:{brand:brand_1._id},
                show_count:4,
                products:[product_c2._id, product_c3._id, product_c1._id, product_c5._id, product_c4._id]
            };
            var expected_nominate_category = {
                name: '测试分类1',
                category: category_1,
                brand: brand_1._id,
                search_more: false,
                query: {brand: brand_1._id},
                show_count: 4,
                products: [{
                    id: product_c2.id
                }, {
                    id: product_c3.id
                }, {
                    id: product_c1.id
                }, {
                    id: product_c5.id,
                    thumbnail: product_c5.thumbnail,
                    defaultSKU:{
                        ref:SKU_1._id,
                        name:product_c5.name + ' - ' + SKU_attributes_1[0].value + ' - ' + SKU_attributes_1[1].value,
                        price:{
                            market_price:SKU_1.price.market_price,
                            platform_price:SKU_1.price.platform_price
                        }
                    },
                    presale:product_c5.presale
                }]
            };
            var expected_nominate_category_after_offline_c1 = {
                name: '测试分类1',
                category: category_1,
                brand: brand_1._id,
                search_more: false,
                query: {brand: brand_1._id},
                show_count: 4,
                products: [{
                    id: product_c2.id
                }, {
                    id: product_c3.id
                }, {
                    id: product_c5.id,
                    thumbnail: product_c5.thumbnail,
                    defaultSKU:{
                        ref:SKU_1._id,
                        name:product_c5.name + ' - ' + SKU_attributes_1[0].value + ' - ' + SKU_attributes_1[1].value,
                        price:{
                            market_price:SKU_1.price.market_price,
                            platform_price:SKU_1.price.platform_price
                        }
                    },
                    presale:product_c5.presale
                },{
                    id: product_c4.id
                }]
            };
            var frontend_list = {
                code:1000,
                nominate_categories: [expected_nominate_category]
            };
            var backend_list = {
                code:1000,
                nominate_categories: [nominate_category]
            };
            Routing.Nominate_category.create_nominate_category(nominate_category, backend_admin_token, function(body){
                body.should.have.property('code', 1000);
                Routing.Nominate_category.query_nominate_category_frontend(function(body){
                    body.should.have.properties({
                        code:1000,
                        nominate_categories: []
                    });
                    Routing.Nominate_category.query_nominate_category_backend(backend_admin_token, function(body){
                        body.should.containDeep(backend_list);
                        var c1 = body.nominate_categories[0];
                        c1.online = true;
                        Routing.Nominate_category.modify_nominate_category(c1, backend_admin_token, function(body){
                            body.should.have.property('code', 1000);
                            Routing.Nominate_category.query_nominate_category_frontend(function(body){
                                body.should.containDeepOrdered(frontend_list);
                                body.nominate_categories[0].products.should.have.a.lengthOf(4);
                                Routing.Product.online_product(product_c1, false, backend_admin_token, function(body){
                                    body.should.have.property('code', 1000);
                                    Routing.Nominate_category.query_nominate_category_frontend(function(body) {
                                        body.should.containDeepOrdered({
                                            code: 1000,
                                            nominate_categories: [expected_nominate_category_after_offline_c1]
                                        });
                                        body.nominate_categories[0].products.should.have.a.lengthOf(4);
                                        done();
                                    })
                                })
                            })
                        })
                    })
                })
            })
        });
    });

    describe('nominate category offline/online & order', function(){
        var d1, d2, d3;
        before('create nominate category d1, d2, d3 online', function(done){
            var nominate_category = {
                name: '测试分类1',
                category: category_1,
                brand:brand_1._id,
                search_more:true,
                query:{brand:brand_1._id},
                show_count:4,
                online:true
            };
            Routing.Nominate_category.create_nominate_category(nominate_category, backend_admin_token, function(body){
                d1 = body.nominate_category;
                Routing.Nominate_category.create_nominate_category(nominate_category, backend_admin_token, function(body){
                    d2 = body.nominate_category;
                    Routing.Nominate_category.create_nominate_category(nominate_category, backend_admin_token, function(body){
                        d3 = body.nominate_category;
                        done();
                    })
                })
            })
        });

        //前台query， 得到d1, d2, d3
        //	更改顺序为d2, d1, d3
        //	前台query，得到d2, d1, d3 (按顺序)
        //	下架d1
        //	前台query，得到d2, d3, 后台query，得到d2, d3, d1
        //	上架d1
        //	前台query，得到d2, d3, d1, 后台query，得到d2, d3, d1
        //	删除d3
        //	前台query, 得到d2, d1
        it('nominate category offline/online & order', function(done){
            var expected_frontend_list = {
                code:1000,
                nominate_categories: [
                    {_id: d1._id},
                    {_id: d2._id},
                    {_id: d3._id}
                ]
            };
            var expected_frontend_list_after_change_order = {
                code:1000,
                nominate_categories:[
                    {_id: d2._id},
                    {_id: d1._id},
                    {_id: d3._id}
                ]
            };
            var expected_frontend_list_after_offline_d1 = {
                code:1000,
                nominate_categories:[
                    {_id: d2._id},
                    {_id: d3._id}
                ]
            };
            var expected_backend_list_after_offline_d1 = {
                code:1000,
                nominate_categories:[
                    {_id: d2._id},
                    {_id: d3._id},
                    {_id: d1._id}
                ]
            };
            var expected_frontend_list_after_online_d1 = {
                code:1000,
                nominate_categories:[
                    {_id: d2._id},
                    {_id: d1._id},
                    {_id: d3._id}
                ]
            };
            var expected_backend_list_after_online_d1 = {
                code:1000,
                nominate_categories:[
                    {_id: d2._id},
                    {_id: d1._id},
                    {_id: d3._id}
                ]
            };
            var expected_frontend_list_after_delete_d3 = {
                code: 1000,
                nominate_categories:[
                    {_id: d2._id},
                    {_id: d1._id}
                ]
            };
            Routing.Nominate_category.query_nominate_category_frontend(function(body){
                body.should.containDeepOrdered(expected_frontend_list);
                Routing.Nominate_category.update_nominate_category_order([d2._id, d1._id, d3._id], backend_admin_token, function(body){
                    body.should.have.property('code', 1000);
                    Routing.Nominate_category.query_nominate_category_frontend(function(body){
                        body.should.containDeepOrdered(expected_frontend_list_after_change_order);
                        Routing.Nominate_category.modify_nominate_category({_id:d1._id, online:false}, backend_admin_token, function(body){
                            body.should.have.property('code', 1000);
                            Routing.Nominate_category.query_nominate_category_frontend(function(body){
                                body.should.containDeepOrdered(expected_frontend_list_after_offline_d1);
                                body.nominate_categories.should.have.a.lengthOf(2);
                                Routing.Nominate_category.query_nominate_category_backend(backend_admin_token, function(body){
                                    body.should.containDeepOrdered(expected_backend_list_after_offline_d1);
                                    Routing.Nominate_category.modify_nominate_category({_id:d1._id, online:true}, backend_admin_token, function(body) {
                                        body.should.have.property('code', 1000);
                                        Routing.Nominate_category.query_nominate_category_frontend(function(body) {
                                            body.should.containDeepOrdered(expected_frontend_list_after_online_d1);
                                            Routing.Nominate_category.query_nominate_category_backend(backend_admin_token, function (body) {
                                                body.should.containDeepOrdered(expected_backend_list_after_online_d1);
                                                Routing.Nominate_category.delete_nominate_category(d3._id, backend_admin_token, function(body){
                                                    body.should.have.property('code', 1000);
                                                    Routing.Nominate_category.query_nominate_category_frontend(function(body) {
                                                        body.should.containDeepOrdered(expected_frontend_list_after_delete_d3);
                                                        body.nominate_categories.should.have.a.lengthOf(2);
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
                })
            })
        });
    })
});