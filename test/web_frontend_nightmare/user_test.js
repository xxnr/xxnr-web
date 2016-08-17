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
<<<<<<< HEAD
            .evaluate(function () {
                return document.querySelector(logonSelectors.logonRegisterFormTitle).innerHTML
            });
=======
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormTitle).innerHTML
            },logonSelectors);
>>>>>>> master
        expect(result).to.equal('注册');
    });
    it('2.登录页面进入', function * () {
        var result = yield nightmare
            .goto(BaseUrl+'logon.html')
            .wait(logonSelectors.logonLoginForm)
            .click(logonSelectors.logonLoginFormRegisterBtn)
            .wait(logonSelectors.logonRegisterForm)
<<<<<<< HEAD
            .evaluate(function () {
                return document.querySelector(logonSelectors.logonRegisterFormTitle).innerHTML
            });
=======
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormTitle).innerHTML
            },logonSelectors);
>>>>>>> master
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
            .wait(logonSelectors.logonRegisterForm)
            .click(logonSelectors.logonRegisterFormRegisterBtn)
<<<<<<< HEAD
            .evaluate(function () {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            });
=======
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors);
>>>>>>> master
        expect(result).to.equal(logonWording.noPhoneErrMsg);
    });
    it('6.手机号已注册', function * () {
        var result = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.registeredPhone.number)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
<<<<<<< HEAD
            .evaluate(function () {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            });
=======
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors);
>>>>>>> master
        expect(result).to.equal(logonWording.registeredErrMsg);
    });
    it('7.手机号格式错误', function * () {
        var result = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,"999")
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
<<<<<<< HEAD
            .evaluate(function () {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            });
=======
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors);
>>>>>>> master
        expect(result).to.equal(logonWording.wrongPhoneMsg);
    });
    it('8.手机号格式错误', function * () {
        var result = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,"99999999999")
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
<<<<<<< HEAD
            .evaluate(function () {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            });
=======
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors);
>>>>>>> master
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
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.notRegisterPhone.number)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
            .checkNgShow(logonSelectors.logonRegisterFormVerificationCode);
        shows.should.be.true;

        yield nightmare
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)

        var errMsg = yield nightmare
<<<<<<< HEAD
            .evaluate(function () {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            });
        expect(errMsg).to.equal(logonWording.needGraphCaptcha);
    });
    it('13.未输入图形验证码，点注册', function * () {

    });

    //把验证的wording提出到 config
    //把selector 也提出来
=======
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors);
        expect(errMsg).to.equal(logonWording.needGraphCaptcha);
    });
    it('13.未输入图形验证码，点注册', function * () {
        var shows = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.notRegisterPhone.number)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
            .checkNgShow(logonSelectors.logonRegisterFormVerificationCode);
        shows.should.be.true;

        yield nightmare
            .click(logonSelectors.logonRegisterFormRegisterBtn)
            .wait(500)

        var errMsg = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)
        expect(errMsg).to.equal(logonWording.needCode);
    });
    it('14.获取验证码错误', function * () {

    });
    it('15.图形验证码输入错误，点发送验证码', function * () {
        var shows = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.notRegisterPhone.number)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
            .checkNgShow(logonSelectors.logonRegisterFormVerificationCode);
        shows.should.be.true;

        yield nightmare
            .type(logonSelectors.logonRegisterFormVerificationCodeInput,config.randomVerificationCode)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
        var errMsg = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.wrongGraphCaptcha);
    });
    it('16.刷新图形验证码 - 鼠标变成小手，文字提示“换一张”', function * () {

    });
    it('17.刷新图形验证码 - 刷新验证码', function * () {
        var shows = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.notRegisterPhone.number)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
            .checkNgShow(logonSelectors.logonRegisterFormVerificationCode);
        shows.should.be.true;

        var captchaImgSrc = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormGraphCaptchaImg).src
            },logonSelectors);

        yield nightmare
            .click(logonSelectors.logonRegisterFormGraphCaptchaImg)
            .wait(500);

        var newCaptchaImgSrc = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormGraphCaptchaImg).src
            },logonSelectors)
        expect(captchaImgSrc).to.not.equal(newCaptchaImgSrc);
    });
    it('18.刷新图形验证码 - 所有刷新次数超过限制', function * () {

    });
    it('19.刷新图形验证码 - 单个IP刷新次数超过限制', function * () {

    });
    it('20.刷新图形验证码 - 1.未填写手机号，点图形验证码', function * () {
        var shows = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.notRegisterPhone.number)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
            .checkNgShow(logonSelectors.logonRegisterFormVerificationCode);
        shows.should.be.true;


        yield nightmare
            .type(logonSelectors.logonRegisterFormPhoneInput,"")
            .wait(500);

        var phone = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormPhoneInput).value
            },logonSelectors)
            .wait(500);
        console.log(phone);

        var errMsg = yield nightmare
            .wait(500)
            .click(logonSelectors.logonRegisterFormGraphCaptchaImg)
            .wait(500)
            .click(logonSelectors.logonRegisterFormGraphCaptchaImg)
            .wait(500)
            .click(logonSelectors.logonRegisterFormGraphCaptchaImg)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.noPhoneErrMsg);
    });


>>>>>>> master
});