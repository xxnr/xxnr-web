/**
 * Created by pepelu on 2016/6/15.
 */
var test_data = require('../test_data');
var Routing = require('../Routing');
var utils = require('../../../common/utils');
var path = require('path');
var app = require(path.join(__dirname, '../../../release'));
var supertest = require('supertest');
var should = require('should');
var request = supertest(app);
var extend = require('extend');
var fs = require('fs');
var path = require('path');

exports.prepare_SKU = function(backend_admin_token, brand_index, category, product_index, SKU, SKU_index, done){
    if(!done){
        done = SKU_index;
        SKU_index = 0;
    }

    var test_product_data = test_data[category](product_index);
    Routing.backend_upload_photo(backend_admin_token, __dirname+'/test.jpg', function(body){
        body.should.have.a.lengthOf(1);
        var regex = /(.+)\..+/;
        body[0].should.match(regex);
        var imgUrl = regex.exec(body[0])[1];
        Routing.Product.query_brands(test_data.category_id[test_product_data.category], backend_admin_token, function (body) {
        var brand = body.brands[brand_index];
        Routing.Product.save_product(utils.extend(test_product_data, {
            brand: brand._id,
            pictures: [imgUrl]
        }), backend_admin_token, function (body) {
            body.should.have.property('code', 1000);
            var product = body.product;
            Routing.Product.query_SKU_attributes(test_data.category_id[category], brand._id, backend_admin_token, function (body) {
                body.should.have.property('code', 1000);
                var SKU_attributes = body.attributes;
                var test_SKU_attributes = [{
                    name: SKU_attributes[0].name,
                    value: SKU_attributes[0].values[SKU_index].value,
                    ref: SKU_attributes[0].values[SKU_index].ref
                },
                    {
                        name: SKU_attributes[1].name,
                        value: SKU_attributes[1].values[0].value,
                        ref: SKU_attributes[1].values[0].ref
                    }];
                Routing.Product.create_SKU(utils.extend(SKU, {
                    product: product._id,
                    attributes: test_SKU_attributes
                }), backend_admin_token, function (body) {
                    body.should.have.property('code', 1000);
                    var SKU = body.SKU;
                    SKU.online = true;
                    Routing.Product.online_SKU(SKU._id, true, backend_admin_token, function (body) {
                        body.should.have.property('code', 1000);
                        product.online = true;
                        Routing.Product.online_product(product._id, true, backend_admin_token, function (body) {
                            body.should.have.property('code', 1000);
                            product.imgUrl = '/images/large/'+test_data.category_id[category]+'/'+imgUrl+'.jpg?category='+test_data.category_id[category];
                            done(brand, product, SKU, test_SKU_attributes);
                        })
                    })
                })
            })
        })
    })
    })
};

exports.prepare_SKU_attributes = function(category, brand_index, index, count, backend_admin_token, done){
    var category_id = test_data.category_id[category];
    Routing.Product.query_brands(category_id, backend_admin_token, function (body) {
        var brand = body.brands[brand_index];
        Routing.Product.query_SKU_attributes(category_id, brand._id, backend_admin_token, function (body) {
            var SKU_attributes = body.attributes;
            var processor = function (i) {
                if (i < count) {
                    Routing.Product.add_SKU_attributes(category_id, brand._id, SKU_attributes[index].name, 'testSKUattributevalue' + i, backend_admin_token, function (body) {
                        body.should.have.property('code', 1000);
                        processor(i + 1);
                    })
                } else {
                    done();
                }
            };
            processor(0);
        })
    })
};

exports.create_RSC = function(RSC, backend_admin_token, done) {
    var test_user_token;
    var account = '1380000' + utils.random(1999, 1000);
    var password = utils.GUID(20);
    Routing.User.create_frontend_account(account, password, function (body) {
        var user_id = body._id;
        Routing.User.frontendLogin(account, password, function (body) {
            body.should.have.property('code', '1000');
            test_user_token = body.token;
            var user = body.datas;
            user._id = user_id;
            Routing.RSC.fill_RSC_info(test_user_token, RSC.name, RSC.IDNo, RSC.phone, RSC.companyName, RSC.companyAddress, function() {
                Routing.RSC.modify_RSC_info(backend_admin_token, user.userid, RSC.products, RSC.gifts, function(){
                    Routing.User.verify_user_type(user.userid, ['5'], backend_admin_token, function () {
                        done(user, test_user_token);
                    });
                })
            })
        });
    });
};

