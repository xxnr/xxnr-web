/**
 * Created by pepelu on 2016/5/30.
 */
var utils = require('./utils');
require('should-http');
var should = require('should');
var request = require('supertest');
var app = require('../../release');
var models = require('../../models');
var config = require('../../config');
var test_data = require('./test_data');
var deployment = require('../../deployment');

describe('Product', function(){
    var imgUrl = '';
    var backend_admin = test_data.backend_admin;
    before('deploy supplier, brands, product_attributes, SKU_attributes', function(done){
        deployment.deploy_SKU(done);
    });

    before('deploy roles and permissions', function(done){
        deployment.deploy_auth(done);
    });

    before('create test admin account in backend user', function(done){
        utils.create_backend_account(backend_admin.account, backend_admin.password, backend_admin.role, done);
    });

    after('delete test admin account in backend user', function(done){
        utils.delete_backend_account(backend_admin.account, done);
    });

    it('test img upload', function(done){
        utils.backendLogin(backend_admin.account, backend_admin.password, function(err, token){
            should.not.exist(err);
            request(app)
                .post(config.manager_url + '/products/uploadImage')
                .field('token', token)
                .attach('image', __dirname + '/test.jpg')
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.have.status(200);
                    res.should.be.html();
                    var bodyRegex = /<script type="text\/javascript">[\s\S]+window\.parent\.CKEDITOR\.tools\.callFunction\(.+,(.+)\)[\s\S]+<\/script>/;
                    res.text.should.match(bodyRegex);
                    imgUrl = bodyRegex.exec(res.text)[1];
                    done();
                })
        })
    });

    //describe('new product with SKUs', function(){
    //
    //})
});