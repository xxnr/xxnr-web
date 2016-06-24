/**
 * Created by pepelu on 2016/6/7.
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
var NewsModel = models.news;

describe('News', function(){
    var backend_admin = test_data.backend_admin;
    var backend_admin_token;
    before('delete all news', function(done){
        NewsModel.find({}).remove(done);
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

    beforeEach('create news', function(done){
        Routing.News.save_news(test_data.test_news, backend_admin_token, function(body){
            body.should.have.property('code', 1000);
            done();
        });
    });

    afterEach('delete all news', function(done){
        NewsModel.find({}).remove(done);
    });

    it('create -> online -> offline news', function(done){
        var expected_news_category_before_online = {
            code:'1000',
            datas:[]
        };
        var expected_news_category_after_online = {
            code:'1000',
            datas:[{
                name:test_data.test_news.category,
                linker:test_data.test_news.category,
                total:1
            }]
        };
        var expected_news_list_before_online = {
            code:'1000',
            datas:{
                items:[],
                count:0,
                page:1,
                pages:1
            }
        };
        var expected_news_list_after_online = {
            code:'1000',
            datas: {
                items:[{
                    image: 'http://127.0.0.1/images/original/' + test_data.test_news.picture + '.jpg',
                    category: test_data.test_news.category,
                    title: test_data.test_news.title,
                    url: 'http://127.0.0.1/news/' + test_data.test_news.id,
                    shareurl: 'http://127.0.0.1/sharenews/' + test_data.test_news.id,
                    id: test_data.test_news.id,
                    newsabstract: test_data.test_news.abstract
                }],
                count:1,
                page:1,
                pages:1
            }
        };
        var expected_news_detail_before_online = {
            code:'1000',
            datas:null
        };
        var expected_news_detail_after_online={
            code:'1000',
            datas:{
                id:test_data.test_news.id,
                category:test_data.test_news.category,
                title:test_data.test_news.title,
                newsbody:test_data.test_news.newsbody,
                abstract:test_data.test_news.abstract
            }
        };
        // pre online
        Routing.News.query_news_category(function(body){
            body.should.containDeep(expected_news_category_before_online);
            Routing.News.query_news(null, function(body){
                body.should.containDeep(expected_news_list_before_online);
                Routing.News.get_news_detail(test_data.test_news.id, function(body){
                    body.should.containDeep(expected_news_detail_before_online);
                    // online
                    Routing.News.change_news_status(test_data.test_news.id, 2, test_data.test_news.category, backend_admin_token, function(body){
                        body.should.have.property('code', 1000);
                        Routing.News.query_news_category(function(body) {
                            body.should.containDeep(expected_news_category_after_online);
                            Routing.News.query_news(null, function (body) {
                                body.should.containDeep(expected_news_list_after_online);
                                Routing.News.query_news(test_data.test_news.category, function(body) {
                                    body.should.containDeep(expected_news_list_after_online);
                                    Routing.News.get_news_detail(test_data.test_news.id, function (body) {
                                        body.should.containDeep(expected_news_detail_after_online);
                                        // offline
                                        Routing.News.change_news_status(test_data.test_news.id, 3, test_data.test_news.category, backend_admin_token, function (body) {
                                            Routing.News.query_news_category(function (body) {
                                                body.should.containDeep(expected_news_category_before_online);
                                                Routing.News.query_news(null, function (body) {
                                                    body.should.containDeep(expected_news_list_before_online);
                                                    Routing.News.get_news_detail(test_data.test_news.id, function (body) {
                                                        body.should.containDeep(expected_news_detail_before_online);
                                                        done();
                                                    });
                                                })
                                            })
                                        })
                                    })
                                });
                            })
                        })
                    })
                })
            })
        })
    });

    it('modify news info', function(done){
        var updated_news = {
            id:test_data.test_news.id,
            picture:'newtestpicture',
            category:'newcategory',
            title:'new测试资讯标题',
            newsbody:'<p>newabcdefg测试资讯body</p>',
            abstract:'new测试资讯摘要'
        };
        var expected_news_list = {
            code:'1000',
            datas: {
                items:[{
                    image: 'http://127.0.0.1/images/original/' + updated_news.picture + '.jpg',
                    category: updated_news.category,
                    title: updated_news.title,
                    url: 'http://127.0.0.1/news/' + updated_news.id,
                    shareurl: 'http://127.0.0.1/sharenews/' + updated_news.id,
                    id: test_data.test_news.id,
                    newsabstract: updated_news.abstract
                }],
                count:1,
                page:1,
                pages:1
            }
        };
        var expected_news_detail = {
            code:'1000',
            datas:{
                id:test_data.test_news.id,
                category:updated_news.category,
                title:updated_news.title,
                newsbody:updated_news.newsbody,
                abstract:updated_news.abstract
            }
        };
        var expected_category_list = {
            code:'1000',
            datas:[{
                name:updated_news.category,
                linker:updated_news.category,
                total:1
            }]
        };
        Routing.News.change_news_status(test_data.test_news.id, 2, test_data.test_news.category, backend_admin_token, function(body) {
            body.should.have.property('code', 1000);
            Routing.News.save_news(updated_news, backend_admin_token, function (body) {
                body.should.have.property('code', 1000);
                Routing.News.query_news(null, function (body) {
                    body.should.containDeep(expected_news_list);
                    Routing.News.get_news_detail(test_data.test_news.id, function (body) {
                        body.should.containDeep(expected_news_detail);
                        Routing.News.query_news_category(function (body) {
                            body.should.containDeep(expected_category_list);
                            done();
                        });
                    })
                })
            })
        })
    });

    it('news delete', function(done){
        var expected_category_list_after_delete = {
            code:'1000',
            datas:[]
        };
        var expected_news_list_after_delete = {
            code:'1000',
            datas:{
                items:[],
                count:0,
                page:1,
                pages:1
            }
        };
        var expected_news_detail_after_delete = {
            code:'1000',
            datas:null
        };
        Routing.News.change_news_status(test_data.test_news.id, 2, test_data.test_news.category, backend_admin_token, function(body) {
            body.should.have.property('code', 1000);
            Routing.News.delete_news(test_data.test_news.id, backend_admin_token, function(body){
                body.should.have.property('code', 1000);
                Routing.News.query_news_category(function (body) {
                    body.should.containDeep(expected_category_list_after_delete);
                    Routing.News.query_news(null, function (body) {
                        body.should.containDeep(expected_news_list_after_delete);
                        Routing.News.get_news_detail(test_data.test_news.id, function (body) {
                            body.should.containDeep(expected_news_detail_after_delete);
                            done();
                        });
                    });
                })
            })
        })
    });

    describe('paging and sorting', function() {
        var test_news_1 = test_data.test_news;
        var test_news_2 = {
            id: 'testnews2',
            category: 'newscategory2',
            title: 'title2',
            status: '2'
        };

        beforeEach('create test news 2 and online all news', function (done) {
            Routing.News.save_news(test_news_2, backend_admin_token, function (body) {
                body.should.have.property('code', 1000);
                Routing.News.change_news_status(test_data.test_news.id, 2, test_data.test_news.category, backend_admin_token, function(body) {
                    body.should.have.property('code', 1000);
                    done();
                });
            });
        });

        it('paging', function (done) {
            var expected_news_list_page_1 = {
                code: '1000',
                datas: {
                    items: [{
                        id: test_news_2.id
                    }],
                    count: 2,
                    page: 1,
                    pages: 2
                }
            };
            var expected_news_list_page_2 = {
                code: '1000',
                datas: {
                    items: [{
                        id: test_news_1.id
                    }],
                    count: 2,
                    page: 2,
                    pages: 2
                }
            };

            Routing.News.query_news(null, function (body) {
                body.should.containDeep(expected_news_list_page_1);
                Routing.News.query_news(null, function (body) {
                    body.should.containDeep(expected_news_list_page_2);
                    done()
                }, 2, 1)
            }, 1, 1)
        });

        it('sorting', function(done){
            var expected_news_list_before_update = {
                code: '1000',
                datas: {
                    items: [
                        {
                            id: test_news_2.id
                        },
                        {
                            id: test_news_1.id
                        }],
                    count: 2,
                    page: 1,
                    pages: 1
                }
            };
            var expected_news_list_after_update = {
                code: '1000',
                datas: {
                    items: [
                        {
                            id: test_news_1.id
                        },
                        {
                            id: test_news_2.id
                        }],
                    count: 2,
                    page: 1,
                    pages: 1
                }
            };
            Routing.News.query_news(null, function(body){
                body.should.containDeepOrdered(expected_news_list_before_update);
                test_news_1.istop = true;
                Routing.News.save_news(test_news_1, backend_admin_token, function(body){
                    body.should.have.property('code', 1000);
                    Routing.News.query_news(null, function(body) {
                        body.should.containDeepOrdered(expected_news_list_after_update);
                        done();
                    });
                })
            })
        });
    });
});