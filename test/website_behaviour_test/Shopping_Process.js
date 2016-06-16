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
var Components = require('./utilities/components');

describe('Shopping process', function() {
    var backend_admin = test_data.backend_admin;
    var backend_admin_token;
    var test_user_token;
    var test_user = test_data.test_user;
    var test_address;
    before('deploy supplier, brands, product_attributes, SKU_attributes', function (done) {
        deployment.deploy_SKU(done);
    });
    before('deploy roles and permissions', function (done) {
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
        before('create product A(brand A), with SKU A1 online', function (done) {
            Components.prepare_SKU(backend_admin_token, 0, 'huafei', 0, test_data.test_SKU, function (brand, product, SKU, SKU_attributes) {
                brand_A = brand;
                product_A = product;
                SKU_A1 = SKU;
                SKU_attributes_A1 = SKU_attributes;
                done();
            })
        });
        before('create product B(brand B), with SKU B1 online', function (done) {
            Components.prepare_SKU(backend_admin_token, 1, 'huafei', 1, test_data.test_SKU, function (brand, product, SKU, SKU_attributes) {
                brand_B = brand;
                product_B = product;
                SKU_B1 = SKU;
                SKU_attributes_B1 = SKU_attributes;
                done();
            })
        });
        before('create product C(brand B), with SKU C1 online', function(done){
            Components.prepare_SKU(backend_admin_token, 1, 'huafei', 2, test_data.test_SKU, function (brand, product, SKU, SKU_attributes) {
                brand_B = brand;
                product_C = product;
                SKU_C1 = SKU;
                SKU_attributes_C1 = SKU_attributes;
                done();
            })
        });
        after('delete product with SKU', function (done) {
            ProductModel.find({}).remove(function (err) {
                should.not.exist(err);
                SKUModel.find({}).remove(done);
            });
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
                            product_id: product_A._id
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
                                product_id: product_B._id
                            },{
                                goodsId: product_C.id,
                                name: product_C.name + ' - ' + SKU_attributes_C1[0].value + ' - ' + SKU_attributes_C1[1].value,
                                price: SKU_C1.price.platform_price,
                                productName: product_C.name,
                                attributes: SKU_attributes_C1,
                                deposit: product_C.deposit,
                                count: 1,
                                additions: [],
                                product_id: product_C._id
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
        it('modify count and query');
        it('delete and query');
        it('offline SKU in cart and query');
    });
    describe('commit from cart', function () {
        // car can only ZITI, huafei can ZITI and SONGHUO
        before('create product A(car, SKU A1, A2, A3), B(huafei, SKU B1, B2), C(car, SKU C1). A with deposit, B without deposit, C without deposit');
        before('add all SKU to cart with count 9999');
        before('create front end user 1 -> login -> verified as RSC -> bind RSC with product A,B.');
        before('create front end user 2 -> login -> verified as RSC -> bind RSC with product A,C.');

        it('commit with only ZITI products and the same RSC', function () {
            // commit A1, A2
            // query delivery type, get only ZITI
            // query RSC list with address
            // add order and user/RSC query order
        });

        it('commit with only ZITI products and not the same RSC', function () {
            // commit A1, B1, C1
            // query delivery type, get only ZITI
            // query RSC list with address
            // add order and user/RSC query order
        });

        it('commit with SONGHUO products', function () {
            // commit B1, B2
            // query delivery type, get ZITI and SONGHUO and choose SONGHUO
            // add order and user/RSC query order
            // bind order to RSC and query RSC order
        });

        it('commit with both deposit and non-deposit products', function () {
            // commit A1, B1
            // query delivery type, get ZITI and choose ZITI
            // query RSC list, get 1, and choose 1
            // add order and query user/RSC order, get two order with A1, and B1 in order
        })
    })
});