/**
 * Created by pepelu on 2016/6/15.
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
var ProductModel = models.product;
var SKUModel = models.SKU;
var SKUAttributesModel = models.SKUAttributes;
var CartModel = models.cart;
var OrderModel = models.order;
var Components = require('./utilities/components');
var utils = require('../../common/utils');

describe('Shopping process', function() {
    var backend_admin = test_data.backend_admin;
    var backend_admin_token;
    var test_user_token;
    var test_user = test_data.random_test_user(utils.GUID(5));
    var test_address;
    before('delete SKU attributes', function(done){
        SKUAttributesModel.find({}).remove(done);
    });
    before('deploy supplier, brands, product_attributes, SKU_attributes', function (done) {
        deployment.deploy_SKU(done);
    });
    before('deploy roles and permissions', function (done) {
        deployment.deploy_auth(done);
    });
    after('delete SKU attributes', function(done){
        SKUAttributesModel.find({}).remove(done);
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
    before('prepare test address', function (done) {
        Routing.Address.get_address_by_name(test_data.test_address.province, test_data.test_address.city, test_data.test_address.county, test_data.test_address.town, function (err, address) {
            test_address = address;
            done();
        })
    });
    before('register account and login', function (done) {
        Routing.User.create_frontend_account(test_user.account, test_user.password, function () {
            Routing.User.frontendLogin(test_user.account, test_user.password, function (body) {
                var token = body.token;
                var user = body.datas;
                user.should.have.properties('userid', 'sex', 'isUserInfoFullFilled', 'loginName', 'phone');
                user.should.containDeep({
                    sex: false,
                    isUserInfoFullFilled: false,
                    loginName: test_user.account,
                    phone: test_user.account
                });

                test_user_token = token;
                done();
            });
        });
    });
    before('delete product with SKU', function (done) {
        ProductModel.find({}).remove(function (err) {
            should.not.exist(err);
            SKUModel.find({}).remove(done);
        });
    });
    after('remove test user', function (done) {
        Routing.User.delete_frontend_account(test_user.account, done);
    });
    after('delete backend admin', function (done) {
        Routing.User.delete_backend_account(backend_admin.account, done);
    });
    describe('shopping cart', function () {
        var product_A, product_B, product_C;
        var SKU_A1, SKU_B1, SKU_C1;
        var brand_A, brand_B;
        var SKU_attributes_A1, SKU_attributes_B1, SKU_attributes_C1;
        beforeEach('create product A(brand A), with SKU A1 online', function (done) {
            Components.prepare_SKU(backend_admin_token, 0, '化肥', 0, test_data.test_SKU, function (brand, product, SKU, SKU_attributes) {
                brand_A = brand;
                product_A = product;
                SKU_A1 = SKU;
                SKU_attributes_A1 = SKU_attributes;
                done();
            })
        });
        beforeEach('create product B(brand B), with SKU B1 online', function (done) {
            Components.prepare_SKU(backend_admin_token, 1, '化肥', 1, test_data.test_SKU, function (brand, product, SKU, SKU_attributes) {
                brand_B = brand;
                product_B = product;
                SKU_B1 = SKU;
                SKU_attributes_B1 = SKU_attributes;
                done();
            })
        });
        beforeEach('create product C(brand B), with SKU C1 online', function(done){
            Components.prepare_SKU(backend_admin_token, 1, '化肥', 2, test_data.test_SKU, function (brand, product, SKU, SKU_attributes) {
                brand_B = brand;
                product_C = product;
                SKU_C1 = SKU;
                SKU_attributes_C1 = SKU_attributes;
                done();
            })
        });
        afterEach('delete product with SKU', function (done) {
            ProductModel.find({}).remove(function (err) {
                should.not.exist(err);
                SKUModel.find({}).remove(done);
            });
        });
        beforeEach('delete cart', function(done){
            CartModel.find({}).remove(done);
        });
        it('add to cart and query', function (done) {
            var expected_cart_list = {
                code: 1000,
                datas: {
                    total: 3,
                    totalCount: 4,
                    offlineEntryCount: 0,
                    rows: [{
                        brandName: brand_A.name,
                        SKUList: [{
                            goodsId: product_A.id,
                            name: product_A.name + ' - ' + SKU_attributes_A1[0].value + ' - ' + SKU_attributes_A1[1].value,
                            price: SKU_A1.price.platform_price,
                            productName: product_A.name,
                            attributes: SKU_attributes_A1,
                            deposit: product_A.deposit,
                            count: 1,
                            additions: [],
                            product_id: product_A._id,
                            online:true
                        }],
                        offlineEntryCount: 0
                    },
                        {
                            brandName: brand_B.name,
                            SKUList: [{
                                goodsId: product_B.id,
                                name: product_B.name + ' - ' + SKU_attributes_B1[0].value + ' - ' + SKU_attributes_B1[1].value,
                                price: SKU_B1.price.platform_price,
                                productName: product_B.name,
                                attributes: SKU_attributes_B1,
                                deposit: product_B.deposit,
                                count: 2,
                                additions: [],
                                product_id: product_B._id,
                                online:true
                            },{
                                goodsId: product_C.id,
                                name: product_C.name + ' - ' + SKU_attributes_C1[0].value + ' - ' + SKU_attributes_C1[1].value,
                                price: SKU_C1.price.platform_price,
                                productName: product_C.name,
                                attributes: SKU_attributes_C1,
                                deposit: product_C.deposit,
                                count: 1,
                                additions: [],
                                product_id: product_C._id,
                                online:true
                            }],
                            offlineEntryCount: 0
                        }]
                }
            };

            // add A1 with count 1, B1 with count 2 to cart
            Routing.Cart.add_to_cart(SKU_A1._id, 1, test_user_token, true, function () {
                Routing.Cart.add_to_cart(SKU_B1._id, 2, test_user_token, true, function () {
                    Routing.Cart.add_to_cart(SKU_C1._id, 1, test_user_token, true, function () {
                        Routing.Cart.get_cart(test_user_token, function (body) {
                            body.should.containDeep(expected_cart_list);
                            done();
                        })
                    })
                })
            })
        });
        it('add SKU with additions to cart and query');
        it('modify count and query', function(done){
            var expected_cart_list = {
                code: 1000,
                datas: {
                    total: 1,
                    totalCount: 9999,
                    offlineEntryCount: 0,
                    rows: [{
                        brandName: brand_A.name,
                        SKUList: [{
                            goodsId: product_A.id,
                            name: product_A.name + ' - ' + SKU_attributes_A1[0].value + ' - ' + SKU_attributes_A1[1].value,
                            price: SKU_A1.price.platform_price,
                            productName: product_A.name,
                            attributes: SKU_attributes_A1,
                            deposit: product_A.deposit,
                            count: 9999,
                            additions: [],
                            product_id: product_A._id,
                            online:true
                        }],
                        offlineEntryCount: 0
                    }]
                }
            };
            Routing.Cart.add_to_cart(SKU_A1._id, 1, test_user_token, true, function () {
                Routing.Cart.update_cart(SKU_A1._id, 9999, test_user_token, false, function () {
                    Routing.Cart.get_cart(test_user_token, function (body) {
                        body.should.containDeep(expected_cart_list);
                        done();
                    })
                })
            })
        });
        it('delete and query', function(done){
            var expected_cart_list = {
                code: 1000,
                datas: {
                    total: 0,
                    totalCount: 0,
                    offlineEntryCount: 0,
                    rows: []
                }
            };
            Routing.Cart.add_to_cart(SKU_A1._id, 1, test_user_token, true, function () {
                Routing.Cart.update_cart(SKU_A1._id, 0, test_user_token, false, function () {
                    Routing.Cart.get_cart(test_user_token, function (body) {
                        body.should.containDeep(expected_cart_list);
                        done();
                    })
                })
            })
        });
        it('offline SKU in cart and query', function(done){
            var expected_cart_list = {
                code: 1000,
                datas: {
                    total: 1,
                    totalCount: 1,
                    offlineEntryCount: 1,
                    rows: [{
                        brandName: brand_A.name,
                        SKUList: [{
                            goodsId: product_A.id,
                            name: product_A.name + ' - ' + SKU_attributes_A1[0].value + ' - ' + SKU_attributes_A1[1].value,
                            price: SKU_A1.price.platform_price,
                            productName: product_A.name,
                            attributes: SKU_attributes_A1,
                            deposit: product_A.deposit,
                            count: 1,
                            additions: [],
                            product_id: product_A._id,
                            online:false
                        }],
                        offlineEntryCount: 1
                    }]
                }
            };
            Routing.Cart.add_to_cart(SKU_A1._id, 1, test_user_token, true, function () {
                Routing.Product.online_SKU(SKU_A1._id, false, backend_admin_token, function (body) {
                    Routing.Cart.get_cart(test_user_token, function (body) {
                        body.should.containDeep(expected_cart_list);
                        done();
                    })
                })
            })
        });
        it('get cart offline', function(done){
            var expected_cart_list = {
                code: 1000,
                datas: {
                    total: 1,
                    totalCount: 1,
                    offlineEntryCount: 0,
                    rows: [{
                        brandName: brand_A.name,
                        SKUList: [{
                            goodsId: product_A.id,
                            name: product_A.name + ' - ' + SKU_attributes_A1[0].value + ' - ' + SKU_attributes_A1[1].value,
                            price: SKU_A1.price.platform_price,
                            productName: product_A.name,
                            attributes: SKU_attributes_A1,
                            deposit: product_A.deposit,
                            count: 1,
                            product_id: product_A._id,
                            online:true
                        }],
                        offlineEntryCount: 0
                    }]
                }
            };
            Routing.Cart.get_cart_offline([{_id:SKU_A1._id, count:1}], function(body){
                body.should.containDeep(expected_cart_list);
                done();
            })
        });
    });
    describe('commit from cart and pay', function () {
        var cartId;
        var RSC_A, RSC_B;
        var RSC_A_token, RSC_B_token;
        var test_address_A, test_address_B;
        var brand_A;
        var product_A, product_B, product_C;
        var SKU_A1, SKU_A2, SKU_A3, SKU_B1, SKU_B2, SKU_C1;
        var test_user_consignee_address_id;
        // car can only ZITI, huafei can ZITI and SONGHUO
        before('prepare 3 SKU attributes for brand A and both category car and huafei', function(done){
            Components.prepare_SKU_attributes('化肥', 0, 0, 3, backend_admin_token, function(){
                Components.prepare_SKU_attributes('汽车', 0, 0, 3, backend_admin_token, done);
            })
        });
        before('create product A(car, SKU A1, A2, A3), B(huafei, SKU B1, B2), C(car, SKU C1). A with deposit, B without deposit, C without deposit', function(done){
            Components.prepare_SKU(backend_admin_token, 0, '汽车', 0, test_data.test_SKU, 0, function(brand, product, SKU, SKU_attributes){
                SKU_A1 = SKU;
                product_A = product;
                Components.prepare_SKU(backend_admin_token, 0, '汽车', 0, test_data.test_SKU, 1, function(brand, product, SKU, SKU_attributes) {
                    SKU_A2 = SKU;
                    Components.prepare_SKU(backend_admin_token, 0, '汽车', 0, test_data.test_SKU, 2, function(brand, product, SKU, SKU_attributes){
                        SKU_A3 = SKU;
                        Components.prepare_SKU(backend_admin_token, 0, '化肥', 1, test_data.test_SKU, 0, function(brand, product, SKU, SKU_attributes){
                            SKU_B1 = SKU;
                            product_B = product;
                            Components.prepare_SKU(backend_admin_token, 0, '化肥', 1, test_data.test_SKU, 1, function(brand, product, SKU, SKU_attributes){
                                SKU_B2 = SKU;
                                Components.prepare_SKU(backend_admin_token, 0, '汽车', 2, test_data.test_SKU, 0, function(brand, product, SKU, SKU_attributes){
                                    SKU_C1 = SKU;
                                    product_C = product;
                                    done();
                                });
                            });
                        });
                    });
                })
            })
        });
        before('add all SKU to cart with count 9999', function(done){
            Routing.Cart.add_to_cart(SKU_A1._id, 9999, test_user_token, true, function(){
                Routing.Cart.add_to_cart(SKU_A2._id, 9999, test_user_token, true, function(){
                    Routing.Cart.add_to_cart(SKU_A3._id, 9999, test_user_token, true, function(){
                        Routing.Cart.add_to_cart(SKU_B1._id, 9999, test_user_token, true, function(){
                            Routing.Cart.add_to_cart(SKU_B2._id, 9999, test_user_token, true, function(){
                                Routing.Cart.add_to_cart(SKU_C1._id, 9999, test_user_token, true, function(){
                                    done();
                                })
                            })
                        })
                    })
                })
            })
        });
        before('get cart id', function(done){
            Routing.Cart.get_cart(test_user_token, function(body){
                cartId = body.datas.shopCartId;
                done();
            })
        });
        before('prepare test address for RSC A', function(done){
            Routing.Address.get_address_by_name(test_data.test_address.province, test_data.test_address.city, test_data.test_address.county, test_data.test_address.town, function (err, address) {
                test_address_A = address;
                done();
            })
        });
        before('prepare test address for RSC B', function(done){
            Routing.Address.get_address_by_name(test_data.test_address_2.province, test_data.test_address_2.city, test_data.test_address_2.county, test_data.test_address_2.town, function (err, address) {
                test_address_B = address;
                done();
            })
        });
        before('create front end user 1 -> login -> verified as RSC -> bind RSC with product A,B.', function(done){
            var RSC = test_data.RSC(0);
            RSC.companyAddress = {
                province: test_address_A.province._id,
                city: test_address_A.city._id,
                county: test_address_A.county._id,
                town: test_address_A.town._id
            };
            RSC.products = [product_A._id, product_B._id];
            Components.create_RSC(RSC, backend_admin_token, function(user, token){
                RSC.id = user.userid;
                RSC._id = user._id;
                RSC_A = RSC;
                RSC_A_token = token;
                done();
            });
        });
        before('create front end user 2 -> login -> verified as RSC -> bind RSC with product A,C.', function(done){
            var RSC = test_data.RSC(1);
            RSC.companyAddress = {
                province: test_address_B.province._id,
                city: test_address_B.city._id,
                county: test_address_B.county._id,
                town: test_address_B.town._id
            };
            RSC.products = [product_A._id, product_C._id];
            Components.create_RSC(RSC, backend_admin_token, function(user, token){
                RSC.id = user.userid;
                RSC._id = user._id;
                RSC_B = RSC;
                RSC_B_token = token;
                done();
            });
        });
        before('add user consignee address', function(done){
            var test_consignee = test_user.user_address[0];
            Routing.User.add_user_address({
                provinceId:test_address.province.id,
                cityId:test_address.city.id,
                countyId:test_address.county.id,
                townId:test_address.town.id,
                detail:test_consignee.detail,
                receiptPeople:test_consignee.receiptPeople,
                receiptPhone:test_consignee.receiptPhone
            }, test_user_token, function(body) {
                body.should.have.property('code', 1000);
                test_user_consignee_address_id = body.datas.addressId;
                done();
            });
        });
        beforeEach('delete orders', function(done){
            OrderModel.find({}).remove(done);
        });
        describe('create order with RSC and order split', function(){
            it('commit with only ZITI products and the same RSC', function (done) {
                var expected_delivery_type = {
                    code:1000,
                    datas:{
                        count:1,
                        items:[{
                            deliveryType:1,
                            deliveryName:'网点自提'
                        }]
                    }
                };
                var expected_RSC_list_all = {
                    code:1000,
                    RSCs:[{
                        id:RSC_A.id
                    },{
                        id:RSC_B.id
                    }],
                    count:2,
                    pageCount:1
                };
                var expected_RSC_province_list = {
                    code:1000,
                    provinceList:[{
                        name:'河南'
                    }]
                };
                var expected_RSC_city_list = {
                    code:1000,
                    cityList:[{
                        name:'郑州'
                    },{
                        name:'开封'
                    }]
                };
                var expected_RSC_county_list = {
                    code:1000,
                    countyList:[{
                        name:'龙亭'
                    }]
                };
                var expected_RSC_town_list = {
                    code:1000,
                    townList:[{
                        name:'大兴街道'
                    }]
                };
                var expected_RSC_list_with_address_2 = {
                    code:1000,
                    RSCs:[{
                        id:RSC_B.id
                    }],
                    count:1,
                    pageCount:1
                };
                var expected_web_order_list = {
                    items:[{
                        price: SKU_A1.price.platform_price + SKU_A2.price.platform_price,
                        deposit: product_A.deposit + product_A.deposit,
                        consigneeName:test_user.consignee[0].name,
                        consigneePhone:test_user.consignee[0].phone,
                        SKUs:[{
                            attributes:SKU_A1.attributes,
                            category:'汽车',
                            count:1,
                            deliverStatus:1,
                            deposit:product_A.deposit,
                            name:SKU_A1.name,
                            price:SKU_A1.price.platform_price,
                            productId:product_A.id,
                            productName:product_A.name,
                            ref:SKU_A1._id
                        },{
                            attributes:SKU_A2.attributes,
                            category:'汽车',
                            count:1,
                            deliverStatus:1,
                            deposit:product_A.deposit,
                            name:SKU_A2.name,
                            price:SKU_A2.price.platform_price,
                            productId:product_A.id,
                            productName:product_A.name,
                            ref:SKU_A2._id
                        }],
                        duePrice:product_A.deposit + product_A.deposit,
                        deliveryType: 1,
                        payStatus: 1,
                        deliverStatus: 1,
                        RSCInfo:{
                            companyName:RSC_B.companyName,
                            RSCPhone:RSC_B.phone,
                            RSCAddress:test_address_B.province.name + test_address_B.city.name + test_address_B.county.name + test_address_B.town.name
                        },
                        typeValue:1,
                        order:{
                            totalPrice: (SKU_A1.price.platform_price + SKU_A2.price.platform_price).toFixed(2),
                            deposit:(product_A.deposit + product_A.deposit).toFixed(2),
                            orderStatus:{
                                value:'待付款'
                            },
                            deliveryType:{type:1, value:'网点自提'}
                        }
                    }]
                };
                var expected_app_order_list = {
                    code:'1000',
                    datas:{
                        total:1,
                        rows:[{
                            typeValue:1,
                            totalPrice: (SKU_A1.price.platform_price + SKU_A2.price.platform_price).toFixed(2),
                            goodsCount:2,
                            recipientName:test_user.consignee[0].name,
                            recipientPhone:test_user.consignee[0].phone,
                            deposit:(product_A.deposit + product_A.deposit).toFixed(2),
                            order:{
                                totalPrice: (SKU_A1.price.platform_price + SKU_A2.price.platform_price).toFixed(2),
                                deposit:(product_A.deposit + product_A.deposit).toFixed(2),
                                orderStatus:{
                                    value:'待付款'
                                },
                                deliveryType:{type:1, value:'网点自提'}
                            },
                            SKUs:[{
                                attributes:SKU_A1.attributes,
                                category:'汽车',
                                count:1,
                                deliverStatus:1,
                                deposit:product_A.deposit,
                                name:SKU_A1.name,
                                price:SKU_A1.price.platform_price,
                                productId:product_A.id,
                                productName:product_A.name,
                                ref:SKU_A1._id
                            },{
                                attributes:SKU_A2.attributes,
                                category:'汽车',
                                count:1,
                                deliverStatus:1,
                                deposit:product_A.deposit,
                                name:SKU_A2.name,
                                price:SKU_A2.price.platform_price,
                                productId:product_A.id,
                                productName:product_A.name,
                                ref:SKU_A2._id
                            }],
                            duePrice:(product_A.deposit + product_A.deposit).toFixed(2),
                            subOrders:[{
                                payStatus:1,
                                price:product_A.deposit + product_A.deposit,
                                type:'deposit'
                            },{
                                payStatus:1,
                                price:SKU_A1.price.platform_price + SKU_A2.price.platform_price-product_A.deposit-product_A.deposit,
                                type:'balance'
                            }],
                            RSCInfo:{
                                companyName:RSC_B.companyName,
                                RSCPhone:RSC_B.phone,
                                RSCAddress:test_address_B.province.name + test_address_B.city.name + test_address_B.county.name + test_address_B.town.name
                            }
                        }],
                        page:1,
                        pages:1
                    }
                };
                var expected_RSC_order_list = {
                    code:1000,
                    orders:[{
                        type:{value:'待付款'},
                        deliveryType:{type:1, value:'网点自提'},
                        RSCInfo:{
                            companyName:RSC_B.companyName,
                            RSCPhone:RSC_B.phone,
                            RSCAddress:test_address_B.province.name + test_address_B.city.name + test_address_B.county.name + test_address_B.town.name
                        },
                        SKUs:[{
                            attributes:SKU_A1.attributes,
                            category:'汽车',
                            count:1,
                            deliverStatus:1,
                            deposit:product_A.deposit,
                            name:SKU_A1.name,
                            price:SKU_A1.price.platform_price,
                            productId:product_A.id,
                            productName:product_A.name,
                            ref:SKU_A1._id
                        },{
                            attributes:SKU_A2.attributes,
                            category:'汽车',
                            count:1,
                            deliverStatus:1,
                            deposit:product_A.deposit,
                            name:SKU_A2.name,
                            price:SKU_A2.price.platform_price,
                            productId:product_A.id,
                            productName:product_A.name,
                            ref:SKU_A2._id
                        }],
                        price: SKU_A1.price.platform_price + SKU_A2.price.platform_price,
                        deposit: product_A.deposit + product_A.deposit,
                        consigneeName:test_user.consignee[0].name,
                        consigneePhone:test_user.consignee[0].phone,
                        duePrice:product_A.deposit + product_A.deposit,
                        payStatus: 1,
                        deliverStatus: 1,
                        subOrders:[{
                            payStatus:1,
                            price:product_A.deposit + product_A.deposit,
                            type:'deposit'
                        },{
                            payStatus:1,
                            price:SKU_A1.price.platform_price + SKU_A2.price.platform_price-product_A.deposit-product_A.deposit,
                            type:'balance'
                        }]
                    }],
                    count:1,
                    pageCount:1
                };
                // commit A1, A2
                // query delivery type, get only ZITI
                Routing.Cart.get_delivery_types([{_id:SKU_A1._id}, {_id:SKU_A2._id}], test_user_token, function(body){
                    body.should.containDeep(expected_delivery_type);
                    var deliveryType = body.datas.items[0].deliveryType;
                    // query RSC list with no address, get RSC 1 and 2
                    Routing.RSC.query_RSC_by_products(test_user_token, product_A._id, null, null, null, null, function(body) {
                        body.should.containDeep(expected_RSC_list_all);
                        // query RSC address list
                        Routing.RSC.query_RSC_province(test_user_token, product_A._id, function (body) {
                            body.should.containDeep(expected_RSC_province_list);
                            Routing.RSC.query_RSC_city(test_user_token, product_A._id, test_address_B.province._id, function (body) {
                                body.should.containDeep(expected_RSC_city_list);
                                Routing.RSC.query_RSC_county(test_user_token, product_A._id, test_address_B.province._id, test_address_B.city._id, function (body) {
                                    body.should.containDeep(expected_RSC_county_list);
                                    Routing.RSC.query_RSC_town(test_user_token, product_A._id, test_address_B.province._id, test_address_B.city._id, test_address_B.county._id, function (body) {
                                        body.should.containDeep(expected_RSC_town_list);
                                        // query RSC list address B, get RSC 1 and 2
                                        Routing.RSC.query_RSC_by_products(test_user_token, product_A._id, test_address_B.province._id, test_address_B.city._id, test_address_B.county._id, test_address_B.town._id, function (body) {
                                            body.should.containDeep(expected_RSC_list_with_address_2);
                                            var RSCId = body.RSCs[0]._id;
                                            // add order and user/RSC query order
                                            Routing.Order.add_order(cartId, null, [{
                                                _id: SKU_A1._id,
                                                count: 1
                                            }, {_id: SKU_A2._id, count: 1}], test_user_token, function (body) {
                                                body.should.have.property('code', 1000);
                                                Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, {code: '1000'}, expected_RSC_order_list, RSC_B_token, function () {
                                                    done();
                                                })
                                            }, deliveryType, RSCId, test_user.consignee[0].phone, test_user.consignee[0].name)
                                        })
                                    })
                                })
                            })
                        })
                    })
                });
            });
            it('commit with only ZITI products and not the same RSC', function (done) {
                // commit A1, B1, C1
                var expected_delivery_type = {
                    code:1000,
                    datas:{
                        count:1,
                        items:[{
                            deliveryType:1,
                            deliveryName:'网点自提'
                        }]
                    }
                };
                var expected_RSC_list_all = {
                    code:1000,
                    RSCs:[],
                    count:0,
                    pageCount:0
                };
                // query delivery type, get only ZITI
                // query RSC list, get nothing
                Routing.Cart.get_delivery_types([{_id:SKU_A1._id}, {_id:SKU_B1._id}, {_id:SKU_C1._id}], test_user_token, function(body) {
                    body.should.containDeep(expected_delivery_type);
                    Routing.RSC.query_RSC_by_products(test_user_token, product_A._id + ',' + product_B._id + ',' + product_C._id, null, null, null, null, function(body) {
                        body.should.containDeep(expected_RSC_list_all);
                        done();
                    })
                })
            });
            it('commit with SONGHUO products', function (done) {
                // commit B1, B2
                var expected_delivery_type = {
                    code:1000,
                    datas:{
                        count:2,
                        items:[{
                            deliveryType:1,
                            deliveryName:'网点自提'
                        },{
                            deliveryType:2,
                            deliveryName:'配送到户'
                        }]
                    }
                };
                var expected_RSC_list_all = {
                    code:1000,
                    RSCs:[{
                        id:RSC_A.id
                    }],
                    count:1,
                    pageCount:1
                };
                var expected_web_order_list = {
                    items:[{
                        price: SKU_B1.price.platform_price + SKU_B2.price.platform_price,
                        deposit: product_B.deposit + product_B.deposit,
                        consigneeName:test_user.user_address[0].receiptPeople,
                        consigneePhone:test_user.user_address[0].receiptPhone,
                        SKUs:[{
                            attributes:SKU_B1.attributes,
                            category:'化肥',
                            count:1,
                            deliverStatus:1,
                            deposit:product_B.deposit,
                            name:SKU_B1.name,
                            price:SKU_B1.price.platform_price,
                            productId:product_B.id,
                            productName:product_B.name,
                            ref:SKU_B1._id
                        },{
                            attributes:SKU_B2.attributes,
                            category:'化肥',
                            count:1,
                            deliverStatus:1,
                            deposit:product_B.deposit,
                            name:SKU_B2.name,
                            price:SKU_B2.price.platform_price,
                            productId:product_B.id,
                            productName:product_B.name,
                            ref:SKU_B2._id
                        }],
                        duePrice:SKU_B1.price.platform_price + SKU_B2.price.platform_price,
                        payStatus: 1,
                        deliverStatus: 1,
                        RSCInfo:{
                            companyName:RSC_A.companyName,
                            RSCPhone:RSC_A.phone,
                            RSCAddress:test_address_A.province.name + test_address_A.city.name + test_address_A.county.name + test_address_A.town.name
                        },
                        typeValue:1,
                        order:{
                            totalPrice: (SKU_B1.price.platform_price + SKU_B2.price.platform_price).toFixed(2),
                            deposit:(product_B.deposit + product_B.deposit).toFixed(2),
                            orderStatus:{
                                value:'待付款'
                            },
                            deliveryType:{type:2, value:'配送到户'}
                        }
                    }]
                };
                var expected_app_order_list = {
                    code:'1000',
                    datas:{
                        total:1,
                        rows:[{
                            typeValue:1,
                            totalPrice: (SKU_B1.price.platform_price + SKU_B2.price.platform_price).toFixed(2),
                            goodsCount:2,
                            recipientName:test_user.user_address[0].receiptPeople,
                            recipientPhone:test_user.user_address[0].receiptPhone,
                            deposit:(SKU_B1.price.platform_price + SKU_B2.price.platform_price).toFixed(2),
                            order:{
                                totalPrice: (SKU_B1.price.platform_price + SKU_B2.price.platform_price).toFixed(2),
                                deposit:(product_B.deposit + product_B.deposit).toFixed(2),
                                orderStatus:{
                                    value:'待付款'
                                },
                                deliveryType:{type:2, value:'配送到户'}
                            },
                            SKUs:[{
                                attributes:SKU_B1.attributes,
                                category:'化肥',
                                count:1,
                                deliverStatus:1,
                                deposit:product_B.deposit,
                                name:SKU_B1.name,
                                price:SKU_B1.price.platform_price,
                                productId:product_B.id,
                                productName:product_B.name,
                                ref:SKU_B1._id
                            },{
                                attributes:SKU_B2.attributes,
                                category:'化肥',
                                count:1,
                                deliverStatus:1,
                                deposit:product_B.deposit,
                                name:SKU_B2.name,
                                price:SKU_B2.price.platform_price,
                                productId:product_B.id,
                                productName:product_B.name,
                                ref:SKU_B2._id
                            }],
                            duePrice:(SKU_B1.price.platform_price + SKU_B2.price.platform_price).toFixed(2),
                            subOrders:[{
                                payStatus:1,
                                price:SKU_B1.price.platform_price + SKU_B2.price.platform_price,
                                type:'full'
                            }],
                            RSCInfo:{
                                companyName:RSC_A.companyName,
                                RSCPhone:RSC_A.phone,
                                RSCAddress:test_address_A.province.name + test_address_A.city.name + test_address_A.county.name + test_address_A.town.name
                            }
                        }],
                        page:1,
                        pages:1
                    }
                };
                var expected_RSC_order_list = {
                    code:1000,
                    orders:[{
                        type:{value:'待付款'},
                        deliveryType:{type:2, value:'配送到户'},
                        RSCInfo:{
                            companyName:RSC_A.companyName,
                            RSCPhone:RSC_A.phone,
                            RSCAddress:test_address_A.province.name + test_address_A.city.name + test_address_A.county.name + test_address_A.town.name
                        },
                        SKUs:[{
                            attributes:SKU_B1.attributes,
                            category:'化肥',
                            count:1,
                            deliverStatus:1,
                            deposit:product_B.deposit,
                            name:SKU_B1.name,
                            price:SKU_B1.price.platform_price,
                            productId:product_B.id,
                            productName:product_B.name,
                            ref:SKU_B1._id
                        },{
                            attributes:SKU_B2.attributes,
                            category:'化肥',
                            count:1,
                            deliverStatus:1,
                            deposit:product_B.deposit,
                            name:SKU_B2.name,
                            price:SKU_B2.price.platform_price,
                            productId:product_B.id,
                            productName:product_B.name,
                            ref:SKU_B2._id
                        }],
                        price: SKU_B1.price.platform_price + SKU_B2.price.platform_price,
                        deposit: product_B.deposit + product_B.deposit,
                        consigneeName:test_user.user_address[0].receiptPeople,
                        consigneePhone:test_user.user_address[0].receiptPhone,
                        duePrice:SKU_B1.price.platform_price + SKU_B2.price.platform_price,
                        payStatus: 1,
                        deliverStatus: 1,
                        subOrders:[{
                            payStatus:1,
                            price:SKU_B1.price.platform_price + SKU_B2.price.platform_price,
                            type:'full'
                        }]
                    }],
                    count:1,
                    pageCount:1
                };
                // query delivery type, get ZITI and SONGHUO and choose SONGHUO
                // add order and user/RSC query order
                // bind order to RSC and query RSC order
                Routing.Cart.get_delivery_types([{_id:SKU_B1._id}, {_id:SKU_B2._id}], test_user_token, function(body) {
                    body.should.containDeep(expected_delivery_type);
                    var deliveryType = body.datas.items[0].deliveryType;
                    Routing.RSC.query_RSC_by_products(test_user_token, product_B._id, null, null, null, null, function(body) {
                        body.should.containDeep(expected_RSC_list_all);
                        var RSCId = body.RSCs[0]._id;
                        Routing.Order.add_order(cartId, test_user_consignee_address_id, [{
                            _id: SKU_B1._id,
                            count: 1
                        }, {_id: SKU_B2._id, count: 1}], test_user_token, function (body) {
                            body.should.have.property('code', 1000);
                            var orderId = body.id;
                            Routing.Order.change_RSC(backend_admin_token, orderId, {
                                RSC: RSCId,
                                companyName: RSC_A.companyName,
                                RSCPhone: RSC_A.phone,
                                RSCAddress: test_address_A.province.name + test_address_A.city.name + test_address_A.county.name + test_address_A.town.name
                            }, function (body) {
                                Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, {code:'1000'}, expected_RSC_order_list, RSC_A_token, function(){
                                    done();
                                })
                            })
                        }, deliveryType)
                    })
                })
            });
            it('commit with both deposit and non-deposit products', function (done) {
                // commit A1, B1
                var expected_delivery_type = {
                    code:1000,
                    datas:{
                        count:1,
                        items:[{
                            deliveryType:1,
                            deliveryName:'网点自提'
                        }]
                    }
                };
                var expected_RSC_list_all = {
                    code:1000,
                    RSCs:[{
                        id:RSC_A.id
                    }],
                    count:1,
                    pageCount:1
                };
                var expected_web_order_list = {
                    items:[{
                        price: SKU_A1.price.platform_price,
                        deposit: product_A.deposit,
                        consigneeName:test_user.consignee[0].name,
                        consigneePhone:test_user.consignee[0].phone,
                        SKUs:[{
                            attributes:SKU_A1.attributes,
                            category:'汽车',
                            count:1,
                            deliverStatus:1,
                            deposit:product_A.deposit,
                            name:SKU_A1.name,
                            price:SKU_A1.price.platform_price,
                            productId:product_A.id,
                            productName:product_A.name,
                            ref:SKU_A1._id
                        }],
                        duePrice:product_A.deposit,
                        deliveryType: 1,
                        payStatus: 1,
                        deliverStatus: 1,
                        RSCInfo:{
                            companyName:RSC_A.companyName,
                            RSCPhone:RSC_A.phone,
                            RSCAddress:test_address_A.province.name + test_address_A.city.name + test_address_A.county.name + test_address_A.town.name
                        },
                        typeValue:1,
                        order:{
                            totalPrice: (SKU_A1.price.platform_price).toFixed(2),
                            deposit:(product_A.deposit).toFixed(2),
                            orderStatus:{
                                value:'待付款'
                            },
                            deliveryType:{type:1, value:'网点自提'}
                        }
                    },{
                        price: SKU_B1.price.platform_price,
                        deposit: product_B.deposit,
                        consigneeName:test_user.consignee[0].name,
                        consigneePhone:test_user.consignee[0].phone,
                        SKUs:[{
                            attributes:SKU_B1.attributes,
                            category:'化肥',
                            count:1,
                            deliverStatus:1,
                            deposit:product_B.deposit,
                            name:SKU_B1.name,
                            price:SKU_B1.price.platform_price,
                            productId:product_B.id,
                            productName:product_B.name,
                            ref:SKU_B1._id
                        }],
                        duePrice:SKU_B1.price.platform_price,
                        deliveryType: 1,
                        payStatus: 1,
                        deliverStatus: 1,
                        RSCInfo:{
                            companyName:RSC_A.companyName,
                            RSCPhone:RSC_A.phone,
                            RSCAddress:test_address_A.province.name + test_address_A.city.name + test_address_A.county.name + test_address_A.town.name
                        },
                        typeValue:1,
                        order:{
                            totalPrice: (SKU_B1.price.platform_price).toFixed(2),
                            deposit:(product_B.deposit).toFixed(2),
                            orderStatus:{
                                value:'待付款'
                            },
                            deliveryType:{type:1, value:'网点自提'}
                        }
                    }]
                };
                var expected_app_order_list = {
                    code:'1000',
                    datas:{
                        total:2,
                        rows:[{
                            typeValue:1,
                            totalPrice: (SKU_A1.price.platform_price).toFixed(2),
                            goodsCount:1,
                            recipientName:test_user.consignee[0].name,
                            recipientPhone:test_user.consignee[0].phone,
                            deposit:(product_A.deposit).toFixed(2),
                            order:{
                                totalPrice: (SKU_A1.price.platform_price).toFixed(2),
                                deposit:(product_A.deposit).toFixed(2),
                                orderStatus:{
                                    value:'待付款'
                                },
                                deliveryType:{type:1, value:'网点自提'}
                            },
                            SKUs:[{
                                attributes:SKU_A1.attributes,
                                category:'汽车',
                                count:1,
                                deliverStatus:1,
                                deposit:product_A.deposit,
                                name:SKU_A1.name,
                                price:SKU_A1.price.platform_price,
                                productId:product_A.id,
                                productName:product_A.name,
                                ref:SKU_A1._id
                            }],
                            duePrice:(product_A.deposit).toFixed(2),
                            subOrders:[{
                                payStatus:1,
                                price:product_A.deposit,
                                type:'deposit'
                            },{
                                payStatus:1,
                                price:SKU_A1.price.platform_price-product_A.deposit,
                                type:'balance'
                            }],
                            RSCInfo:{
                                companyName:RSC_A.companyName,
                                RSCPhone:RSC_A.phone,
                                RSCAddress:test_address_A.province.name + test_address_A.city.name + test_address_A.county.name + test_address_A.town.name
                            }
                        },{
                            typeValue:1,
                            totalPrice: (SKU_B1.price.platform_price).toFixed(2),
                            goodsCount:1,
                            recipientName:test_user.consignee[0].name,
                            recipientPhone:test_user.consignee[0].phone,
                            deposit:(SKU_B1.price.platform_price).toFixed(2),
                            order:{
                                totalPrice: (SKU_B1.price.platform_price).toFixed(2),
                                deposit:(product_B.deposit).toFixed(2),
                                orderStatus:{
                                    value:'待付款'
                                },
                                deliveryType:{type:1, value:'网点自提'}
                            },
                            SKUs:[{
                                attributes:SKU_B1.attributes,
                                category:'化肥',
                                count:1,
                                deliverStatus:1,
                                deposit:product_B.deposit,
                                name:SKU_B1.name,
                                price:SKU_B1.price.platform_price,
                                productId:product_B.id,
                                productName:product_B.name,
                                ref:SKU_B1._id
                            }],
                            duePrice:(SKU_B1.price.platform_price).toFixed(2),
                            subOrders:[{
                                payStatus:1,
                                price:SKU_B1.price.platform_price-product_B.deposit,
                                type:'full'
                            }],
                            RSCInfo:{
                                companyName:RSC_A.companyName,
                                RSCPhone:RSC_A.phone,
                                RSCAddress:test_address_A.province.name + test_address_A.city.name + test_address_A.county.name + test_address_A.town.name
                            }
                        }],
                        page:1,
                        pages:1
                    }
                };
                var expected_RSC_order_list = {
                    code:1000,
                    orders:[{
                        type:{value:'待付款'},
                        deliveryType:{type:1, value:'网点自提'},
                        RSCInfo:{
                            companyName:RSC_A.companyName,
                            RSCPhone:RSC_A.phone,
                            RSCAddress:test_address_A.province.name + test_address_A.city.name + test_address_A.county.name + test_address_A.town.name
                        },
                        SKUs:[{
                            attributes:SKU_A1.attributes,
                            category:'汽车',
                            count:1,
                            deliverStatus:1,
                            deposit:product_A.deposit,
                            name:SKU_A1.name,
                            price:SKU_A1.price.platform_price,
                            productId:product_A.id,
                            productName:product_A.name,
                            ref:SKU_A1._id
                        }],
                        price: SKU_A1.price.platform_price,
                        deposit: product_A.deposit,
                        consigneeName:test_user.consignee[0].name,
                        consigneePhone:test_user.consignee[0].phone,
                        duePrice:product_A.deposit,
                        payStatus: 1,
                        deliverStatus: 1,
                        subOrders:[{
                            payStatus:1,
                            price:product_A.deposit,
                            type:'deposit'
                        },{
                            payStatus:1,
                            price:SKU_A1.price.platform_price-product_A.deposit,
                            type:'balance'
                        }]
                    },{
                        type:{value:'待付款'},
                        deliveryType:{type:1, value:'网点自提'},
                        RSCInfo:{
                            companyName:RSC_A.companyName,
                            RSCPhone:RSC_A.phone,
                            RSCAddress:test_address_A.province.name + test_address_A.city.name + test_address_A.county.name + test_address_A.town.name
                        },
                        SKUs:[{
                            attributes:SKU_B1.attributes,
                            category:'化肥',
                            count:1,
                            deliverStatus:1,
                            deposit:product_B.deposit,
                            name:SKU_B1.name,
                            price:SKU_B1.price.platform_price,
                            productId:product_B.id,
                            productName:product_B.name,
                            ref:SKU_B1._id
                        }],
                        price: SKU_B1.price.platform_price,
                        deposit: product_B.deposit,
                        consigneeName:test_user.consignee[0].name,
                        consigneePhone:test_user.consignee[0].phone,
                        duePrice:SKU_B1.price.platform_price,
                        payStatus: 1,
                        deliverStatus: 1,
                        subOrders:[{
                            payStatus:1,
                            price:SKU_B1.price.platform_price-product_B.deposit,
                            type:'full'
                        }]
                    }],
                    count:2,
                    pageCount:1
                };
                // query delivery type, get ZITI and choose ZITI
                // query RSC list, get 1, and choose 1
                // add order and query user/RSC order, get two order with A1, and B1 in order
                Routing.Cart.get_delivery_types([{_id:SKU_A1._id}, {_id:SKU_B1._id}], test_user_token, function(body) {
                    body.should.containDeep(expected_delivery_type);
                    var deliveryType = body.datas.items[0].deliveryType;
                    // query RSC list with no address, get RSC 1 and 2
                    Routing.RSC.query_RSC_by_products(test_user_token, product_A._id + ',' + product_B._id, null, null, null, null, function (body) {
                        body.should.containDeep(expected_RSC_list_all);
                        var RSCId = body.RSCs[0]._id;
                        Routing.Order.add_order(cartId, null, [{_id: SKU_A1._id, count: 1}, {
                            _id: SKU_B1._id,
                            count: 1
                        }], test_user_token, function (body) {
                            body.should.have.property('code', 1000);
                            Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, {code:'1000'}, expected_RSC_order_list, RSC_A_token, function(){
                                done();
                            })
                        }, deliveryType, RSCId, test_user.consignee[0].phone, test_user.consignee[0].name)
                    })
                })
            })
        });
        describe('Confirm offline pay api', function(){
            var paymentId;
            beforeEach('add order and offline pay', function(done){
                Routing.Order.add_order(cartId, null, [{_id: SKU_A1._id, count: 1}, {_id: SKU_C1._id, count: 1}], test_user_token, function (body) {
                    body.should.have.property('code', 1000);
                    paymentId = body.paymentId;
                    var orderId = body.id;
                    Routing.Order.pay_offline(test_user_token, orderId, function (body) {
                        body.should.have.property('code', 1000);
                        done();
                    })
                }, 1, RSC_B._id, test_user.consignee[0].phone, test_user.consignee[0].name);
            });

            it('confirm payment w/ invalid payment id', function(done){
                Routing.RSC.confirm_offline_pay(RSC_B_token, 'invalid payment id', 1, function (body) {
                    body.should.have.properties({code:1002, message:'获取订单失败'});
                    done();
                })
            });

            it('confirm payment not belong to this RSC', function(done){
                Routing.RSC.confirm_offline_pay(RSC_A_token, paymentId, 1, function (body) {
                    body.should.have.properties({code:1002, message:'该订单未分配到县级网点'});
                    done();
                })
            });

            it('confirm payment that is already confirmed', function(done){
                Routing.RSC.confirm_offline_pay(RSC_B_token, paymentId, 1, function (body) {
                    body.should.have.property('code', 1000);
                    Routing.RSC.confirm_offline_pay(RSC_B_token, paymentId, 1, function (body) {
                        body.should.have.properties({code:1002, message:'订单已审核'});
                        done();
                    })
                })
            })
        });
        describe('order pay and deliver process', function(){
            it('ZITI process', function(done) {
                var expected_web_order_list = {
                    items: [{
                        SKUs: [{
                            deliverStatus: 1,
                            ref: SKU_A1._id
                        }, {
                            deliverStatus: 1,
                            ref: SKU_C1._id
                        }],
                        deliveryType: 1,
                        payStatus: 1,
                        deliverStatus: 1,
                        typeValue: 1,
                        order: {
                            orderStatus: {
                                value: '付款待审核'
                            },
                            deliveryType: {type: 1, value: '网点自提'}
                        }
                    }]
                };
                var expected_app_order_list = {
                    code: '1000',
                    datas: {
                        total: 1,
                        rows: [{
                            typeValue: 1,
                            order: {
                                orderStatus: {
                                    value: '付款待审核'
                                },
                                deliveryType: {type: 1, value: '网点自提'}
                            },
                            SKUs: [{
                                deliverStatus: 1,
                                ref: SKU_A1._id
                            }, {
                                deliverStatus: 1,
                                ref: SKU_C1._id
                            }],
                            subOrders: [{
                                payStatus: 1,
                                type: 'deposit'
                            }, {
                                payStatus: 1,
                                type: 'balance'
                            }]
                        }],
                        page: 1,
                        pages: 1
                    }
                };
                var expected_order_detail = {
                    code: '1000',
                    datas: {
                        rows: {
                            orderType: 1,
                            payStatus: 1,
                            deliverStatus: 1,
                            subOrders: [{
                                payStatus: 1,
                                type: 'deposit'
                            }, {
                                payStatus: 1,
                                type: 'balance'
                            }],
                            paySubOrderType: 'deposit',
                            SKUList: [{
                                deliverStatus: 1,
                                ref: SKU_A1._id
                            }, {
                                deliverStatus: 1,
                                ref: SKU_C1._id
                            }],
                            order: {
                                orderStatus: {
                                    value: '付款待审核'
                                },
                                deliveryType: {type: 1, value: '网点自提'}
                            }
                        }
                    }
                };
                var expected_RSC_order_list = {
                    code: 1000,
                    orders: [{
                        type: {value: '付款待审核'},
                        deliveryType: {type: 1, value: '网点自提'},
                        SKUs: [{
                            deliverStatus: 1,
                            ref: SKU_A1._id
                        }, {
                            deliverStatus: 1,
                            ref: SKU_C1._id
                        }],
                        payStatus: 1,
                        deliverStatus: 1,
                        subOrders: [{
                            payStatus: 1,
                            type: 'deposit'
                        }, {
                            payStatus: 1,
                            type: 'balance'
                        }]
                    }],
                    count: 1,
                    pageCount: 1
                };
                // create order with 2 SKU A1 C1 with deposit, pay offline, query order and got pending-approve
                Routing.Order.add_order(cartId, null, [{_id: SKU_A1._id, count: 1}, {_id: SKU_C1._id, count: 1}], test_user_token, function (body) {
                    body.should.have.property('code', 1000);
                    var orderId = body.id;
                    Routing.Order.pay_offline(test_user_token, orderId, function (body) {
                        body.should.have.property('code', 1000);
                        Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_B_token, function(paymentId) {
                            // RSC confirm offline pay and query, got 待付款
                            Routing.RSC.confirm_offline_pay(RSC_B_token, paymentId, 1, function (body) {
                                body.should.have.property('code', 1000);
                                expected_web_order_list.items[0].payStatus =
                                    expected_order_detail.datas.rows.payStatus =
                                        expected_RSC_order_list.orders[0].payStatus = 3;
                                expected_web_order_list.items[0].order.orderStatus.value =
                                    expected_app_order_list.datas.rows[0].order.orderStatus.value =
                                        expected_order_detail.datas.rows.order.orderStatus.value = '部分付款';
                                expected_app_order_list.datas.rows[0].subOrders =
                                    expected_order_detail.datas.rows.subOrders =
                                        expected_RSC_order_list.orders[0].subOrders = [{
                                            payStatus: 2,
                                            type: 'deposit'
                                        }, {
                                            payStatus: 1,
                                            type: 'balance'
                                        }];
                                expected_order_detail.datas.rows.paySubOrderType = 'balance';
                                expected_RSC_order_list.orders[0].type.value = '待付款';
                                Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_B_token, function(paymentId) {
                                    // backend deliver A1 to RSC and query order, user get 待付款 and RSC got 已到服务站
                                    Routing.Order.deliver_SKU_to_RSC(backend_admin_token, orderId, [{
                                        ref: SKU_A1._id,
                                        deliverStatus: 4
                                    }], function (body) {
                                        body.should.have.property('code', 1000);
                                        expected_web_order_list.items[0].deliverStatus =
                                            expected_order_detail.datas.rows.deliverStatus =
                                                expected_RSC_order_list.orders[0].deliverStatus = 4;
                                        expected_web_order_list.items[0].SKUs =
                                            expected_app_order_list.datas.rows[0].SKUs =
                                                expected_order_detail.datas.rows.SKUList =
                                                    expected_RSC_order_list.orders[0].SKUs = [{
                                                        deliverStatus: 4,
                                                        ref: SKU_A1._id
                                                    }, {
                                                        deliverStatus: 1,
                                                        ref: SKU_C1._id
                                                    }];
                                        Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_B_token, function(paymentId) {
                                            // user pay balance and query order, get 待自提, user get delivery code
                                            Routing.Order.pay_offline(test_user_token, orderId, function (body) {
                                                body.should.have.property('code', 1000);
                                                Routing.RSC.confirm_offline_pay(RSC_B_token, paymentId, 1, function (body) {
                                                    body.should.have.property('code', 1000);

                                                    expected_web_order_list.items[0].typeValue =
                                                        expected_app_order_list.datas.rows[0].typeValue =
                                                            expected_order_detail.datas.rows.orderType = 3;
                                                    expected_web_order_list.items[0].payStatus =
                                                        expected_order_detail.datas.rows.payStatus =
                                                            expected_RSC_order_list.orders[0].payStatus = 2;
                                                    expected_web_order_list.items[0].order.orderStatus.value =
                                                        expected_app_order_list.datas.rows[0].order.orderStatus.value =
                                                            expected_order_detail.datas.rows.order.orderStatus.value =
                                                                expected_RSC_order_list.orders[0].type.value = '待自提';
                                                    expected_app_order_list.datas.rows[0].subOrders =
                                                        expected_order_detail.datas.rows.subOrders =
                                                            expected_RSC_order_list.orders[0].subOrders = [{
                                                                payStatus: 2,
                                                                type: 'deposit'
                                                            }, {
                                                                payStatus: 2,
                                                                type: 'balance'
                                                            }];
                                                    expected_order_detail.datas.rows.paySubOrderType = undefined;
                                                    Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_B_token, function (paymentId) {
                                                        Routing.Order.get_delivery_code(test_user_token, orderId, function (body) {
                                                            body.should.have.property('code', 1000);
                                                            body.should.have.property('deliveryCode');
                                                            var deliveryCode = body.deliveryCode;

                                                            // RSC self-deliver A1, query order, get 待自提
                                                            Routing.Order.self_delivery(RSC_B_token, orderId, deliveryCode, [SKU_A1._id], function (body) {
                                                                body.should.have.property('code', 1000);
                                                                expected_web_order_list.items[0].deliverStatus =
                                                                    expected_order_detail.datas.rows.deliverStatus =
                                                                        expected_RSC_order_list.orders[0].deliverStatus = 3;
                                                                expected_web_order_list.items[0].SKUs =
                                                                    expected_app_order_list.datas.rows[0].SKUs =
                                                                        expected_order_detail.datas.rows.SKUList =
                                                                            expected_RSC_order_list.orders[0].SKUs = [{
                                                                                deliverStatus: 5,
                                                                                ref: SKU_A1._id
                                                                            }, {
                                                                                deliverStatus: 1,
                                                                                ref: SKU_C1._id
                                                                            }];
                                                                Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_B_token, function (paymentId) {
                                                                    // backend deliver C1 to RSC and query order, get 待自提
                                                                    Routing.Order.deliver_SKU_to_RSC(backend_admin_token, orderId, [{
                                                                        ref: SKU_C1._id,
                                                                        deliverStatus: 4
                                                                    }], function (body) {
                                                                        body.should.have.property('code', 1000);
                                                                        expected_web_order_list.items[0].SKUs =
                                                                            expected_app_order_list.datas.rows[0].SKUs =
                                                                                expected_order_detail.datas.rows.SKUList =
                                                                                    expected_RSC_order_list.orders[0].SKUs = [{
                                                                                        deliverStatus: 5,
                                                                                        ref: SKU_A1._id
                                                                                    }, {
                                                                                        deliverStatus: 4,
                                                                                        ref: SKU_C1._id
                                                                                    }];
                                                                        Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_B_token, function (paymentId) {
                                                                            // RSC self-deliver C1, query order, get 已完成
                                                                            Routing.Order.self_delivery(RSC_B_token, orderId, deliveryCode, [SKU_C1._id], function (body) {
                                                                                body.should.have.property('code', 1000);
                                                                                expected_web_order_list.items[0].typeValue =
                                                                                    expected_app_order_list.datas.rows[0].typeValue =
                                                                                        expected_order_detail.datas.rows.orderType = 4;
                                                                                expected_web_order_list.items[0].deliverStatus =
                                                                                    expected_order_detail.datas.rows.deliverStatus =
                                                                                        expected_RSC_order_list.orders[0].deliverStatus = 2;
                                                                                expected_web_order_list.items[0].SKUs =
                                                                                    expected_app_order_list.datas.rows[0].SKUs =
                                                                                        expected_order_detail.datas.rows.SKUList =
                                                                                            expected_RSC_order_list.orders[0].SKUs = [{
                                                                                                deliverStatus: 5,
                                                                                                ref: SKU_A1._id
                                                                                            }, {
                                                                                                deliverStatus: 5,
                                                                                                ref: SKU_C1._id
                                                                                            }];
                                                                                expected_web_order_list.items[0].order.orderStatus.value =
                                                                                    expected_app_order_list.datas.rows[0].order.orderStatus.value =
                                                                                        expected_order_detail.datas.rows.order.orderStatus.value =
                                                                                            expected_RSC_order_list.orders[0].type.value = '已完成';
                                                                                expected_web_order_list.items[0].deliverStatus =
                                                                                    expected_order_detail.datas.rows.deliverStatus =
                                                                                        expected_RSC_order_list.orders[0].deliverStatus = 5;
                                                                                Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_B_token, function (paymentId) {
                                                                                    done();
                                                                                }, 4, 4, 5)
                                                                            })
                                                                        }, 3, 3, 4)
                                                                    })
                                                                }, 3, 3, 4)
                                                            })
                                                        })
                                                    }, 3, 3, 4)
                                                })
                                            })
                                        }, 1, 1, 1)
                                    })
                                }, 1, 1, 1)
                            })
                        }, 1, 1, 2)
                    })
                }, 1, RSC_B._id, test_user.consignee[0].phone, test_user.consignee[0].name);
            });
            it('SONGHUO process', function(done){
                var expected_web_order_list = {
                    items: [{
                        SKUs: [{
                            deliverStatus: 1,
                            ref: SKU_B1._id
                        }, {
                            deliverStatus: 1,
                            ref: SKU_B2._id
                        }],
                        deliveryType: 2,
                        payStatus: 1,
                        deliverStatus: 1,
                        typeValue: 1,
                        order: {
                            orderStatus: {
                                value: '付款待审核'
                            }
                        }
                    }]
                };
                var expected_app_order_list = {
                    code: '1000',
                    datas: {
                        total: 1,
                        rows: [{
                            typeValue: 1,
                            order: {
                                orderStatus: {
                                    value: '付款待审核'
                                }
                            },
                            SKUs: [{
                                deliverStatus: 1,
                                ref: SKU_B1._id
                            }, {
                                deliverStatus: 1,
                                ref: SKU_B2._id
                            }],
                            subOrders: [{
                                payStatus: 1,
                                type: 'full'
                            }]
                        }],
                        page: 1,
                        pages: 1
                    }
                };
                var expected_order_detail = {
                    code: '1000',
                    datas: {
                        rows: {
                            orderType: 1,
                            payStatus: 1,
                            deliverStatus: 1,
                            subOrders: [{
                                payStatus: 1,
                                type: 'full'
                            }],
                            paySubOrderType: 'full',
                            SKUList: [{
                                deliverStatus: 1,
                                ref: SKU_B1._id
                            }, {
                                deliverStatus: 1,
                                ref: SKU_B2._id
                            }],
                            order: {
                                orderStatus: {
                                    value: '付款待审核'
                                }
                            }
                        }
                    }
                };
                var expected_RSC_order_list = {
                    code: 1000,
                    orders: [{
                        type: {value: '付款待审核'},
                        SKUs: [{
                            deliverStatus: 1,
                            ref: SKU_B1._id
                        }, {
                            deliverStatus: 1,
                            ref: SKU_B2._id
                        }],
                        payStatus: 1,
                        deliverStatus: 1,
                        subOrders: [{
                            payStatus: 1,
                            type: 'full'
                        }]
                    }],
                    count: 1,
                    pageCount: 1
                };
                // create order with B1, B2, pay offline and query order
                Routing.Order.add_order(cartId, test_user_consignee_address_id, [{_id: SKU_B1._id, count: 1}, {
                    _id: SKU_B2._id,
                    count: 1
                }], test_user_token, function (body) {
                    body.should.have.property('code', 1000);
                    var orderId = body.id;
                    Routing.Order.pay_offline(test_user_token, orderId, function (body) {
                        body.should.have.property('code', 1000);
                        Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, {code: 1000, orders: [], count: 0, pageCount: 0}, RSC_A_token, function (paymentId) {
                            // backend bind order to RSC, RSC confirm offline pay and deliver B1 to RSC, query order, got 待发货
                            Routing.Order.change_RSC(backend_admin_token, orderId, {
                                RSC: RSC_A._id,
                                companyName: RSC_A.companyName,
                                RSCPhone: RSC_A.phone,
                                RSCAddress: test_address_A.province.name + test_address_A.city.name + test_address_A.county.name + test_address_A.town.name
                            }, function (body) {
                                body.should.have.property('code', 1000);
                                Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_A_token, function(paymentId){
                                    Routing.RSC.confirm_offline_pay(RSC_A_token, paymentId, 1, function(body){
                                        Routing.Order.deliver_SKU_to_RSC(backend_admin_token, orderId, [{ref: SKU_B1._id, deliverStatus: 4}], function(body){
                                            body.should.have.property('code', 1000);
                                            expected_web_order_list.items[0].SKUs =
                                                expected_app_order_list.datas.rows[0].SKUs =
                                                    expected_order_detail.datas.rows.SKUList =
                                                        expected_RSC_order_list.orders[0].SKUs =
                                                            [{
                                                                deliverStatus: 4,
                                                                ref: SKU_B1._id
                                                            }, {
                                                                deliverStatus: 1,
                                                                ref: SKU_B2._id
                                                            }];
                                            expected_web_order_list.items[0].deliverStatus =
                                                expected_order_detail.datas.rows.deliverStatus =
                                                    expected_RSC_order_list.orders[0].deliverStatus = 4;
                                            expected_web_order_list.items[0].typeValue =
                                                expected_app_order_list.datas.rows[0].typeValue =
                                                    expected_order_detail.datas.rows.orderType = 2;
                                            expected_web_order_list.items[0].payStatus =
                                                expected_order_detail.datas.rows.payStatus =
                                                    expected_RSC_order_list.orders[0].payStatus = 2;
                                            expected_app_order_list.datas.rows[0].subOrders =
                                                expected_order_detail.datas.rows.subOrders =
                                                    expected_RSC_order_list.orders[0].subOrders = [{
                                                        payStatus: 2,
                                                        type: 'full'
                                                    }];
                                            expected_app_order_list.datas.rows[0].order.orderStatus.value =
                                                expected_web_order_list.items[0].order.orderStatus.value =
                                                    expected_order_detail.datas.rows.order.orderStatus.value = '待发货';
                                            expected_RSC_order_list.orders[0].type.value = '待配送';
                                            expected_order_detail.datas.rows.paySubOrderType = undefined;
                                            Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_A_token, function(paymentId){
                                                // RSC deliver B1 to user, query order
                                                Routing.RSC.deliver_SKU_to_user(RSC_A_token, orderId, [SKU_B1._id], function(body){
                                                    body.should.have.property('code', 1000);
                                                    expected_web_order_list.items[0].SKUs =
                                                        expected_app_order_list.datas.rows[0].SKUs =
                                                            expected_order_detail.datas.rows.SKUList =
                                                                expected_RSC_order_list.orders[0].SKUs =
                                                                    [{
                                                                        deliverStatus: 2,
                                                                        ref: SKU_B1._id
                                                                    }, {
                                                                        deliverStatus: 1,
                                                                        ref: SKU_B2._id
                                                                    }];
                                                    expected_app_order_list.datas.rows[0].order.orderStatus.value =
                                                        expected_web_order_list.items[0].order.orderStatus.value =
                                                            expected_order_detail.datas.rows.order.orderStatus.value = '配送中';
                                                    expected_web_order_list.items[0].typeValue =
                                                        expected_app_order_list.datas.rows[0].typeValue =
                                                            expected_order_detail.datas.rows.orderType = 3;
                                                    expected_web_order_list.items[0].deliverStatus =
                                                        expected_order_detail.datas.rows.deliverStatus =
                                                            expected_RSC_order_list.orders[0].deliverStatus = 3;
                                                    expected_RSC_order_list.orders[0].type.value = '配送中';
                                                    Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_A_token, function(paymentId){
                                                        // user confirm B1, query order
                                                        Routing.Order.confirm_SKU_received(test_user_token, orderId, [SKU_B1._id], function(body){
                                                            body.should.have.property('code', 1000);
                                                            expected_web_order_list.items[0].SKUs =
                                                                expected_app_order_list.datas.rows[0].SKUs =
                                                                    expected_order_detail.datas.rows.SKUList =
                                                                        expected_RSC_order_list.orders[0].SKUs =
                                                                            [{
                                                                                deliverStatus: 5,
                                                                                ref: SKU_B1._id
                                                                            }, {
                                                                                deliverStatus: 1,
                                                                                ref: SKU_B2._id
                                                                            }];
                                                            Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_A_token, function(paymentId){
                                                                // backend deliver B2 to RSC, query order
                                                                Routing.Order.deliver_SKU_to_RSC(backend_admin_token, orderId, [{ref: SKU_B2._id, deliverStatus: 4}], function(body) {
                                                                    body.should.have.property('code', 1000);
                                                                    expected_web_order_list.items[0].SKUs =
                                                                        expected_app_order_list.datas.rows[0].SKUs =
                                                                            expected_order_detail.datas.rows.SKUList =
                                                                                expected_RSC_order_list.orders[0].SKUs =
                                                                                    [{
                                                                                        deliverStatus: 5,
                                                                                        ref: SKU_B1._id
                                                                                    }, {
                                                                                        deliverStatus: 4,
                                                                                        ref: SKU_B2._id
                                                                                    }];
                                                                    Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_A_token, function(paymentId) {
                                                                        // RSC deliver B2 to user, query order
                                                                        Routing.RSC.deliver_SKU_to_user(RSC_A_token, orderId, [SKU_B2._id], function(body) {
                                                                            body.should.have.property('code', 1000);
                                                                            expected_web_order_list.items[0].SKUs =
                                                                                expected_app_order_list.datas.rows[0].SKUs =
                                                                                    expected_order_detail.datas.rows.SKUList =
                                                                                        expected_RSC_order_list.orders[0].SKUs =
                                                                                            [{
                                                                                                deliverStatus: 5,
                                                                                                ref: SKU_B1._id
                                                                                            }, {
                                                                                                deliverStatus: 2,
                                                                                                ref: SKU_B2._id
                                                                                            }];
                                                                            Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_A_token, function (paymentId) {
                                                                                // user confirm B2, query order
                                                                                Routing.Order.confirm_SKU_received(test_user_token, orderId, [SKU_B2._id], function(body) {
                                                                                    body.should.have.property('code', 1000);
                                                                                    expected_web_order_list.items[0].SKUs =
                                                                                        expected_app_order_list.datas.rows[0].SKUs =
                                                                                            expected_order_detail.datas.rows.SKUList =
                                                                                                expected_RSC_order_list.orders[0].SKUs =
                                                                                                    [{
                                                                                                        deliverStatus: 5,
                                                                                                        ref: SKU_B1._id
                                                                                                    }, {
                                                                                                        deliverStatus: 5,
                                                                                                        ref: SKU_B2._id
                                                                                                    }];
                                                                                    expected_app_order_list.datas.rows[0].order.orderStatus.value =
                                                                                        expected_web_order_list.items[0].order.orderStatus.value =
                                                                                            expected_order_detail.datas.rows.order.orderStatus.value = '已完成';
                                                                                    expected_web_order_list.items[0].typeValue =
                                                                                        expected_app_order_list.datas.rows[0].typeValue =
                                                                                            expected_order_detail.datas.rows.orderType = 4;
                                                                                    expected_web_order_list.items[0].deliverStatus =
                                                                                        expected_order_detail.datas.rows.deliverStatus =
                                                                                            expected_RSC_order_list.orders[0].deliverStatus = 5;
                                                                                    expected_RSC_order_list.orders[0].type.value = '已完成';
                                                                                    Components.check_order_status(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_A_token, function (paymentId) {
                                                                                        done();
                                                                                    }, 4, 4, 5)
                                                                                })
                                                                            }, 3, 3)
                                                                        })
                                                                    }, 3, 3, 3);
                                                                })
                                                            }, 3, 3)
                                                        })
                                                    }, 3, 3)
                                                })
                                            }, 2, 2, 3)
                                        })
                                    })
                                }, 1, 1, 2)
                            })
                        })
                    })
                }, 2)
            })
        })
    })
});