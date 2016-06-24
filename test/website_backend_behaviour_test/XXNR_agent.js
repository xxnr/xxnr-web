/**
 * Created by pepelu on 2016/6/23.
 */
var Routing = require('./Routing');
require('should-http');
var should = require('should');
var request = require('supertest');
var app = require('../../release');
var models = require('../../models');
var UserModel = models.user;
var test_data = require('./test_data');
var config = require('../../config');
var deployment = require('../../deployment');
var PotentialCustomerModel = models.potential_customer;
var utils = require('../../common/utils');
var ProductModel = models.product;
var SKUModel = models.SKU;

describe('XXNR agent', function(){
    var test_user = test_data.test_user;
    var backend_admin = test_data.backend_admin;
    var backend_admin_token;
    var test_address;
    var intention_product;
    var XXNRAgent_token;
    var XXNRAgent_img;
    before('deploy supplier, brands, product_attributes, SKU_attributes', function(done){
        deployment.deploy_SKU(done);
    });
    before('delete users', function(done){
        UserModel.find({}).remove(done);
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
    before('prepare test address', function(done){
        Routing.Address.get_address_by_name(test_data.test_address.province, test_data.test_address.city, test_data.test_address.county, test_data.test_address.town, function (err, address) {
            test_address = address;
            done();
        })
    });
    before('deploy intention product', function (done) {
        deployment.deploy_intention_product(done);
    });
    before('get intention products', function (done) {
        request(app)
            .get('/api/v2.1/intentionProducts')
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.have.property('code', 1000);
                res.body.should.have.property('intentionProducts');
                res.body.intentionProducts.length.should.above(0);
                intention_product = res.body.intentionProducts[0];
                done();
            });
    });
    before('create a XXNR agent and login and fill some info', function (done) {
        Routing.User.create_frontend_account(test_user.account, test_user.password, function (user) {
            Routing.User.verify_user_type(user.id, ['6'], backend_admin_token, function () {
                Routing.User.frontendLogin(test_user.account, test_user.password, function (body) {
                    XXNRAgent_token = body.token;
                    Routing.User.modify_user_info(XXNRAgent_token, {
                        userName: test_user.name
                    }, function () {
                        Routing.User.upload_photo(XXNRAgent_token, __dirname + '/test.jpg', function (body) {
                            XXNRAgent_img = body.imageUrl;
                            done();
                        })
                    })
                })
            })
        })
    });
    after('delete backend admin', function (done) {
        Routing.User.delete_backend_account(backend_admin.account, done);
    });
    describe('Add potential customer api', function(){
        var test_address_2, test_address_3;
        var test_potential_customer = test_data.potential_customer;
        before('prepare test address 2 3', function(done){
            var address_3 = {
                province:'山西',
                city:'吕梁',
                county:'离石'
            };
            Routing.Address.get_address_by_name(test_data.test_address_2.province, test_data.test_address_2.city, test_data.test_address_2.county, test_data.test_address_2.town, function (err, address) {
                test_address_2 = address;
                Routing.Address.get_address_by_name(address_3.province, address_3.city, address_3.county, address_3.town, function (err, address) {
                    test_address_3 = address;
                    done();
                })
            })
        });

        var testCases = [
            {
                name:'add potential customer w/o name',
                params:function(){return {}},
                result:{code:1001, message:'请输入姓名'}
            },{
                name:'add potential customer w/o phone',
                params:function(){return {name:test_potential_customer.name}},
                result:{code:1001, message:'请输入正确的手机号'}
            },{
                name:'add potential customer w/ invalid phone',
                params:function(){return {name:test_potential_customer.name, phone:'131'}},
                result:{code:1001, message:'请输入正确的手机号'}
            },{
                name:'add potential customer w/o sex',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone}},
                result:{code:1001, message:'请输入性别'}
            },{
                name:'add potential customer w/o province',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex}},
                result:{code:1001, message:'请选择省'}
            },{
                name:'add potential customer w/o province',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{city:test_address.city._id}}},
                result:{code:1001, message:'请选择省'}
            },{
                name:'add potential customer w/o city',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{province:test_address.province._id}}},
                result:{code:1001, message:'请选择市'}
            },{
                name:'add potential customer w/o town',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{province:test_address.province._id, city:test_address.city._id}}},
                result:{code:1001, message:'请选择乡镇'}
            },{
                name:'add potential customer w/o intention products',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{province:test_address.province._id, city:test_address.city._id, town:test_address.town._id}}},
                result:{code:1001, message:'请选择意向商品'}
            },{
                name:'add potential customer w/ remarks longer than 30 chars',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{province:test_address.province._id, city:test_address.city._id, town:test_address.town._id}, buyIntentions:[intention_product._id], remarks:'一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十一'}},
                result:{code:1001, message:'备注字数过长，请输入少于30个字'}
            },{
                name:'add potential customer w/ invalid province id',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{province:'invalidid', city:test_address.city._id, county:test_address.county._id, town:test_address.town._id}, buyIntentions:[intention_product._id]}},
                result:{code:1001, message:'没有查到要修改的省'}
            },{
                name:'add potential customer w/ invalid city id',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{province:test_address.province._id, city:'invalidid', county:test_address.county._id, town:test_address.town._id}, buyIntentions:[intention_product._id]}},
                result:{code:1001, message:'没有查到要修改的市'}
            },{
                name:'add potential customer w/ invalid county id',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{province:test_address.province._id, city:test_address.city._id, county:'invalidid', town:test_address.town._id}, buyIntentions:[intention_product._id]}},
                result:{code:1001, message:'没有查到要修改的区县'}
            },{
                name:'add potential customer w/ invalid town id',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{province:test_address.province._id, city:test_address.city._id, county:test_address.county._id, town:'invalidid'}, buyIntentions:[intention_product._id]}},
                result:{code:1001, message:'没有查到要修改的乡镇'}
            },{
                name:'add potential customer w/ invalid town id',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{province:test_address.province._id, city:test_address.city._id, town:'invalidid'}, buyIntentions:[intention_product._id]}},
                result:{code:1001, message:'没有查到要修改的乡镇'}
            },{
                name:'add potential customer w/ city not belong to province',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{province:test_address.province._id, city:test_address_3.city._id, county:test_address.county._id, town:test_address.town._id}, buyIntentions:[intention_product._id]}},
                result:{code:1001, message:'所选城市不属于所选省份'}
            },{
                name:'add potential customer w/ county not belong to city',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{province:test_address.province._id, city:test_address.city._id, county:test_address_2.county._id, town:test_address.town._id}, buyIntentions:[intention_product._id]}},
                result:{code:1001, message:'所选区县不属于所选城市'}
            },{
                name:'add potential customer w/ town not belong to county',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{province:test_address.province._id, city:test_address.city._id, county:test_address.county._id, town:test_address_2.town._id}, buyIntentions:[intention_product._id]}},
                result:{code:1001, message:'所选乡镇不属于所选区县'}
            },{
                name:'add potential customer w/ town not belong to city',
                params:function(){return {name:test_potential_customer.name, phone:test_potential_customer.phone, sex:test_potential_customer.sex, address:{province:test_address.province._id, city:test_address.city._id, town:test_address_2.town._id}, buyIntentions:[intention_product._id]}},
                result:{code:1001, message:'所选乡镇不属于所选城市'}
            }
        ];

        testCases.forEach(function(test){
            it(test.name, function(done){
                Routing.User.add_potential_customer(test.params(), XXNRAgent_token, function(body){
                    body.should.have.properties(test.result);
                    done();
                })
            })
        })
    });
    //describe('Bind inviter api');
    describe('XXNR agent scenarios', function() {
        var potential_customer = test_data.potential_customer;
        var test_product;
        var test_SKU;
        before('create product and SKU', function(done){
            ProductModel.findOne({id:test_data.test_product.id}).remove(function(err) {
                should.not.exist(err);
                Routing.Product.query_brands(test_data.test_SKU.category, backend_admin_token, function(body){
                    var brand_id = body.brands[0]._id;
                    Routing.Product.save_product(utils.extend(test_data.test_product, {brand:brand_id}), backend_admin_token, function (body) {
                        body.should.have.property('code', 1000);
                        test_product = body.product;
                        Routing.Product.query_SKU_attributes(test_data.test_SKU.category, null, backend_admin_token, function(body) {
                            body.should.have.property('code', 1000);
                            var attributes = [{name:body.attributes[0].name, value:body.attributes[0].values[0].value, ref:body.attributes[0].values[0].ref}];
                            Routing.Product.create_SKU(utils.extend(test_data.test_SKU, {product: test_product._id, attributes:attributes}), backend_admin_token, function (body) {
                                body.should.have.property('code', 1000);
                                test_SKU = body.SKU;
                                Routing.Product.online_SKU(test_SKU._id, true, backend_admin_token, function(body){
                                    body.should.have.property('code', 1000);
                                    Routing.Product.online_product(test_product._id, true, backend_admin_token, function(body){
                                        body.should.have.property('code', 1000);
                                        done();
                                    })
                                })
                            })
                        })
                    })
                })
            })
        });

        after('delete product and SKU', function(done){
            ProductModel.findOne({id:test_data.test_product.id}).remove(function(err){
                should.not.exist(err);
                SKUModel.findOne({}).remove(done);
            });
        });

        after('delete XXNR agent', function (done) {
            Routing.User.delete_frontend_account(test_user.account, done);
        });

        after('delete potential customer', function (done) {
            PotentialCustomerModel.findOne({phone: potential_customer.phone}).remove(function (err) {
                should.not.exist(err);
                UserModel.findOne({account: potential_customer.phone}).remove(done);
            });
        });

        beforeEach('delete potential customer', function (done) {
            PotentialCustomerModel.findOne({phone: potential_customer.phone}).remove(function (err) {
                should.not.exist(err);
                UserModel.findOne({account: potential_customer.phone}).remove(done);
            });
        });

        it('add potential customer', function (done) {
            Routing.User.is_potential_customer_available(potential_customer.phone, XXNRAgent_token, function (body) {
                body.should.have.properties({
                    code: 1000,
                    available: true
                });
                Routing.User.add_potential_customer(utils.extend(potential_customer, {
                    address: {
                        province: test_address.province._id,
                        city: test_address.city._id,
                        county: test_address.county._id,
                        town: test_address.town._id
                    },
                    buyIntentions: [intention_product._id]
                }), XXNRAgent_token, function (body) {
                    body.should.have.property('code', 1000);
                    // query potential customer list
                    Routing.User.query_potential_customers(XXNRAgent_token, function (body) {
                        body.should.have.property('code', 1000);
                        body.should.containDeep({
                            code: 1000,
                            count: 1,
                            potentialCustomers: [{
                                name: potential_customer.name,
                                isRegistered: false,
                                phone: potential_customer.phone,
                                remarks: potential_customer.remarks,
                                sex: potential_customer.sex
                            }],
                            countLeftToday: 14,
                            totalPageNo: 1,
                            currentPageNo: 1
                        });
                        var potential_customer_id = body.potentialCustomers[0]._id;
                        Routing.User.get_potential_customer(XXNRAgent_token, potential_customer_id, function (body) {
                            body.should.containDeep({
                                code: 1000,
                                potentialCustomer: {
                                    name: potential_customer.name,
                                    phone: potential_customer.phone,
                                    sex: potential_customer.sex,
                                    address: {
                                        province: {name: test_data.test_address.province},
                                        city: {name: test_data.test_address.city},
                                        county: {name: test_data.test_address.county},
                                        town: {name: test_data.test_address.town}
                                    },
                                    buyIntentions: [{
                                        name: intention_product.name
                                    }],
                                    remarks: potential_customer.remarks,
                                    isRegistered: false,
                                    namePinyin: potential_customer.namePinyin,
                                    nameInitial: potential_customer.nameInitial,
                                    nameInitialType: potential_customer.nameInitialType
                                }
                            });

                            Routing.User.is_potential_customer_available(potential_customer.phone, XXNRAgent_token, function (body) {
                                body.available.should.be.false();
                                done();
                            });
                        });
                    });
                });
            })
        });

        it('potential customer registered and binded', function (done) {
            var expected_nominated_inviter = {
                code: 1000,
                nominated_inviter: {
                    phone: test_user.account,
                    name: test_user.name
                }
            };
            var expected_potential_customer_after_registered = {
                code:1000,
                potentialCustomer:{
                    isRegistered:true
                }
            };
            var expected_inviter_after_binded = {
                code:'1000',
                datas: {
                    inviterPhone: test_user.account,
                    inviterName: test_user.name,
                    inviterPhoto: XXNRAgent_img
                }
            };
            var expected_invitee_list_after_binded = {
                code: 1000,
                invitee: [{
                    account: potential_customer.phone,
                    name:potential_customer.name,
                    newOrdersNumber: 0
                }],
                total: 1,
                page: 1,
                pages: 1
            };
            Routing.User.add_potential_customer(utils.extend(potential_customer, {
                address: {
                    province: test_address.province._id,
                    city: test_address.city._id,
                    county: test_address.county._id,
                    town: test_address.town._id
                },
                buyIntentions: [intention_product._id]
            }), XXNRAgent_token, function () {
                Routing.User.create_frontend_account(potential_customer.phone, potential_customer.password, function (user) {
                    Routing.User.frontendLogin(potential_customer.phone, potential_customer.password, function (body) {
                        var potential_customer_token = body.token;
                        Routing.User.modify_user_info(potential_customer_token, {userName: potential_customer.name}, function () {
                            Routing.User.query_potential_customers(XXNRAgent_token, function (body) {
                                var potential_customer_id = body.potentialCustomers[0]._id;
                                Routing.User.get_potential_customer(XXNRAgent_token, potential_customer_id, function (body) {
                                    body.should.containDeep(expected_potential_customer_after_registered);
                                    body.potentialCustomer.should.have.property('dateTimeRegistered');
                                    Routing.User.get_nominated_inviter(potential_customer_token, function (body) {
                                        body.should.have.properties(expected_nominated_inviter);
                                        Routing.User.bind_inviter(potential_customer_token, test_user.account, function (body) {
                                            body.should.have.property('code', 1000);
                                            Routing.User.get_inviter(potential_customer_token, function (body) {
                                                body.should.containDeep(expected_inviter_after_binded);
                                                Routing.User.query_invitee(XXNRAgent_token, function (body) {
                                                    body.should.containDeep(expected_invitee_list_after_binded);
                                                    done();
                                                })
                                            })
                                        })
                                    });
                                });
                            })
                        });
                    })
                });
            })
        });

        it('query my invitee by name');

        it('query potential customer by name');

        it('query invitee order', function (done) {
            Routing.User.create_frontend_account(potential_customer.phone, potential_customer.password, function (user) {
                Routing.User.frontendLogin(potential_customer.phone, potential_customer.password, function (body) {
                    var potential_customer_token = body.token;
                    var cartId = body.datas.cartId;
                    var inviteeId = body.datas.userid;
                    Routing.User.bind_inviter(potential_customer_token, test_user.account, function (body) {
                        Routing.User.add_user_address({
                            provinceId:test_address.province.id,
                            cityId:test_address.city.id,
                            countyId:test_address.county.id,
                            townId:test_address.town.id,
                            detail:potential_customer.user_address.detail,
                            receiptPeople:potential_customer.user_address.receiptPeople,
                            receiptPhone:potential_customer.user_address.receiptPhone
                        }, potential_customer_token, function(body){
                            body.should.have.property('code', 1000);
                            var addressId = body.datas.addressId;
                            Routing.Cart.add_to_cart(test_SKU._id, 1, potential_customer_token, true, function(body){
                                body.should.have.property('code', 1000);
                                Routing.Order.add_order(cartId, addressId, [{_id:test_SKU._id, count:1}], potential_customer_token, function(body){
                                    body.should.have.property('code', 1000);
                                    Routing.User.query_invitee(XXNRAgent_token, function (body) {
                                        body.should.have.property('code', 1000);
                                        body.should.containDeep({
                                            invitee: [{
                                                newOrdersNumber: 1
                                            }]
                                        });
                                        Routing.User.query_invitee_order(inviteeId, XXNRAgent_token,function(body){
                                            body.should.containDeep({
                                                code:1000,
                                                datas:{
                                                    account:potential_customer.phone,
                                                    rows:[{
                                                        typeValue:1,
                                                        SKUs:[{
                                                            productId:test_product.id,
                                                            count:1
                                                        }],
                                                        price:test_SKU.platform_price
                                                    }],
                                                    page:1,
                                                    pages:1
                                                }
                                            });
                                            Routing.User.query_invitee(XXNRAgent_token, function (body) {
                                                body.should.containDeep({
                                                    invitee: [{
                                                        newOrdersNumber: 0
                                                    }]
                                                });
                                                done();
                                            })
                                        })
                                    })
                                })
                            })
                        });
                    })
                })
            })
        })
    });
});