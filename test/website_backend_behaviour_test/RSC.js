/**
 * Created by pepelu on 2016/6/23.
 */
var test_data = require('./test_data');
var models = require('../../models');
var UserModel = models.user;
var Routing = require('./Routing');
require('should-http');
var should = require('should');

describe('RSC', function(){
    var test_user = test_data.test_user;
    var backend_admin = test_data.backend_admin;
    var backend_admin_token;
    var test_address;
    var test_address_2, test_address_3;
    var token;
    var test_RSC_info = test_data.test_user.RSCInfo;
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
    before('register empty account and login', function (done) {
        Routing.User.create_frontend_account(test_user.account, test_user.password, function () {
            Routing.User.frontendLogin(test_user.account, test_user.password, function (body) {
                token = body.token;
                done();
            })
        })
    });
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
    after('delete backend admin', function (done) {
        Routing.User.delete_backend_account(backend_admin.account, done);
    });
    describe('Fill RSC info api', function(){
        var testCases = [
            {
                name:'fill RSC info w/o name',
                params:function(){return {token:token}},
                result:{code: 1001, message: '请填写真实姓名'}
            },{
                name:'fill RSC info w/o IDNo',
                params:function(){return {token:token, name:test_RSC_info.name}},
                result:{code: 1001, message: '请填写正确的身份证号'}
            },{
                name:'fill RSC info w/ invalid IDNo',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:'xxxx'}},
                result:{code: 1001, message: '请填写正确的身份证号'}
            },{
                name:'fill RSC info w/o phone',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo}},
                result:{code: 1001, message: '请填写正确的手机号'}
            },{
                name:'fill RSC info w/ invalid phone',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:'141'}},
                result:{code: 1001, message: '请填写正确的手机号'}
            },{
                name:'fill RSC info w/o company name',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone}},
                result:{code: 1001, message: '请填写公司门店名称'}
            },{
                name:'fill RSC info w/o company address',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone, companyName:test_RSC_info.companyName}},
                result:{code: 1001, message: '请填写网点地址'}
            },{
                name:'fill RSC info w/o province',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone, companyName:test_RSC_info.companyName, companyAddress:{city:test_address.city._id}}},
                result:{code: 1001, message: '请选择省份'}
            },{
                name:'fill RSC info w/o city',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone, companyName:test_RSC_info.companyName, companyAddress:{province:test_address.province._id}}},
                result:{code: 1001, message: '请选择城市'}
            },{
                name:'fill RSC info w/o town',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone, companyName:test_RSC_info.companyName, companyAddress:{province:test_address.province._id, city:test_address.city._id}}},
                result:{code: 1001, message: '请选择区县'}
            },{
                name:'fill RSC info w/ invalid province',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone, companyName:test_RSC_info.companyName, companyAddress:{province:'wrongprovinceid', city:test_address.city._id, town:test_address.town._id}}},
                result:{code: 1001, message: '没有查到要修改的省'}
            },{
                name:'fill RSC info w/ invalid city',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone, companyName:test_RSC_info.companyName, companyAddress:{province:test_address.province._id, city:'wrongcityid', town:test_address.town._id}}},
                result:{code: 1001, message: '没有查到要修改的市'}
            },{
                name:'fill RSC info w/ invalid county',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone, companyName:test_RSC_info.companyName, companyAddress:{province:test_address.province._id, city:test_address.city._id, county:'wrongcountyid', town:test_address.town._id}}},
                result:{code: 1001, message: '没有查到要修改的区县'}
            },{
                name:'fill RSC info w/ invalid town',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone, companyName:test_RSC_info.companyName, companyAddress:{province:test_address.province._id, city:test_address.city._id, county:test_address.county._id, town:'wrongtownid'}}},
                result:{code: 1001, message: '没有查到要修改的乡镇'}
            },{
                name:'fill RSC info w/ invalid town',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone, companyName:test_RSC_info.companyName, companyAddress:{province:test_address.province._id, city:test_address.city._id, town:'wrongtownid'}}},
                result:{code: 1001, message: '没有查到要修改的乡镇'}
            },{
                name:'fill RSC info w/ city not belong to province',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone, companyName:test_RSC_info.companyName, companyAddress:{province:test_address.province._id, city:test_address_3.city._id, county:test_address.county._id, town:test_address.town._id}}},
                result:{code: 1001, message: '所选城市不属于所选省份'}
            },{
                name:'fill RSC info w/ county not belong to city',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone, companyName:test_RSC_info.companyName, companyAddress:{province:test_address.province._id, city:test_address.city._id, county:test_address_2.county._id, town:test_address.town._id}}},
                result:{code: 1001, message: '所选区县不属于所选城市'}
            },{
                name:'fill RSC info w/ town not belong to county',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone, companyName:test_RSC_info.companyName, companyAddress:{province:test_address.province._id, city:test_address.city._id, county:test_address.county._id, town:test_address_2.town._id}}},
                result:{code: 1001, message: '所选乡镇不属于所选区县'}
            },{
                name:'fill RSC info w/ town not belong to city',
                params:function(){return {token:token, name:test_RSC_info.name, IDNo:test_RSC_info.IDNo, phone:test_RSC_info.phone, companyName:test_RSC_info.companyName, companyAddress:{province:test_address.province._id, city:test_address.city._id, town:test_address_2.town._id}}},
                result:{code: 1001, message: '所选乡镇不属于所选城市'}
            }
        ];

        testCases.forEach(function (test) {
            it(test.name, function(done) {
                Routing.RSC.fill_RSC_info(test.params().token, test.params().name, test.params().IDNo, test.params().phone, test.params().companyName, test.params().companyAddress, function (body) {
                    body.should.have.properties(test.result);
                    done();
                });
            })
        })
    });
});