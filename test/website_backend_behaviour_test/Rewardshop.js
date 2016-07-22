/**
 * Created by zhouxin on 2016/7/5.
 */
var Routing = require('./Routing');
var NodeRSA = require('node-rsa');
require('should-http');
var should = require('should');
var request = require('supertest');
var app = require('../../release');
var models = require('../../models');
var RewardshopGiftModel = models.rewardshopgift;
var RewardshopGiftOrderModel = models.rewardshopgiftorder;
var LoyaltyPointsLogsModel = models.loyaltypointslogs
var test_data = require('./test_data');
var config = require('../../config');
var utils = require('../../common/utils');
var Components = require('./utilities/components');
var cookieParser = require('cookie');

describe('Rewardshop', function() {
	var test_user = test_data.test_user;
    var backend_admin = test_data.backend_admin;
    var backend_admin_token;
    var test_categories;
    var test_gift;
    var imgUrl;
    before('create backend admin and login', function (done) {
        Routing.User.create_backend_account(backend_admin.account, backend_admin.password, backend_admin.role, function () {
            Routing.User.backendLogin(backend_admin.account, backend_admin.password, function (err, token) {
                should.not.exist(err);
                backend_admin_token = token;
                done();
            });
        });
    });

    after('delete backend admin', function (done) {
        Routing.User.delete_backend_account(backend_admin.account, done);
    });

    before('upload ckeditor photo', function(done){
        Routing.Rewardshop.upload_gift_photo(backend_admin_token, __dirname+'/test.jpg', function(text){
            var bodyRegex = /<script type="text\/javascript">[\s\S]+window\.parent\.CKEDITOR\.tools\.callFunction\(.+,'(.+)'\)[\s\S]+<\/script>/;
            text.should.match(bodyRegex);
            done();
        });
    });

    before('upload photo', function(done){
        Routing.backend_upload_photo(backend_admin_token, __dirname+'/test.jpg', function(body){
            body.should.have.a.lengthOf(1);
            var regex = /(.+)\..+/;
            body[0].should.match(regex);
            imgUrl = regex.exec(body[0])[1];
            done();
        });
    });

 //    describe('new gift', function(){
 //    	beforeEach('create gift', function(done) {
	//         Routing.Rewardshop.query_categories(null, backend_admin_token, function (body) {
	//         	body.should.have.property('code', 1000);
	//             test_categories = body.categories;
	//             test_categories.should.not.be.empty;
	//             Routing.Rewardshop.save_gift(utils.extend(test_data.test_gift, {
	//                 category: test_categories[0]._id,
	//                 pictures: [imgUrl]
	//             }), backend_admin_token, function (body) {
	//                 body.should.have.property('code', 1000);
	//                 test_gift = body.gift;
	//                 done();
	//             });
	//         });
	//     });
	//     afterEach('delete all gift', function(done){
	//         RewardshopGiftModel.find({}).remove(function(err){
	//             should.not.exist(err);
	//             done();
	//         });
	//     });
 //    	it('online gift', function(done){
 //            Routing.Rewardshop.backend_get_gift(test_gift._id, backend_admin_token, function(body){
 //                body.should.have.containDeep({
 //                	code:1000,
 //                    gift:{
	// 			        _id: test_gift._id,
	// 					id: test_gift.id,
	// 					name: test_gift.name,
	// 					category: test_gift.category.ref,
	// 			        marketPrice: test_gift.marketPrice,
	// 			        points: test_gift.points,
	// 			        soldout: test_gift.soldout,
	// 			        istop: test_gift.istop,
	// 					online: test_gift.online
	// 			    }
 //                });
 //                Routing.Rewardshop.get_gift(test_gift.id, function(body){
	//                 body.should.have.containDeep({
	//                 	code:1000,
	//                     gift:{
 //                            _id: test_gift._id,
	// 						id: test_gift.id,
	// 						name: test_gift.name,
	// 				        marketPrice: test_gift.marketPrice,
	// 				        points: test_gift.points,
	// 				        soldout: test_gift.soldout,
	// 				        istop: test_gift.istop,
	// 						online: test_gift.online,
	// 						appbody_url: 'http://127.0.0.1/gift/appbody/'+test_gift.id,
	// 						category: {
	// 							_id: test_gift.category.ref,
	// 							name: test_categories[0].name,
	// 							deliveries: test_categories[0].deliveries
	// 						},
	// 						pictures: [
	// 						{
	// 						largeUrl: "/images/large/"+imgUrl+".jpg",
	// 						thumbnail: "/images/thumbnail/"+imgUrl+".jpg",
	// 						originalUrl: "/images/original/"+imgUrl+".jpg"
	// 						}
	// 						],
	// 						largeUrl: "/images/large/"+imgUrl+".jpg",
	// 						thumbnail: "/images/thumbnail/"+imgUrl+".jpg",
	// 						originalUrl: "/images/original/"+imgUrl+".jpg"
	// 				    }
	//                 });
	//                 Routing.Rewardshop.online_gift(test_gift._id, true, backend_admin_token, function(body) {
	//                 	body.should.have.property('code', 1000);
	//                 	Routing.Rewardshop.backend_get_gift(test_gift._id, backend_admin_token, function(body){
	// 		                body.should.have.containDeep({
	// 		                	code:1000,
	// 		                    gift:{
	// 								online: true
	// 						    }
	// 		                });
	// 		                Routing.Rewardshop.get_gift(test_gift.id, function(body){
	// 			                body.should.have.containDeep({
	// 			                	code:1000,
	// 			                    gift:{
	// 									online: true
	// 							    }
	// 			                });
	// 			                done();
	// 			            });
	// 			        });
	// 			    });
	//             });
	//         });
	//     });
 //        it('soldout gift', function(done){
 //            Routing.Rewardshop.backend_get_gift(test_gift._id, backend_admin_token, function(body){
 //                body.should.have.containDeep({
 //                	code:1000,
 //                    gift:{
	// 			        _id: test_gift._id,
	// 					id: test_gift.id,
	// 					name: test_gift.name,
	// 					category: test_gift.category.ref,
	// 			        marketPrice: test_gift.marketPrice,
	// 			        points: test_gift.points,
	// 			        soldout: test_gift.soldout,
	// 			        istop: test_gift.istop,
	// 					online: test_gift.online
	// 			    }
 //                });
 //                Routing.Rewardshop.get_gift(test_gift.id, function(body){
	//                 body.should.have.containDeep({
	//                 	code:1000,
	//                     gift:{
	// 				        _id: test_gift._id,
	// 						id: test_gift.id,
	// 						name: test_gift.name,
	// 				        marketPrice: test_gift.marketPrice,
	// 				        points: test_gift.points,
	// 				        soldout: test_gift.soldout,
	// 				        istop: test_gift.istop,
	// 						online: test_gift.online,
	// 						appbody_url: 'http://127.0.0.1/gift/appbody/'+test_gift.id,
	// 						category: {
	// 							_id: test_gift.category.ref,
	// 							name: test_categories[0].name,
	// 							deliveries: test_categories[0].deliveries
	// 						},
	// 						pictures: [
	// 						{
	// 						largeUrl: "/images/large/"+imgUrl+".jpg",
	// 						thumbnail: "/images/thumbnail/"+imgUrl+".jpg",
	// 						originalUrl: "/images/original/"+imgUrl+".jpg"
	// 						}
	// 						],
	// 						largeUrl: "/images/large/"+imgUrl+".jpg",
	// 						thumbnail: "/images/thumbnail/"+imgUrl+".jpg",
	// 						originalUrl: "/images/original/"+imgUrl+".jpg"
	// 				    }
	//                 });
	//                 Routing.Rewardshop.soldout_gift(test_gift._id, true, backend_admin_token, function(body) {
	//                 	body.should.have.property('code', 1000);
	//                 	Routing.Rewardshop.backend_get_gift(test_gift._id, backend_admin_token, function(body){
	// 		                body.should.have.containDeep({
	// 		                	code:1000,
	// 		                    gift:{
	// 								soldout: true
	// 						    }
	// 		                });
	// 		                Routing.Rewardshop.get_gift(test_gift.id, function(body){
	// 			                body.should.have.containDeep({
	// 			                	code:1000,
	// 			                    gift:{
	// 									soldout: true
	// 							    }
	// 			                });
	// 			                done();
	// 			            });
	// 			        });
	// 			    });
	//             });
	//         });
	//     });
	//     it('online gift and query gifts by category', function(done){
 //            Routing.Rewardshop.query_gifts(test_gift.category.ref, null, null, function(body){
 //                body.should.have.containDeep({
 //                    code:1000,
 //                    datas:{
 //                        total:0,
 //                        gifts:[],
 //                        pages:0,
 //                        page:0
 //                    }
 //                });
 //                Routing.Rewardshop.online_gift(test_gift._id, true, backend_admin_token, function(body){
 //                    body.should.have.property('code', 1000);
 //                    Routing.Rewardshop.query_gifts(test_gift.category.ref, null, null, function(body) {
 //                        body.should.containDeep({
 //                            code: 1000,
 //                            datas: {
 //                                total: 1,
 //                                gifts: [{
	// 								id: test_gift.id,
	// 								name: test_gift.name,
	// 						        marketPrice: test_gift.marketPrice,
	// 						        points: test_gift.points,
	// 						        soldout: test_gift.soldout,
	// 						        istop: test_gift.istop,
	// 								online: true,
	// 								category: {
	// 									_id: test_gift.category.ref,
	// 									name: test_categories[0].name
	// 								},
	// 								pictures: [
	// 								{
	// 								largeUrl: "/images/large/"+imgUrl+".jpg",
	// 								thumbnail: "/images/thumbnail/"+imgUrl+".jpg",
	// 								originalUrl: "/images/original/"+imgUrl+".jpg"
	// 								}
	// 								],
	// 								largeUrl: "/images/large/"+imgUrl+".jpg",
	// 								thumbnail: "/images/thumbnail/"+imgUrl+".jpg",
	// 								originalUrl: "/images/original/"+imgUrl+".jpg"
 //                                }],
 //                                pages: 1,
 //                                page: 0
 //                            }
 //                        });
 //                        done();
 //                    });
 //                });
 //            });
 //        });
	// });

	describe('exchange gift', function(){
		var test_user_token;
		var RSC_A, RSC_B;
        var RSC_A_token, RSC_B_token;
        var test_address_A, test_address_B;
        var test_user_consignee_address_id;
        var gift_A, gift_B, gift_C;
        before('create gift A(For ZITI change status by RSC), B(For SONGHUO), C(For ZITI change status by backend user).', function(done){
            Components.prepare_gift(backend_admin_token, 1, 0, function(gift){
                gift_A = gift;
                Components.prepare_gift(backend_admin_token, 2, 1, function(gift) {
                    gift_B = gift;
                    Components.prepare_gift(backend_admin_token, 1, 2, function(gift){
                        gift_C = gift;
                        done();
                    });
                });
            });
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
	    before('prepare test address', function (done) {
	        Routing.Address.get_address_by_name(test_data.test_address.province, test_data.test_address.city, test_data.test_address.county, test_data.test_address.town, function (err, address) {
	            test_address = address;
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
        before('create front end user 1 -> login -> verified as RSC -> bind RSC with gift A,C.', function(done){
            var RSC = test_data.RSC(0);
            RSC.companyAddress = {
                province: test_address_A.province._id,
                city: test_address_A.city._id,
                county: test_address_A.county._id,
                town: test_address_A.town._id
            };
            if (gift_A) {
            	RSC.gifts = [gift_A._id];
            }
            if (gift_C) {
            	if (RSC.gifts) {
            		RSC.gifts.push(gift_C._id);
            	} else {
            		RSC.gifts = [gift_C._id];
            	}
            }
            Components.create_RSC(RSC, backend_admin_token, function(user, token){
                RSC.id = user.userid;
                RSC._id = user._id;
                RSC_A = RSC;
                RSC_A_token = token;
                done();
            });
        });
        before('create front end user 2 -> login -> verified as RSC -> bind RSC with gift B.', function(done){
            var RSC = test_data.RSC(1);
            RSC.companyAddress = {
                province: test_address_B.province._id,
                city: test_address_B.city._id,
                county: test_address_B.county._id,
                town: test_address_B.town._id
            };
            if (gift_B) {
            	RSC.gifts = [gift_A._id];
            }
            Components.create_RSC(RSC, backend_admin_token, function(user, token){
                RSC.id = user.userid;
                RSC._id = user._id;
                RSC_B = RSC;
                RSC_B_token = token;
                done();
            });
        });
        after('remove RSCs', function (done) {
        	if (RSC_A) {
	        	Routing.User.delete_frontend_account(RSC_A.account, function(){
	        		if (RSC_B) {
        				Routing.User.delete_frontend_account(RSC_B.account, done);
        			} else {
        				done();
        			}
        		});
	        }
	        if (!RSC_A && RSC_B) {
	        	Routing.User.delete_frontend_account(RSC_B.account, done);
	        }
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
        after('delete user consignee address and remove test user', function (done) {
        	Routing.User.delete_user_address(test_user_token, test_user_consignee_address_id, function(){
        		Routing.User.delete_frontend_account(test_user.account, done);
        	});
	    });
        after('delete orders and exchange logs', function(done){
            RewardshopGiftOrderModel.find({}).remove();
            LoyaltyPointsLogsModel.find({}).remove();
            done();
        });
	    describe('exchange gift, 1)not online 2)soldout 3)user no points', function(){
	    	before('create gift', function(done) {
		        Routing.Rewardshop.query_categories(null, backend_admin_token, function (body) {
		        	body.should.have.property('code', 1000);
		            test_categories = body.categories;
		            test_categories.should.not.be.empty;
		            Routing.Rewardshop.save_gift(utils.extend(test_data.test_gift, {
		                category: test_categories[0]._id,
		                pictures: [imgUrl]
		            }), backend_admin_token, function (body) {
		                body.should.have.property('code', 1000);
		                test_gift = body.gift;
		                RSC_A.gifts.push(test_gift._id);
		                Components.create_RSC(RSC_A, backend_admin_token, function(user, token){
			                done();
			            });
		            });
		        });
		    });
		    after('delete all gift', function(done){
		        RewardshopGiftModel.find({}).remove(function(err){
		            should.not.exist(err);
		            done();
		        });
		    });
		    
	    	it('1) not online', function(done) {
	    		var postData = {
		    		giftId: test_gift.id,
		    		deliveryType: 1,
		    		RSCId: RSC_A.id,
		    		consigneePhone: test_user.consignee[0].phone,
		    		consigneeName: test_user.consignee[0].name
		    	};
	    		var expected_delivery_type = {
	    			gift: {
		    			id: test_gift.id,
		    			category: {
							deliveries: [{
			                    deliveryType:1,
			                    deliveryName:'网点自提'
			                }]
			            }
			        }
		        };
	    		var expected_order = {code:1001, message:'无法兑换下架礼品'};
	    		Routing.Rewardshop.get_gift(test_gift.id, function(body){
	    			body.should.have.containDeep(expected_delivery_type);
	    			Routing.Rewardshop.add_gift_order(postData, test_user_token, function(body) {
	    				body.should.have.containDeep(expected_order);
	    				Routing.Rewardshop.online_gift(test_gift._id, true, backend_admin_token, function(body) {
	                		body.should.have.property('code', 1000);
			                Routing.Rewardshop.get_gift(test_gift.id, function(body){
				                body.should.have.containDeep({
				                	code:1000,
				                    gift:{
										online: true
								    }
				                });
				                done();
				            });
				        });
	    			});
	    		});
	    	});
	    	it('2) soldout', function(done) {
	    		var postData = {
		    		giftId: test_gift.id,
		    		deliveryType: 1,
		    		RSCId: RSC_A.id,
		    		consigneePhone: test_user.consignee[0].phone,
		    		consigneeName: test_user.consignee[0].name
		    	};
	    		var expected_delivery_type = {
	    			gift: {
		    			id: test_gift.id,
		    			category: {
							deliveries: [{
			                    deliveryType:1,
			                    deliveryName:'网点自提'
			                }]
			            }
			        }
		        };
	    		var expected_order = {code:1001, message:'无法兑换售罄礼品'};
	    		Routing.Rewardshop.get_gift(test_gift.id, function(body){
	    			body.should.have.containDeep(expected_delivery_type);
    				Routing.Rewardshop.soldout_gift(test_gift._id, true, backend_admin_token, function(body) {
                		body.should.have.property('code', 1000);
	                	Routing.Rewardshop.add_gift_order(postData, test_user_token, function(body) {
	    					body.should.have.containDeep(expected_order);
			                Routing.Rewardshop.get_gift(test_gift.id, function(body){
				                body.should.have.containDeep({
				                	code:1000,
				                    gift:{
										online: true
								    }
				                });
				                Routing.Rewardshop.soldout_gift(test_gift._id, false, backend_admin_token, function(body) {
                					body.should.have.property('code', 1000);
				                	done();
				                });
				            });
				        });
	    			});
	    		});
	    	});
	    	it('3) user no points', function(done) {
	    		var postData = {
		    		giftId: test_gift.id,
		    		deliveryType: 1,
		    		RSCId: RSC_A.id,
		    		consigneePhone: test_user.consignee[0].phone,
		    		consigneeName: test_user.consignee[0].name
		    	};
	    		var expected_delivery_type = {
	    			gift: {
		    			id: test_gift.id,
		    			category: {
							deliveries: [{
			                    deliveryType:1,
			                    deliveryName:'网点自提'
			                }]
			            }
			        }
		        };
	    		var expected_order = {code:1001, message:'积分不足'};
	    		Routing.Rewardshop.get_gift(test_gift.id, function(body){
	    			body.should.have.containDeep(expected_delivery_type);
	                Routing.Rewardshop.add_gift_order(postData, test_user_token, function(body) {
	    				body.should.have.containDeep(expected_order);
				        done();
	    			});
	    		});
	    	});
	    });
	});
});