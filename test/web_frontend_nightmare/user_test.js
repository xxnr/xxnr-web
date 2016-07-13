var Nightmare = require('nightmare');
var expect = require('chai').expect; // jshint ignore:line
//var should = require('should');
var should = require('chai').should();
require('mocha-generators').install();
var config = require('./config').test;
var logonWording = require('./staticWording').logonWording;
var logonSelectors = require('./selectorsList').logonSelectors;
var BaseUrl = config.BaseUrl;
var actions = require('./nightmareActions');

describe('Nightmare', function() {

    var nightmare;
    //before all of the tests,
    //before(function(done) {
    //    //have the test server listen on a given port
    //    server.listen(7500, done);
    //});

    //before each test,
    beforeEach(function(){
        //create a new nightmare instance
        nightmare = Nightmare({show:true});
    });

    //after each test,
    afterEach(function *(){
        //end the nightmare instance
        yield nightmare.end();
    });
    this.timeout(30000);
    it('1.页面顶部导航进入', function * () {
        var result = yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerRegisterBtn)
            .wait(logonSelectors.logonRegisterForm)
            .evaluate(function () {
                return document.querySelector(logonSelectors.logonRegisterFormTitle).innerHTML
            });
        expect(result).to.equal('注册');
    });
    it('2.登录页面进入', function * () {
        var result = yield nightmare
            .goto(BaseUrl+'logon.html')
            .wait('div.login_form')
            .click('div.login_form form.ng-pristine.ng-invalid.ng-invalid-required div.register_message.clearfix span.right a')
            .wait('div.register_form')
            .evaluate(function () {
                return document.querySelector('div.register_form p.register_form--title').innerHTML
            });
        expect(result).to.equal('注册');
    });
    it('3.发送验证码', function * () {
        // TODO
    });
    it('4.注册成功', function * () {
        // TODO
    });
    it('5.未填写手机号', function * () {
        var result = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait('div.register_form')
            .click('button.register_btn')
            .evaluate(function () {
                return document.querySelector('div.register_error span.ng-binding').innerHTML
            });
        expect(result).to.equal(logonWording.noPhoneErrMsg);
    });
    it('6.手机号已注册', function * () {
        var result = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait('div.register_form')
            .type('div.register_form form.registerForm div.form-group input',config.registeredPhone.number)
            .click('div.right.reg_get_code_btn a.ng-binding')
            .wait(500)
            .evaluate(function () {
                return document.querySelector('div.register_error span.ng-binding').innerHTML
            });
        expect(result).to.equal(logonWording.registeredErrMsg);
    });
    it('7.手机号格式错误', function * () {
        var result = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait('div.register_form')
            .type('div.register_form form.registerForm div.form-group input',"999")
            .click('div.right.reg_get_code_btn a.ng-binding')
            .wait(500)
            .evaluate(function () {
                return document.querySelector('div.register_error span.ng-binding').innerHTML
            });
        expect(result).to.equal(logonWording.wrongPhoneMsg);
    });
    it('8.手机号格式错误', function * () {
        var result = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait('div.register_form')
            .type('div.register_form form.registerForm div.form-group input',"99999999999")
            .click('div.right.reg_get_code_btn a.ng-binding')
            .wait(500)
            .evaluate(function () {
                return document.querySelector('div.register_error span.ng-binding').innerHTML
            });
        expect(result).to.equal(logonWording.wrongPhoneMsg);
    });
    it('9.需输入图形验证码情况 - 代理IP', function * () {
        // TODO
    });
    it('10.需输入图形验证码情况 - 真实IP一天内第二次点击发送验证码', function * () {
        // TODO
    });
    it('11.输入图形验证码正确流程', function * () {
        // TODO
    });
    it('12.未输入图形验证码，点发送验证码', function * () {
        var shows = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait('div.register_form')
            .type('div.register_form form.registerForm div.form-group input',config.notRegisterPhone.number)
            .click('div.right.reg_get_code_btn a.ng-binding')
            .wait(500)
            .checkNgShow('.verification-code');
        shows.should.be.true;

        yield nightmare
            .click('div.right.reg_get_code_btn a.ng-binding')
            .wait(500)

        var errMsg = yield nightmare
            .evaluate(function () {
                return document.querySelector('div.register_error span.ng-binding').innerHTML
            });
        expect(errMsg).to.equal(logonWording.needGraphCaptcha);
    });
    it('13.未输入图形验证码，点注册', function * () {

    });

    //把验证的wording提出到 config
    //把selector 也提出来
});