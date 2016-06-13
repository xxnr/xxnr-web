/**
 * Created by pepelu on 2016/6/1.
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
var UserAddressModel = models.useraddress;

describe('User', function() {
    var test_user = test_data.test_user;
    var backend_admin = test_data.backend_admin;
    var backend_admin_token;
    var test_address;
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

    after('delete backend admin', function (done) {
        Routing.User.delete_backend_account(backend_admin.account, done);
    });

    describe('new user', function () {
        var test_user_token;
        beforeEach('register empty account and login', function (done) {
            Routing.User.create_frontend_account(test_user.account, test_user.password, function(){
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

        afterEach('remove test user', function (done) {
            Routing.User.delete_frontend_account(test_user.account, done);
        });

        it('register', function (done) {
            Routing.User.get_user_info(test_user_token, function (body) {
                var user = body.datas;
                user.should.have.properties('userid');
                user.should.not.have.properties('name', 'nickname', 'photo', 'dateinvited', 'address');
                user.should.have.properties({
                    sex: false,
                    isUserInfoFullFilled: false,
                    loginName: test_user.account,
                    phone: test_user.account,
                    isVerified: false,
                    isXXNRAgent: false,
                    isRSC: false,
                    RSCInfoVerifing: false,
                    userType: '1',
                    userTypeInName: '普通用户',
                    verifiedTypes: [],
                    verifiedTypesInJson: []
                });
                //TODO: get user list in backend, should contain this user
                done();
            })
        });

        it('full fill user info', function (done) {
            Routing.User.modify_user_info(test_user_token, {
                userName: test_user.name,
                address: {
                    provinceId: test_address.province.id,
                    cityId: test_address.city.id,
                    countyId: test_address.county.id,
                    townId: test_address.town.id
                }}, function(body){
                    body.should.have.property('code', '1000');
                    Routing.User.get_user_info(test_user_token, function (body) {
                        body.datas.should.containDeep({
                            name: test_user.name,
                            address: {
                                province: {
                                    name: test_data.test_address.province
                                },
                                city: {
                                    name: test_data.test_address.city
                                },
                                county: {
                                    name: test_data.test_address.county
                                },
                                town: {
                                    name: test_data.test_address.town
                                }
                            },
                            isUserInfoFullFilled: true,
                            pointLaterTrade: 100
                        });

                        done();
                    })
                })
        });

        it('update user info', function(done) {
            Routing.User.modify_user_info(test_user_token, {
                userName: test_user.name,
                nickname:test_user.nickname,
                sex:test_user.sex,
                type:'5',
                address: {
                    provinceId: test_address.province.id,
                    cityId: test_address.city.id,
                    countyId: test_address.county.id,
                    townId: test_address.town.id
                }
            }, function (body) {
                body.should.have.property('code', '1000');
                Routing.User.get_user_info(test_user_token, function(body){
                    body.datas.should.containDeep({
                        sex: true,
                        isUserInfoFullFilled: true,
                        loginName: test_user.account,
                        phone: test_user.account,
                        isVerified: false,
                        isXXNRAgent: false,
                        isRSC: false,
                        RSCInfoVerifing: false,
                        userType: '5',
                        userTypeInName: '县级经销商',
                        address:{
                            province:{name:test_data.test_address.province},
                            city:{name:test_data.test_address.city},
                            county:{name:test_data.test_address.county},
                            town:{name:test_data.test_address.town}
                        }
                    });
                    done();
                })
            })
        })
    });

    describe('verification', function () {
        var test_user_token;
        beforeEach('register empty account and login', function (done) {
            Routing.User.create_frontend_account(test_user.account, test_user.password, function(){
                Routing.User.frontendLogin(test_user.account, test_user.password, function (body) {
                    test_user_token = body.token;
                    done();
                });
            });
        });

        afterEach('remove test user', function (done) {
            Routing.User.delete_frontend_account(test_user.account, done);
        });

        it('verify as XXNR agent', function (done) {
            Routing.User.query_user_types(function(body){
                body.should.have.properties({
                    code:1000,
                    data:{"1": "普通用户", "5": "县级经销商", "6": "新农经纪人"}
                });
                Routing.User.request_user_type('6', test_user_token, function (body) {
                body.should.have.property('code', '1000');
                Routing.User.get_user_info(test_user_token, function (body) {
                    var user = body.datas;
                    user.should.have.properties({
                        userType: '6',
                        userTypeInName: '新农经纪人',
                        verifiedTypes: [],
                        verifiedTypesInJson: [],
                        isXXNRAgent: false,
                        isVerified: false
                    });
                    //TODO:get this user in pending approval list in backend
                    Routing.User.verify_user_type(user.userid, ['6'], backend_admin_token, function () {
                        Routing.User.get_user_info(test_user_token, function (body) {
                            body.datas.should.have.properties({
                                userType: '6',
                                userTypeInName: '新农经纪人',
                                verifiedTypes: ['6'],
                                verifiedTypesInJson: [{typeId: '6', typeName: '新农经纪人'}],
                                isXXNRAgent: true,
                                isVerified: true
                            });
                            //TODO: get XXNR agent list in backend, should contain this user
                            done();
                        });
                    })
                })
            })
            })
        });

        it('verify as RSC', function (done) {
            Routing.User.request_user_type('5', test_user_token, function (body) {
                body.should.have.property('code', '1000');
                // fill RSC info
                var RSCInfo = test_user.RSCInfo;
                request(app)
                    .post('/api/v2.2/RSC/info/fill')
                    .send({
                        token: test_user_token,
                        name: RSCInfo.name,
                        IDNo: RSCInfo.IDNo,
                        phone: RSCInfo.phone,
                        companyName: RSCInfo.companyName,
                        companyAddress: {
                            province: test_address.province._id,
                            city: test_address.city._id,
                            county: test_address.county._id,
                            town: test_address.town._id
                        }
                    })
                    .end(function (err, res) {
                        should.not.exist(err);
                        res.body.should.have.property('code', 1000);
                        Routing.User.get_user_info(test_user_token, function (body) {
                            var user = body.datas;
                            user.should.have.containDeep({
                                userType: '5',
                                userTypeInName: '县级经销商',
                                verifiedTypes: [],
                                verifiedTypesInJson: [],
                                RSCInfoVerifing: true,
                                isVerified: false,
                                isRSC: false
                            });
                            request(app)
                                .get('/api/v2.2/RSC/info/get')
                                .query({token:test_user_token})
                                .end(function(err, res){
                                    should.not.exist(err);
                                    res.body.should.have.containDeep({
                                        code:1000,
                                        RSCInfo: {
                                            name: RSCInfo.name,
                                            IDNo: RSCInfo.IDNo,
                                            phone: RSCInfo.phone,
                                            companyName: RSCInfo.companyName,
                                            companyAddress: {
                                                province: {name: test_data.test_address.province},
                                                city: {name: test_data.test_address.city},
                                                county: {name: test_data.test_address.county},
                                                town: {name: test_data.test_address.town}
                                            }
                                        }
                                    });

                                    //TODO:modify RSCInfo 2nd time and cannot modify.
                                    //TODO:get this user in pending approval list in backend
                                    Routing.User.verify_user_type(user.userid, ['5'], backend_admin_token, function () {
                                        Routing.User.get_user_info(test_user_token, function (body) {
                                            body.datas.should.have.properties({
                                                userType: '5',
                                                userTypeInName: '县级经销商',
                                                verifiedTypes: ['5'],
                                                verifiedTypesInJson: [{typeId: '5', typeName: '县级经销商'}],
                                                RSCInfoVerifing: false,
                                                isVerified: true,
                                                isRSC: true
                                            });
                                            //TODO: get RSC list in backend, should contain this RSC
                                            done();
                                        })
                                    })
                                });
                        })
                    })
            })
        })
    });

    describe('agent', function() {
        var XXNRAgent_token;
        var XXNRAgent_img;
        var potential_customer = test_data.potential_customer;
        var intention_product;
        var test_product;
        var test_SKU;
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

        before('create product and SKU', function(done){
            ProductModel.findOne({id:test_data.test_product.id}).remove(function(err) {
                should.not.exist(err);
                Routing.Product.query_brands(backend_admin_token, function(body){
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

        after('delete product', function(done){
            ProductModel.findOne({id:test_data.test_product.id}).remove(done);
        });

        beforeEach('delete potential customer', function (done) {
            PotentialCustomerModel.findOne({phone: potential_customer.phone}).remove(function (err) {
                should.not.exist(err);
                UserModel.findOne({account: potential_customer.phone}).remove(done);
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
                                    body.potentialCustomer.should.have.property('isRegistered', true);
                                    body.potentialCustomer.should.have.property('dateTimeRegistered');
                                    Routing.User.get_nominated_inviter(potential_customer_token, function (body) {
                                        body.should.have.properties({
                                            code: 1000,
                                            nominated_inviter: {
                                                phone: test_user.account,
                                                name: test_user.name
                                            }
                                        });
                                        Routing.User.bind_inviter(potential_customer_token, test_user.account, function (body) {
                                            body.should.have.property('code', 1000);
                                            Routing.User.get_inviter(potential_customer_token, function (body) {
                                                body.should.containDeep({
                                                    code: '1000',
                                                    datas: {
                                                        inviterPhone: test_user.account,
                                                        inviterName: test_user.name,
                                                        inviterPhoto: XXNRAgent_img
                                                    }
                                                });
                                                Routing.User.query_invitee(XXNRAgent_token, function (body) {
                                                    body.should.containDeep({
                                                        code: 1000,
                                                        invitee: [{
                                                            account: potential_customer.phone,
                                                            name:potential_customer.name,
                                                            newOrdersNumber: 0
                                                        }],
                                                        total: 1,
                                                        page: 1,
                                                        pages: 1
                                                    });
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

        it('query my invitee');

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

    describe('loyalty point', function(){
        var test_user_token;
        before('create test user and login', function(done){
            Routing.User.create_frontend_account(test_user.account, test_user.password, function(user){
                Routing.User.frontendLogin(test_user.account, test_user.password, function(body){
                    test_user_token = body.token;
                    done();
                })
            })
        });

        after('delete test user', function(done){
            Routing.User.delete_frontend_account(test_user.account, done);
        });

        it('sign', function(done){
            Routing.User.sign(test_user_token, function(body){
                body.should.have.property('code', '1000');
                Routing.User.get_user_info(test_user_token, function(body){
                    body.datas.should.have.property('pointLaterTrade', 2);
                    Routing.User.sign(test_user_token, function(body){
                        body.should.have.properties({
                            code:'1010',
                            message:'您今日已签到成功，明天再来呦！'
                        });
                        done();
                    })
                })
            })
        })
    });

    describe('modify password', function(){
        var test_user_token;
        before('create test user and login', function(done){
            Routing.User.create_frontend_account(test_user.account, test_user.password, function(user){
                Routing.User.frontendLogin(test_user.account, test_user.password, function(body){
                    test_user_token = body.token;
                    done();
                })
            })
        });

        after('delete test user', function(done){
            Routing.User.delete_frontend_account(test_user.account, done);
        });

        it('modify password', function(done){
            var new_password = '123456';
            Routing.User.modify_password(test_user_token, test_user.password, new_password, function(body){
                body.should.have.property('code', '1000');
                Routing.User.frontendLogin(test_user.account, new_password, function(body){
                    var new_token = body.token;
                    Routing.User.get_user_info(new_token, function(body){
                        body.should.have.property('code', '1000');
                        Routing.User.get_user_info(test_user_token, function(body){
                            body.should.have.properties({
                                code:1401,
                                message:'您已在其他地方登录'
                            });
                            done();
                        })
                    })
                })
            })
        })
    });

    describe('consignee address', function(){
        var test_user_token;
        var test_address_2;
        var test_user_id;
        before('create test user and login', function(done){
            Routing.User.create_frontend_account(test_user.account, test_user.password, function(user){
                Routing.User.frontendLogin(test_user.account, test_user.password, function(body){
                    test_user_token = body.token;
                    test_user_id = body.userid;
                    done();
                })
            })
        });

        before('prepare test address 2', function(done){
            Routing.Address.get_address_by_name(test_data.test_address_2.province, test_data.test_address_2.city, test_data.test_address_2.county, test_data.test_address_2.town, function (err, address) {
                test_address_2 = address;
                done();
            })
        });

        after('delete test user', function(done){
            Routing.User.delete_frontend_account(test_user.account, done);
        });

        after('delete user address', function(done){
            UserAddressModel.find({userid:test_user_id}).remove(done);
        });

        it('add user address', function(done){
            Routing.User.add_user_address({
                provinceId:test_address.province.id,
                cityId:test_address.city.id,
                countyId:test_address.county.id,
                townId:test_address.town.id,
                detail:test_user.user_address[0].detail,
                receiptPeople:test_user.user_address[0].receiptPeople,
                receiptPhone:test_user.user_address[0].receiptPhone
            }, test_user_token, function(body) {
                body.should.have.property('code', 1000);
                Routing.User.query_user_address(test_user_token, function(body){
                    body.should.containDeep({
                        code:'1000',
                        datas:{
                            total:1,
                            rows:[{
                                areaName:test_address.province.name,
                                areaId:test_address.province.id,
                                cityName:test_address.city.name,
                                cityId:test_address.city.id,
                                countyName:test_address.county.name,
                                countyId:test_address.county.id,
                                townName:test_address.town.name,
                                townId:test_address.town.id,
                                address:test_user.user_address[0].detail,
                                receiptPhone:test_user.user_address[0].receiptPhone,
                                receiptPeople:test_user.user_address[0].receiptPeople,
                                type:2
                            }]
                        }
                    });
                    Routing.User.add_user_address({
                        provinceId:test_address.province.id,
                        cityId:test_address.city.id,
                        countyId:test_address.county.id,
                        townId:test_address.town.id,
                        detail:test_user.user_address[1].detail,
                        receiptPeople:test_user.user_address[0].receiptPeople,
                        receiptPhone:test_user.user_address[0].receiptPhone
                    }, test_user_token, function(body) {
                        body.should.have.property('code', 1000);
                        var address_2_id = body.datas.addressId;
                        Routing.User.query_user_address(test_user_token, function(body) {
                            body.should.containDeep({
                                code: '1000',
                                datas: {
                                    total: 2,
                                    rows: [{
                                        address: test_user.user_address[0].detail,
                                        type: 2
                                    },
                                        {
                                            address: test_user.user_address[1].detail,
                                            type: 2
                                        }]
                                }
                            });
                            Routing.User.update_user_address(test_user_token, {
                                id: address_2_id,
                                provinceId: test_address_2.province.id,
                                cityId: test_address_2.city.id,
                                countyId: test_address_2.county.id,
                                townId: test_address_2.town.id,
                                details: test_user.user_address[0].detail,
                                receiptPhone: test_user.user_address[1].receiptPhone,
                                receiptPeople: test_user.user_address[1].receiptPeople,
                                type: 1
                            }, function (body) {
                                body.should.have.property('code', '1000');
                                Routing.User.query_user_address(test_user_token, function (body) {
                                    body.should.containDeep({
                                        code: '1000',
                                        datas: {
                                            total: 2,
                                            rows: [{
                                                areaName:test_address_2.province.name,
                                                areaId:test_address_2.province.id,
                                                cityName:test_address_2.city.name,
                                                cityId:test_address_2.city.id,
                                                countyName:test_address_2.county.name,
                                                countyId:test_address_2.county.id,
                                                townName:test_address_2.town.name,
                                                townId:test_address_2.town.id,
                                                address:test_user.user_address[0].detail,
                                                receiptPhone:test_user.user_address[1].receiptPhone,
                                                receiptPeople:test_user.user_address[1].receiptPeople,
                                                type: 1
                                            },
                                                {
                                                    areaName:test_address.province.name,
                                                    areaId:test_address.province.id,
                                                    cityName:test_address.city.name,
                                                    cityId:test_address.city.id,
                                                    countyName:test_address.county.name,
                                                    countyId:test_address.county.id,
                                                    townName:test_address.town.name,
                                                    townId:test_address.town.id,
                                                    address:test_user.user_address[0].detail,
                                                    receiptPhone:test_user.user_address[0].receiptPhone,
                                                    receiptPeople:test_user.user_address[0].receiptPeople,
                                                    type:2
                                                }]
                                        }
                                    });
                                    done();
                                });
                            })
                        });
                    })
                })
            });
        });

        it('add user consignee', function(done){
            var test_consignee = test_user.consignee;
            Routing.User.save_user_consignee(test_user_token, test_consignee[0].name, test_consignee[0].phone, function(body){
                body.should.have.property('code', 1000);
                Routing.User.query_user_consignee(test_user_token, function(body){
                    body.should.containDeep({
                        code:1000,
                        datas:{
                            total:1,
                            page:1,
                            pages:1,
                            rows:[{
                                consigneeName:test_consignee[0].name,
                                consigneePhone:test_consignee[0].phone
                            }]
                        }
                    });
                    done();
                })
            })
        })
    })
});