exports.check_order_status = function(test_user_token, expected_web_order_list, expected_app_order_list, expected_order_detail, expected_RSC_order_list, RSC_token, done, extra_web_query_type, extra_app_query_type, extra_RSC_query_type){
    Routing.Order.web_query_order(test_user_token, null, function (body) {
        body.should.containDeep(expected_web_order_list);
        Routing.Order.web_query_order(test_user_token, extra_web_query_type, function (body) {
            body.should.containDeep(expected_web_order_list);
            var orderId = body.items[0].id;
            Routing.Order.app_query_order(test_user_token, null, function (body) {
                body.should.containDeep(expected_app_order_list);
                Routing.Order.app_query_order(test_user_token, extra_app_query_type, function (body) {
                    body.should.containDeep(expected_app_order_list);
                    Routing.Order.get_order_detail(test_user_token, orderId, function (body) {
                        body.should.containDeep(expected_order_detail);
                        var paymentId = body.datas.rows.payment ? body.datas.rows.payment.paymentId : null;
                        Routing.RSC.query_RSC_order(RSC_token, null, null, function (body) {
                            body.should.containDeep(expected_RSC_order_list);
                            Routing.RSC.query_RSC_order(RSC_token, extra_RSC_query_type, null, function (body) {
                                body.should.containDeep(expected_RSC_order_list);
                                done(paymentId);
                            })
                        })
                    })
                })
            })
        })
    })
};

exports.testGetAndPost = function(caseName,cookie){
    return new GetAndPostTest(caseName, cookie);
};

function GetAndPostTest(caseName) {
    var getReqRoute, postReqRoute, getReqQuery, postReqBody;
    var token;
    this.call = function (apiStr) {
        getReqRoute = postReqRoute = apiStr;
        return this;
    };

    this.send = function (params) {
        getReqQuery = postReqBody = params;
        return this;
    };

    this.token = function (fn) {
        token = fn;
        return this;
    };

    this.end = function (fn, noGet, noPost) {
        if(!noGet) {
            it(caseName + ' (get)', function (done) {
                // can only be execute here because we are waiting for some value in before block.
                if (typeof getReqQuery === 'function') {
                    getReqQuery = getReqQuery();
                }

                if (token) {
                    if (typeof token === 'function') {
                        getReqQuery = extend(true, getReqQuery, {token: token()});
                    } else {
                        getReqQuery = extend(true, getReqQuery, {token: token});
                    }
                }

                request.get(getReqRoute)
                    .query(getReqQuery)
                    .end(function (err, res) {
                        should.not.exist(err);
                        fn(err, res);
                        done();
                    })
            });
        }

        if(!noPost) {
            it(caseName + ' (post)', function (done) {
                if (typeof postReqBody === 'function') {
                    postReqBody = postReqBody();
                }

                if (token) {
                    if (typeof token === 'function') {
                        postReqBody = extend(true, postReqBody, {token: token()});
                    } else {
                        postReqBody = extend(true, postReqBody, {token: token});
                    }
                }
                request.post(postReqRoute)
                    .send(postReqBody)
                    .end(function (err, res) {
                        should.not.exist(err);
                        fn(err, res);
                        done();
                    })
            })
        }
    };
}

exports.request = request;

exports.save_file = function(content, filepath, done){
    var dir = path.dirname(filepath);

    fs.appendFile(filepath, content, 'utf-8', function(err){
        should.not.exist(err);
        done();
    })
};

exports.remove_file = function(path, done){
    fs.unlink(path, function(err){
        should.not.exist(err);
        done();
    })
};

exports.prepare_gift = function(backend_admin_token, deliveryType, gift_index, done){
    var test_gift = test_data.random_test_gift(gift_index);
    Routing.Rewardshop.query_categories(null, backend_admin_token, function (body) {
        body.should.have.property('code', 1000);
        test_categories = body.categories;
        test_categories.should.not.be.empty;
        var category = null;
        if (deliveryType) {
            for (var i=0; i < test_categories.length; i++) {
                if (test_categories[i].deliveries) {
                    for (var j=0; j < test_categories[i].deliveries.length; j++) {
                        var delivery = test_categories[i].deliveries[j];
                        if (deliveryType && delivery.deliveryType == deliveryType) {
                            category = test_categories[i];
                            break;
                        }
                    }
                }
            }
        } else {
            category = test_categories[0];
        }
        if (!category) {
            done(null);
            return;
        }
        Routing.Rewardshop.save_gift(utils.extend(test_gift, {
            category: category._id
        }), backend_admin_token, function (body) {
            body.should.have.property('code', 1000);
            var gift = body.gift;
            Routing.Rewardshop.online_gift(gift._id, true, backend_admin_token, function(body){
                    body.should.have.property('code', 1000);
                    gift.online = true;
                    done(gift);
            });
        });
    });
};

exports.request = request;
