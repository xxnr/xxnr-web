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
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormTitle).innerHTML
            },logonSelectors);
        expect(result).to.equal('注册');
    });
    it('2.登录页面进入', function * () {
        var result = yield nightmare
            .goto(BaseUrl+'logon.html')
            .wait(logonSelectors.logonLoginForm)
            .click(logonSelectors.logonLoginFormRegisterBtn)
            .wait(logonSelectors.logonRegisterForm)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormTitle).innerHTML
            },logonSelectors);
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
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors);
        expect(result).to.equal(logonWording.noPhoneErrMsg);
    });
    it('6.手机号已注册', function * () {
        var result = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.registeredPhone)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors);
        expect(result).to.equal(logonWording.registeredErrMsg);
    });
    it('7.手机号格式错误', function * () {
        var result = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,"999")
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors);
        expect(result).to.equal(logonWording.wrongPhoneMsg);
    });
    it('8.手机号格式错误', function * () {
        var result = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,"99999999999")
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors);
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
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
            .checkNgShow(logonSelectors.logonRegisterFormVerificationCode);
        shows.should.be.true;

        yield nightmare
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)

        var errMsg = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors);
        expect(errMsg).to.equal(logonWording.needGraphCaptcha);
    });
    it('13.未输入图形验证码，点注册', function * () {
        var shows = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
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
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
            .checkNgShow(logonSelectors.logonRegisterFormVerificationCode);
        shows.should.be.true;

        yield nightmare
            .type(logonSelectors.logonRegisterFormGraphVerificationCodeInput,config.randomGraphVerificationCode)
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
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
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
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
            .checkNgShow(logonSelectors.logonRegisterFormVerificationCode);
        shows.should.be.true;

        var phone = yield nightmare
            .wait(500)
            .type(logonSelectors.logonRegisterFormPhoneInput,null)
            .evaluate(function (logonSelectors) {
                    $(logonSelectors.logonRegisterFormPhoneInput).trigger('input');
                return document.querySelector(logonSelectors.logonRegisterFormPhoneInput).value
            },logonSelectors);
        console.log(phone);



        var errMsg = yield nightmare
            .wait(500)
            .click(logonSelectors.logonRegisterFormGraphCaptchaImg)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.noPhoneErrMsg);
    });

    it('21.刷新图形验证码 - 1.注册页面手机号内输入非手机号的数字 2.点图形验证码', function * () {
        var shows = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
            .checkNgShow(logonSelectors.logonRegisterFormVerificationCode);
        shows.should.be.true;

        var phone = yield nightmare
            .wait(500)
            .type(logonSelectors.logonRegisterFormPhoneInput,"")
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.wrongFormattedPhone)
            .evaluate(function (logonSelectors) {
                $(logonSelectors.logonRegisterFormPhoneInput).trigger('input');
                return document.querySelector(logonSelectors.logonRegisterFormPhoneInput).value
            },logonSelectors);
        console.log(phone);



        var errMsg = yield nightmare
            .wait(500)
            .click(logonSelectors.logonRegisterFormGraphCaptchaImg)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.wrongPhoneMsg);
    });

    it('22.刷新图形验证码 - 1.注册页面输入已注册过的手机号 2.点图形验证码', function * () {
        var shows = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)
            .checkNgShow(logonSelectors.logonRegisterFormVerificationCode);
        shows.should.be.true;

        var phone = yield nightmare
            .wait(500)
            .type(logonSelectors.logonRegisterFormPhoneInput,"")
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.registeredPhone)
            .evaluate(function (logonSelectors) {
                $(logonSelectors.logonRegisterFormPhoneInput).trigger('input');
                return document.querySelector(logonSelectors.logonRegisterFormPhoneInput).value
            },logonSelectors);
        console.log(phone);



        var errMsg = yield nightmare
            .wait(500)
            .click(logonSelectors.logonRegisterFormGraphCaptchaImg)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.registeredErrMsg);
    });

    it('23.未填写验证码 - 1.未填写验证码，点注册', function * () {
        var shows = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
            .wait(500)

        var errMsg = yield nightmare
            .wait(500)
            .click(logonSelectors.logonRegisterFormRegisterBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.needCode);
    });
    it('24.不需输入图形验证码 - 1.注册页面手机号内输入正确手机号 2.点击发送验证码', function * () {
        // TODO
        // 等pepe那边做测试的平台
    });
    it('25.需输入图形验证码 - 1.注册页面手机号内输入正确手机号 2.点击发送验证码 3.输入正确的图形验证码 4.点击发送验证码', function * () {
        // TODO
        // 没办法识别并输入正确的验证码
    });
    it('26.验证码发送60s后 - 1.注册页面手机号内输入正确手机号 2.点击发送验证码 3.发送验证码按钮开始倒计时 4.60s后重新点击发送验证码', function * () {
        // TODO
        // 没办法识别并输入正确的验证码
        // 没法验证手机是否收到了验证码
    });
    it('27.验证码发送10min后 - 1.注册页面手机号内输入正确手机号2.点击发送验证码 3.收到验证码后，10分钟后再输入（随意输一个） 4.点注册', function * () {
        // TODO
        // 没法过十分钟后验证
        // 没法验证手机是否收到了验证码
    });
    it('28.未发送过验证码 - 1.注册页面，未点击发送验证码 2.输入验证码 3.输入了密码 4.点注册', function * () {
        yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
            .wait(500)

        yield nightmare
            .type(logonSelectors.logonRegisterFormVerificationCodeInput,config.randomVerificationCode)
            .wait(500)

        var errMsg = yield nightmare
            .wait(500)
            .type(logonSelectors.logonRegisterFormPassword,config.randomPassword)
            .wait(500)
            .type(logonSelectors.logonRegisterFormConfirmPassword,config.randomPassword)
            .click(logonSelectors.logonRegisterFormRegisterBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.notFoundSMSVerificationCodeMsg);

    });

    it('29.未发送过验证码 - 1.注册页面手机号内输入正确手机号 2.点击发送验证码 3.输入错误验证码 4.输入了密码 5.点注册', function * () {
        // 需要重置数据库,为了不需要输入图形验证码
        yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
            .click(logonSelectors.logonRegisterFormGetCodeBtn)
            .wait(500)

        yield nightmare
            .type(logonSelectors.logonRegisterFormVerificationCodeInput,config.randomVerificationCode)
            .wait(500)

        var errMsg = yield nightmare
            .wait(500)
            .type(logonSelectors.logonRegisterFormPassword,config.randomPassword)
            .type(logonSelectors.logonRegisterFormConfirmPassword,config.randomPassword)
            .click(logonSelectors.logonRegisterFormRegisterBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.wrongSMSVerificationCodeMsg);

    });
    it('30.未填写密码 - 1.未填写密码，点注册', function * () {
        yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
            .wait(500)

        yield nightmare
            .type(logonSelectors.logonRegisterFormVerificationCodeInput,config.randomVerificationCode)
            .wait(500)

        var errMsg = yield nightmare
            .wait(500)
            .click(logonSelectors.logonRegisterFormRegisterBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.needInputPassword);

    });
    it('31.未填写确认密码 - 1.未填写确认密码，点注册', function * () {
        yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
            .wait(500)

        yield nightmare
            .type(logonSelectors.logonRegisterFormVerificationCodeInput,config.randomVerificationCode)
            .wait(500)

        var errMsg = yield nightmare
            .wait(500)
            .type(logonSelectors.logonRegisterFormPassword,config.randomPassword)
            .click(logonSelectors.logonRegisterFormRegisterBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.needInputConfirmPassword);

    });
    it('32.密码/确认密码不小6位 - 1.注册页面手机号内输入正确手机号 2.填写验证码 3.输入密码/确认密码“111”，点注册', function * () {
        yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
            .wait(500)

        yield nightmare
            .type(logonSelectors.logonRegisterFormVerificationCodeInput,config.randomVerificationCode)
            .wait(500)

        var errMsg = yield nightmare
            .wait(500)
            .type(logonSelectors.logonRegisterFormPassword,config.shortPassword)
            .type(logonSelectors.logonRegisterFormConfirmPassword,config.shortPassword)
            .click(logonSelectors.logonRegisterFormRegisterBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.passwordNeedGreaterSix);

    });

    it('33.密码和确认密码 - 1.注册页面手机号内输入正确手机号2.填写验证码验证码和密码 3.输入确认密码与密码不同，点注册', function * () {
        yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .type(logonSelectors.logonRegisterFormPhoneInput,config.phoneNumbers.notRegisterPhone)
            .wait(500)

        yield nightmare
            .type(logonSelectors.logonRegisterFormVerificationCodeInput,config.randomVerificationCode)
            .wait(500)

        var errMsg = yield nightmare
            .wait(500)
            .type(logonSelectors.logonRegisterFormPassword,config.randomPassword)
            .type(logonSelectors.logonRegisterFormConfirmPassword,config.randomPassword2)
            .click(logonSelectors.logonRegisterFormRegisterBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.twoPasswordNotConsistent);

    });
    it('34.用户协议 打开新新农人网站使用协议 - 1.点击新新农人网站使用协议', function * () {
        var shows = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .click('.policy a')
            .wait(500)
            .checkNgShow(logonSelectors.policy);
        shows.should.be.true;

    });

    it('35.用户协议 - 默认状态', function * () {
        var policyChecked = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.policyCheck).value
            },logonSelectors)
        policyChecked.should.to.eql("on");
    });

    it('36.用户协议 - 去掉勾选用户协议 1.其他信息均填写，将用户协议的勾选去掉，使其为未勾选状态 2.点击注册', function * () {
        var policyChecked = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .evaluate(function (logonSelectors) {
                $(logonSelectors.policyCheck).trigger('click');
                return document.querySelector(logonSelectors.policyCheck).value
            },logonSelectors)

        var errMsg = yield nightmare
            .wait(500)
            .click(logonSelectors.logonRegisterFormRegisterBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonRegisterFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.policyNotCheckedMsg);
    });

    it('37.页面入口 - 页面顶部导航进入 1.点击页面顶部导航登录按钮', function * () {
        var title = yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .evaluate(function (logonSelectors) {
                return document.querySelector("title").innerHTML
            },logonSelectors);
        expect(title).to.equal('登录');
    });
    it('38.登录页面进入 1.进入注册页面，点击登录按钮', function * () {
        var title = yield nightmare
            .goto(BaseUrl+'logon.html?type=register')
            .wait(logonSelectors.logonRegisterForm)
            .click(logonSelectors.logonRegisterFormLoginLinkBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector("title").innerHTML
            },logonSelectors);
        expect(title).to.equal('登录');
    });

    it('40.正确流程 - 个人资料已完善 : 已注册用户，已完善资料 1.点击页面顶部登录按钮，进入登录页面，输入已完善个人资料的账号及密码 2.点击登录' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)

        var welcomeText = yield nightmare
            .wait(500)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .wait(logonSelectors.banner)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.headerWelcomeLinkWithUserName).innerHTML
            },logonSelectors);

        var userCookie = yield nightmare.cookies.get('__user');

        userCookie.session.should.be.true
    });

    it('41.正确流程 - 个人资料已完善 : 已注册用户，已完善资料 1.登录页面，输入已完善个人资料的账号及密码 2.选中自动登录 3.点击登录' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)

        var welcomeText = yield nightmare
            .wait(500)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .evaluate(function (logonSelectors) {
                $(logonSelectors.keepLogin).trigger('click');
                return document.querySelector(logonSelectors.keepLogin).value
            },logonSelectors)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .wait(logonSelectors.banner);

        var userCookie = yield nightmare.cookies.get('__user');
        userCookie.session.should.be.false;
    });
    it('42.正确流程 - 个人资料未完善 : 已注册用户，未完善资料 1.登录页面，输入未完善个人资料的账号及密码 2.点击登录' , function * () {
        yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)

        var title = yield nightmare
            .wait(500)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .wait(logonSelectors.profileFillingForm)
            .evaluate(function (logonSelectors) {
                return document.querySelector("title").innerHTML
            },logonSelectors);
        expect(title).to.equal(logonWording.profileFillingTitle);

    });
    it('43.未输入手机号 - 1.登录页面，输入手机号 2.点击登录' , function * () {
        yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)

        var errMsg = yield nightmare
            .wait(500)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonLoginFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.loginFormNeedPhoneErrMsg);
    });

    it('44.手机号格式错误 - 1.登录页面，输入“111”手机号 2.点击登录' , function * () {
        yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)

        var errMsg = yield nightmare
            .wait(500)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.shortPhone)
            .type(logonSelectors.logonLoginFormPassword,config.randomPassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonLoginFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.loginFormWrongPhoneErrMsg);
    });
    it('45.手机号格式错误 - 1.登录页面，输入“11111111111”手机号 2.点击登录' , function * () {
        yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)

        var errMsg = yield nightmare
            .wait(500)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.longWrongPhone)
            .type(logonSelectors.logonLoginFormPassword,config.randomPassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonLoginFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.loginFormWrongPhoneErrMsg);
    });
    it('46.手机号未注册 - 1.登录页面，输入未注册的手机号 2.点击登录' , function * () {
        yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)

        var errMsg = yield nightmare
            .wait(500)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.notRegisterPhone)
            .type(logonSelectors.logonLoginFormPassword,config.randomPassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonLoginFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.loginFormNotRegisteredPhoneErrMsg);
    });
    it('47.未输入密码 - 1.登录页面，输入正确11位手机号 2.点击登录' , function * () {
        yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)

        var errMsg = yield nightmare
            .wait(500)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonLoginFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.loginFormNoPasswordErrMsg);
    });
    it('48.密码小于6位 - 1.登录页面，输入正确11位手机号、密码“111” ' , function * () {
        yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)

        var errMsg = yield nightmare
            .wait(500)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.shortPassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonLoginFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.loginFormWrongPasswordErrMsg);
        // 这里本来有一个密码是否小于六位的校验,但是因为某个账户的密码是小于六位的所以把这个去掉了
    });

    it('49.密码错误 - 1.登录页面，输入正确11位手机号、密码“111” ' , function * () {
        yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)

        var errMsg = yield nightmare
            .wait(500)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.randomPassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.logonLoginFormErrMessage).innerHTML
            },logonSelectors)

        expect(errMsg).to.equal(logonWording.loginFormWrongPasswordErrMsg);
    });


    it('50.忘记密码 - 正确流程 1.在登录页面点击忘记密码 2.打开找回密码页面 3.输入手机号 4.点击发送验证码' , function * () {
        var forgetPasswordShow = yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)
            .click(logonSelectors.forgetPassword)
            .checkNgShow(logonSelectors.forgetPasswordPop)
        forgetPasswordShow.should.be.true;

        yield nightmare
            .type(logonSelectors.forgetPasswordPopPhone,config.phoneNumbers.registeredPhone);

        yield nightmare
            .click(logonSelectors.forgetPasswordPopSendSMSCode);
        // TODO
        //无法验证手机时候收到验证码

    });

    it('52.手机号 - 正确流程 未填写手机号 1.未填写手机号，点确认' , function * () {
        var forgetPasswordShow = yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)
            .click(logonSelectors.forgetPassword)
            .checkNgShow(logonSelectors.forgetPasswordPop)
        forgetPasswordShow.should.be.true;

        yield nightmare
            .click(logonSelectors.forgetPasswordPopCommitBtn);

        var errMsg = yield nightmare
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.forgetPasswordPopErrMsg).innerHTML
            },logonSelectors)
        expect(errMsg).to.equal(logonWording.resetPasswordPopNeedPhoneErrMsg);
    });

    it('53.手机号 - 手机号未注册 1.忘记密码页面，输入未注册过的手机号 2.点击确认' , function * () {
        var forgetPasswordShow = yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)
            .click(logonSelectors.forgetPassword)
            .checkNgShow(logonSelectors.forgetPasswordPop)
        forgetPasswordShow.should.be.true;

        yield nightmare
            .type(logonSelectors.forgetPasswordPopPhone,config.phoneNumbers.notRegisterPhone)
            .type(logonSelectors.forgetPasswordPopSMSCode,config.randomVerificationCode)
            .type(logonSelectors.forgetPasswordPopPassword,config.randomPassword)
            .type(logonSelectors.forgetPasswordPopConfirmPassword,config.randomPassword)


        yield nightmare
            .wait(500)
            .click(logonSelectors.forgetPasswordPopCommitBtn);

        var errMsg = yield nightmare
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.forgetPasswordPopErrMsg).innerHTML
            },logonSelectors)
        expect(errMsg).to.equal(logonWording.resetPasswordPopNotRegisteredPhoneErrMsg);
    });

    it('54.手机号 - 手机号格式错误 1.忘记密码页面，手机号内输入“111” 2.点击发送验证码' , function * () {
        var forgetPasswordShow = yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)
            .click(logonSelectors.forgetPassword)
            .checkNgShow(logonSelectors.forgetPasswordPop)
        forgetPasswordShow.should.be.true;

        yield nightmare
            .type(logonSelectors.forgetPasswordPopPhone,config.phoneNumbers.shortPhone)


        yield nightmare
            .wait(500)
            .click(logonSelectors.forgetPasswordPopCommitBtn);

        var errMsg = yield nightmare
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.forgetPasswordPopErrMsg).innerHTML
            },logonSelectors)
        expect(errMsg).to.equal(logonWording.resetPasswordPopWrongPhoneErrMsg);
    });

    it('55.手机号 - 手机号格式错误 1.忘记密码页面，手机号内输入“11111111111” 2.点击发送验证码' , function * () {
        var forgetPasswordShow = yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)
            .click(logonSelectors.forgetPassword)
            .checkNgShow(logonSelectors.forgetPasswordPop)
        forgetPasswordShow.should.be.true;

        yield nightmare
            .type(logonSelectors.forgetPasswordPopPhone,config.phoneNumbers.longWrongPhone)
            .type(logonSelectors.forgetPasswordPopSMSCode,config.randomVerificationCode)
            .type(logonSelectors.forgetPasswordPopPassword,config.randomPassword)
            .type(logonSelectors.forgetPasswordPopConfirmPassword,config.randomPassword)

        yield nightmare
            .wait(500)
            .click(logonSelectors.forgetPasswordPopCommitBtn);

        var errMsg = yield nightmare
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.forgetPasswordPopErrMsg).innerHTML
            },logonSelectors)
        expect(errMsg).to.equal(logonWording.resetPasswordPopWrongPhoneErrMsg);
    });
    it('56. 忘记密码 - 图形验证码  需输入图形验证码情况 代理IP' , function * () {
        // TODO
    });
    it('57. 忘记密码 - 图形验证码  需输入图形验证码情况 真实IP一天内第二次发送验证码' , function * () {
        // TODO
    })
    it('58. 忘记密码 - 图形验证码  正确流程 ' , function * () {
        // TODO
    });
    it('59. 忘记密码 - 图形验证码  未输入图形验证码，点发送验证码' , function * () {
        // TODO
    });
    it('60. 忘记密码 - 图形验证码  未输入图形验证码，点确认' , function * () {
        // TODO
    });
    it('61. 忘记密码 - 图形验证码  图形验证码输入错误，点发送验证码' , function * () {
        // TODO
    });
    it('62. 忘记密码 - 图形验证码  刷新图形验证码 1.页面出现图形验证码输入框 2.将鼠标放置在图形验证码上' , function * () {
        // TODO
    });
    it('63. 忘记密码 - 图形验证码  刷新图形验证码 输入正确手机号' , function * () {
        // TODO
    });
    it('64. 忘记密码 - 图形验证码  刷新图形验证码 所有刷新次数超过限制' , function * () {
        // TODO
    })
    it('65. 忘记密码 - 图形验证码  刷新图形验证码 单个IP刷新次数超过限制' , function * () {
        // TODO
    })
    it('66. 忘记密码 - 图形验证码  刷新图形验证码 1.未填写手机号，点图形验证码' , function * () {
        // TODO
    })
    it('67. 忘记密码 - 图形验证码  刷新图形验证码 1.页面手机号内输入非手机号的数字 2.点图形验证码' , function * () {
        // TODO
    })
    it('68. 忘记密码 - 图形验证码  刷新图形验证码 手机号未注册 1.页面输入未注册过的手机号 2.点图形验证码' , function * () {
        // TODO
    })

    it('68. 忘记密码 - 图形验证码  刷新图形验证码 手机号未注册 1.页面输入未注册过的手机号 2.点图形验证码' , function * () {
        // TODO
    })
    it('69. 验证码 - 未填写验证码 1.未填写验证码，点确认' , function * () {
        var forgetPasswordShow = yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)
            .click(logonSelectors.forgetPassword)
            .checkNgShow(logonSelectors.forgetPasswordPop)
        forgetPasswordShow.should.be.true;

        yield nightmare
            .type(logonSelectors.forgetPasswordPopPhone,config.phoneNumbers.longWrongPhone)

        yield nightmare
            .wait(500)
            .click(logonSelectors.forgetPasswordPopCommitBtn);

        var errMsg = yield nightmare
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.forgetPasswordPopErrMsg).innerHTML
            },logonSelectors)
        expect(errMsg).to.equal(logonWording.resetPasswordPopNoSMSCodeErrMsg);
    })
    it('70. 验证码 - 验证码发送成功  刷新图形验证码 不需要输入图形验证码 1.忘记密码页面手机号内输入正确手机号 2.点击发送验证码' , function * () {
        // TODO
    })
    it('71. 验证码 - 验证码发送成功  刷新图形验证码 需要输入图形验证码 1.忘记密码页面手机号内输入正确手机号 2.点击发送验证码 3.输入正确的图形验证码 4.点击发送验证码' , function * () {
        // TODO
    })
    it('72. 验证码 - 验证码发送60s后  1.忘记密码页面手机号内输入正确手机号 2.点击发送验证码 3.发送验证码按钮开始倒计时 4.60s后重新点击发送验证码' , function * () {
        // TODO
    })
    it('73. 验证码 - 验证码发送10min后  1.忘记密码页面输入正确手机号 2.点击发送验证码 3.收到验证码后，10分钟后再输入验证码、密码、确认密码，点确认' , function * () {
        // TODO
    })
    it('74. 验证码 - 未发送过验证码  1.忘记密码页面，未点击发送验证码 2.输入验证码，密码、确认密码123456 3.点注册' , function * () {
        var forgetPasswordShow = yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)
            .click(logonSelectors.forgetPassword)
            .checkNgShow(logonSelectors.forgetPasswordPop)
        forgetPasswordShow.should.be.true;

        yield nightmare
            .type(logonSelectors.forgetPasswordPopPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.forgetPasswordPopSMSCode,config.randomVerificationCode)
            .type(logonSelectors.forgetPasswordPopPassword,config.randomPassword)
            .type(logonSelectors.forgetPasswordPopConfirmPassword,config.randomPassword)


        yield nightmare
            .wait(500)
            .click(logonSelectors.forgetPasswordPopCommitBtn);

        var errMsg = yield nightmare
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.forgetPasswordPopErrMsg).innerHTML
            },logonSelectors)
        expect(errMsg).to.equal(logonWording.resetPasswordPopSMSCodeExpireErrMsg);
        //这里有一个问题就是  没法把账号初始化成没发过验证码的状态
    })
    it('75. 验证码 - 验证码输入错误  1.点击忘记密码页面输入正确手机号 2.点击发送验证码 3.输入错误验证码，密码和确认密码123456，点确认' , function * () {
        // TODO

        // 无法确定是否出现 图形验证码
    })

    it('76. 密码 - 未填写密码  1.未填写密码，点确认' , function * () {
        var forgetPasswordShow = yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)
            .click(logonSelectors.forgetPassword)
            .checkNgShow(logonSelectors.forgetPasswordPop)
        forgetPasswordShow.should.be.true;

        yield nightmare
            .type(logonSelectors.forgetPasswordPopPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.forgetPasswordPopSMSCode,config.randomVerificationCode)


        yield nightmare
            .wait(500)
            .click(logonSelectors.forgetPasswordPopCommitBtn);

        var errMsg = yield nightmare
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.forgetPasswordPopErrMsg).innerHTML
            },logonSelectors)
        expect(errMsg).to.equal(logonWording.resetPasswordPopNoPassword);
    });

    it('77. 密码 - 未填写确认密码  1.未填写确认密码，点确认' , function * () {
        var forgetPasswordShow = yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)
            .click(logonSelectors.forgetPassword)
            .checkNgShow(logonSelectors.forgetPasswordPop)
        forgetPasswordShow.should.be.true;

        yield nightmare
            .type(logonSelectors.forgetPasswordPopPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.forgetPasswordPopSMSCode,config.randomVerificationCode)
            .type(logonSelectors.forgetPasswordPopPassword,config.randomPassword)

        yield nightmare
            .wait(500)
            .click(logonSelectors.forgetPasswordPopCommitBtn);

        var errMsg = yield nightmare
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.forgetPasswordPopErrMsg).innerHTML
            },logonSelectors)
        expect(errMsg).to.equal(logonWording.resetPasswordPopNoConfirmPassword);
    })

    it('78. 密码 - 密码小于6位  1.点击忘记密码页面输入正确手机号 2.填写验证码 3.输入密码“111”，点确认' , function * () {
        var forgetPasswordShow = yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)
            .click(logonSelectors.forgetPassword)
            .checkNgShow(logonSelectors.forgetPasswordPop)
        forgetPasswordShow.should.be.true;

        yield nightmare
            .type(logonSelectors.forgetPasswordPopPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.forgetPasswordPopSMSCode,config.randomVerificationCode)
            .type(logonSelectors.forgetPasswordPopPassword,config.shortPassword)
            .type(logonSelectors.forgetPasswordPopConfirmPassword,config.shortPassword)

        yield nightmare
            .wait(500)
            .click(logonSelectors.forgetPasswordPopCommitBtn);

        var errMsg = yield nightmare
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.forgetPasswordPopErrMsg).innerHTML
            },logonSelectors)
        expect(errMsg).to.equal(logonWording.resetPasswordPopPasswordNeedGreaterSix);
    })

    it('79. 密码 - 密码和确认密码  1.点击忘记密码页面输入正确手机号 2.填写验证码和密码 3.输入确认密码与密码不同，点确认' , function * () {
        var forgetPasswordShow = yield nightmare
            .goto(BaseUrl)
            .click(logonSelectors.headerLogin)
            .wait(logonSelectors.logonLoginForm)
            .click(logonSelectors.forgetPassword)
            .checkNgShow(logonSelectors.forgetPasswordPop)
        forgetPasswordShow.should.be.true;

        yield nightmare
            .type(logonSelectors.forgetPasswordPopPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.forgetPasswordPopSMSCode,config.randomVerificationCode)
            .type(logonSelectors.forgetPasswordPopPassword,config.randomPassword)
            .type(logonSelectors.forgetPasswordPopConfirmPassword,config.randomPassword2)

        yield nightmare
            .wait(500)
            .click(logonSelectors.forgetPasswordPopCommitBtn);

        var errMsg = yield nightmare
            .wait(500)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.forgetPasswordPopErrMsg).innerHTML
            },logonSelectors)
        expect(errMsg).to.equal(logonWording.twoPasswordNotConsistent);
    });

    it('80. 我的信息 - 昵称-展示&修改  1.进入我的新农人页面 2.用户已有昵称' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .wait(logonSelectors.banner)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var username = yield nightmare
            .wait(logonSelectors.myxxnrUserInfoBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrNickname).innerHTML
            },logonSelectors)
        expect(username).to.have.string(config.phoneNumbers.registeredUserName);
    });

    it('81. 我的信息 - 昵称-展示&修改  1.进入我的新农人页面 2.用户没有昵称 展示“添加昵称”' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var addNicknameLink = yield nightmare
            .wait(logonSelectors.myxxnrProfileNotFilledBox)
            .checkNgShow(logonSelectors.myxxnrProfileNotFilledBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileNicknameAddinglink).innerHTML
            },logonSelectors)
        expect(addNicknameLink).to.equal(logonWording.myxxnrNicknameAddingText);
    });

    it('82. 我的信息 - 昵称-展示&修改  1.进入我的新农人页面 2.用户没有昵称 3.点击“添加昵称” 4.展示昵称的文本框变为输入框，输入“新新农人测试” 5.点击提交' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var addNicknameLink = yield nightmare
            .wait(logonSelectors.myxxnrProfileNotFilledBox)
            .checkNgShow(logonSelectors.myxxnrProfileNotFilledBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileNicknameAddinglink).innerHTML
            },logonSelectors)
        expect(addNicknameLink).to.equal(logonWording.myxxnrNicknameAddingText);

        yield nightmare
            .click(logonSelectors.myxxnrProfileNicknameAddinglink)

        yield nightmare
            .wait(logonSelectors.myxxnrProfileEditNicknameInput)
            .evaluate(function (logonSelectors,config) {
                $(logonSelectors.myxxnrProfileEditNicknameInput).val(config.myxxnrTestNickname);
                $(logonSelectors.myxxnrProfileEditNicknameInput).trigger('input');
            },logonSelectors,config)
            .wait(2000);
        // TODO
        // 现在有一个问题是 一旦修改了昵称就很难恢复初始状态

    });

    it('83. 我的信息 - 昵称-展示&修改  修改昵称 1.进入我的新农人页面 2.鼠标移至昵称一行，出现修改按钮 3.展示昵称的文本框变为输入框，默认展示原昵称，清空输入框输入“新新农人昵称” 4.点击提交' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        yield nightmare
            .wait(logonSelectors.myxxnrUserInfoBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrNickname).innerHTML
            },logonSelectors)
            .click(logonSelectors.myxxnrNicknameHoverEditBtn)
            .wait(2000);

        var oldNickname =  yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileEditNicknameInput).value
            },logonSelectors)
        expect(oldNickname).to.equal(config.phoneNumbers.registeredUserName);

        yield nightmare
            .wait(logonSelectors.myxxnrProfileEditNicknameInput)
            .evaluate(function (logonSelectors,config) {
                $(logonSelectors.myxxnrProfileEditNicknameInput).val(config.myxxnrTestNickname);
                $(logonSelectors.myxxnrProfileEditNicknameInput).trigger('input');
            },logonSelectors,config)
            .evaluate(function (logonSelectors) {
                $(logonSelectors.myxxnrProfileEditNicknameCommitBtn).trigger('mousedown');
            },logonSelectors)
            .wait(500)

        var newNickname =  yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileEditNicknameInput).value
            },logonSelectors)
        expect(newNickname).to.equal(config.myxxnrTestNickname);
        // TODO
        // 现在有一个问题是 一旦修改了昵称就很难恢复初始状态

    });

    it('84. 我的信息 - 昵称-展示&修改  昵称超过长度 1.进入我的新农人页面 2.添加/修改昵称 3.填写昵称“新新农人长昵称”后点击提交' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        yield nightmare
            .wait(logonSelectors.myxxnrUserInfoBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrNickname).innerHTML
            },logonSelectors)
            .click(logonSelectors.myxxnrNicknameHoverEditBtn)
            .wait(2000);

        var oldNickname =  yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileEditNicknameInput).value
            },logonSelectors)
        expect(oldNickname).to.equal(config.phoneNumbers.registeredUserName);

        yield nightmare
            .wait(logonSelectors.myxxnrProfileEditNicknameInput)
            .evaluate(function (logonSelectors,config) {
                $(logonSelectors.myxxnrProfileEditNicknameInput).val(config.myxxnrTestLongNickname);
                $(logonSelectors.myxxnrProfileEditNicknameInput).trigger('input');
            },logonSelectors,config)
            .evaluate(function (logonSelectors) {
                $(logonSelectors.myxxnrProfileEditNicknameCommitBtn).trigger('mousedown');
            },logonSelectors)

        var flashMsg = yield nightmare
            .wait(logonSelectors.flashMessage)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.flashMessage).innerHTML;
            },logonSelectors);

        expect(flashMsg).to.equal(logonWording.myxxnrNicknameTooLongFlashText);

    });

    it('85. 头像-展示&修改 - 展示头像  昵称超过长度 1.进入我的新农人页面 2.用户已有头像' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var userAvatarSrc= yield nightmare
            .wait(logonSelectors.myxxnrUserInfoBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileUserAvatar).innerHTML
            },logonSelectors)
        expect(userAvatarSrc).to.not.have.string(config.myxxnrDefaultAvatar);

    });

    it('86. 头像-展示&修改 - 展示头像  昵称超过长度 1.进入我的新农人页面 2.用户已有头像 展示网站的默认头像' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var userAvatarSrc= yield nightmare
            .wait(logonSelectors.myxxnrUserInfoBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileUserAvatar).src
            },logonSelectors)
        expect(userAvatarSrc).to.have.string(config.myxxnrDefaultAvatar);

    });

    it('87. 头像-展示&修改 - 进入修改头像  昵称超过长度 1.进入我的新农人页面 2.点击头像展示' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var userAvatarSrc= yield nightmare
            .wait(logonSelectors.myxxnrUserInfoBox)
            .wait(logonSelectors.myxxnrProfileUserAvatar)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileUserAvatar).src
            },logonSelectors)

        yield nightmare
            .click(logonSelectors.myxxnrProfileUserAvatar)

        var oldAvatarSrc = yield nightmare
            .wait(logonSelectors.myxxnrProfileOldAvatar)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileOldAvatar).src
            },logonSelectors)

        expect(userAvatarSrc).to.equal(oldAvatarSrc);

    });

    it('88. 头像-展示&修改 - 上传图片 1.在修改头像页面点击上传图片' , function * () {

        // TODO
        // 现在不能上传图片

    });

    it('89. 头像-展示&修改 - 关闭修改头像页面 1.在修改头像页面点击关闭按钮' , function * () {

        // TODO
        // 现在不能上传图片

    });

    it('90. 头像-展示&修改 - 确认并上传个人头像 1.在修改头像页面 2.点击“确认并上传个人头像”按钮' , function * () {

        // TODO
        // 现在不能上传图片

    });

    it('91. 头像-展示&修改 - 确认并上传个人头像 1.在修改头像页面 2.上传图片 3.点击“确认并上传个人头像”按钮' , function * () {

        // TODO
        // 现在不能上传图片

    });

    it('92. 个人资料展示 - 展示个人资料 用户资料完整 1.进入我的新农人页面 2.用户已填过个人资料 展示用户的姓名、性别、所在地区、用户类型' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var username = yield nightmare
            .wait(logonSelectors.myxxnrUserInfoBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrNickname).innerHTML
            },logonSelectors)
        expect(username).to.have.string(config.phoneNumbers.registeredUserName);

        var name = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrName).innerHTML
            },logonSelectors)
        expect(name).to.have.string(config.phoneNumbers.registeredNameText);

        var address = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrAddress).innerHTML
            },logonSelectors)
        expect(address).to.have.string(config.phoneNumbers.registeredAddress);
    });

    it('93. 个人资料展示 - 未完善个人资料 用户资料不完整 1.进入我的新农人页面 2.用户未完善个人资料' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var getPointText = yield nightmare
            .wait(logonSelectors.myxxnrProfileNotFilledBox)
            .checkNgShow(logonSelectors.myxxnrProfileNotFilledBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileFillProfileGetPoint).innerHTML
            },logonSelectors)
        expect(getPointText).to.equal(logonWording.myxxnrNicknameFiillProfileGetPoint);
    });

    it('94. 个人资料展示 - 未完善个人资料 用户资料不完整 1.进入我的新农人页面 2.用户未完善个人资料 3.点击“去完善资料领积分”' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var getPointText = yield nightmare
            .wait(logonSelectors.myxxnrProfileNotFilledBox)
            .checkNgShow(logonSelectors.myxxnrProfileNotFilledBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileFillProfileGetPoint).innerHTML
            },logonSelectors)
        expect(getPointText).to.equal(logonWording.myxxnrNicknameFiillProfileGetPoint);

        var NoFilledTitle = yield nightmare
            .click(logonSelectors.myxxnrProfileFillProfileGetPoint)
            .wait(logonSelectors.fillProfileBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.fillProfileBoxNoFilledTitle).innerHTML
            },logonSelectors)
        expect(NoFilledTitle).to.have.string(logonWording.fillProfileNotFilledTitle)

    });

    it('95. 认证徽章 - 用户类型为县级经销商且已认证 1.进入我的新农人页面  1.展示用户类型“县级经销商”，且展示有亮起的徽章 2.徽章可点击跳转至服务站认证页面' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredRSCVerifiedPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredRSCVerifiedPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var type = yield nightmare
            .wait(logonSelectors.myxxnrUserInfoBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrType).innerHTML
            },logonSelectors)
        expect(type).to.have.string(config.phoneNumbers.registeredRSCVerifiedType);

        var hasHuizhang = yield nightmare
            .wait(logonSelectors.myxxnrHuizhang)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrHuizhang).className
            },logonSelectors)
        expect(logonSelectors.myxxnrHuizhang).to.have.string(hasHuizhang);
    });

    it('96. 认证徽章 - 用户类型为新农经纪人且已认证 1.进入我的新农人页面   展示用户类型“新农经纪人”，且展示有亮起的徽章' , function * () {
        // TODO
        // 需要pepe测试框架的支持
    });

    it('97. 认证徽章 - 用户类型为县级经销商且未申请认证 1.进入我的新农人页面   1.展示用户类型“县级经销商”，展示按钮“申请认证” 2.点击“申请认证”跳转至服务站认证页面' , function * () {
        // TODO
        // 需要pepe测试框架的支持
    });

    it('98. 认证徽章 - 用户类型为县级经销商且已申请未认证 1.进入我的新农人页面  1.展示用户类型“县级经销商”，且展示有灰色的徽章 2.点击灰色徽章，跳转至服务站认证页面' , function * () {
        // TODO
        // 需要pepe测试框架的支持
    });

    it('99. 认证徽章 - 用户类型为新农经纪人且未认证 1.进入我的新农人页面   展示用户类型“新农经纪人”，无徽章' , function * () {
        // TODO
        // 需要pepe测试框架的支持
    });

    it('100. 认证徽章 - 用户类型为普通用户 1.进入我的新农人页面  展示用户类型“普通用户”，无徽章' , function * () {
        // TODO
        // 需要pepe测试框架的支持
    });

    it('101. 修改个人资料入口 - 资料已完整 用户资料完整 1.进入我的新农人页面 2.鼠标移至展示资料模块，出现修改资料按钮 3.点击修改资料 Result: 1.跳转至修改个人资料页 2.所有字段展示原资料信息' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var username = yield nightmare
            .wait(logonSelectors.myxxnrUserInfoBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrNickname).innerHTML
            },logonSelectors)
        expect(username).to.have.string(config.phoneNumbers.registeredUserName);

        var name = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrName).innerHTML
            },logonSelectors)
        expect(name).to.have.string(config.phoneNumbers.registeredNameText);

        var address = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrAddress).innerHTML
            },logonSelectors)
        expect(address).to.have.string(config.phoneNumbers.registeredAddress);

        var type = yield nightmare
            .wait(logonSelectors.myxxnrUserInfoBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrType).innerHTML
            },logonSelectors)
        expect(type).to.have.string(config.phoneNumbers.registeredType);

        yield nightmare
            .click(logonSelectors.myxxnrModifyInfoBtn)
            .wait(logonSelectors.fillProfileBox)

        var editingName = yield nightmare
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileName).val()
            },logonSelectors);
        expect(name).to.have.string(editingName);

        var editingProvince = yield nightmare
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileProvince).text()
            },logonSelectors);
        expect(address).to.have.string(editingProvince);

        var editingProvince = yield nightmare
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileProvince).text()
            },logonSelectors);
        expect(address).to.have.string(editingProvince);

        var editingCity = yield nightmare
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileCity).text()
            },logonSelectors);
        expect(address).to.have.string(editingCity);

        var editingCounty = yield nightmare
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileCounty).text()
            },logonSelectors);
        expect(address).to.have.string(editingCounty);

        var editingTown = yield nightmare
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileTown).text()
            },logonSelectors);
        expect(address).to.have.string(editingTown);

        var editingType = yield nightmare
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileType).text()
            },logonSelectors);
        expect(type).to.have.string(editingType);
    });

    it('102. 完善个人资料 - 正确流程 1.完善资料页面 2.填写完整资料，点击保存' , function * () {
        // TODO
        // 需要pepe测试框架的支持
    });

    it('103. 完善个人资料 - 姓名 1.完善资料页面 2.填写姓名“新新农人长姓名”，点击保存' , function * () {

        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)


        yield nightmare
            .click(logonSelectors.myxxnrModifyInfoBtn)
            .wait(logonSelectors.fillProfileBox)

        yield nightmare
            .evaluate(function (logonSelectors,config) {
                $(logonSelectors.fillProfileName).val(config.profileTestLongName);
                $(logonSelectors.fillProfileName).trigger('input');
            },logonSelectors,config)
            .wait(500);

        var validateMsg = yield nightmare
            .checkNgShow(logonSelectors.fillProfileNameValidateError)
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileNameValidateError).text();
            },logonSelectors,config)
        expect(validateMsg).to.have.string(config.profileNameValidatorMsg)
    });

    it('104. 完善个人资料 - 姓名 1.完善资料页面 2.姓名未填写' , function * () {

        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)


        yield nightmare
            .click(logonSelectors.myxxnrModifyInfoBtn)
            .wait(logonSelectors.fillProfileBox)

        yield nightmare
            .evaluate(function (logonSelectors,config) {
                $(logonSelectors.fillProfileName).val("");
                $(logonSelectors.fillProfileName).trigger('input');
            },logonSelectors,config)
            .wait(500)

        var buttonStatus = yield nightmare
            .wait(logonSelectors.fillProfileCommitBtn)
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileCommitBtn).attr('class');
            },logonSelectors)
        console.log(buttonStatus);
        expect(buttonStatus).to.have.string(config.profileNameBtnInvalidClassName);
    });

    it('105. 性别 - 未完善个人资料 1.完善资料页面 性别默认选中男' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var defaultSex = yield nightmare
            .click(logonSelectors.myxxnrProfileFillProfileGetPoint)
            .wait(logonSelectors.fillProfileBox)
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileSex).val()
            },logonSelectors)
        expect(defaultSex).to.equal(config.profileSexDefaultValue);

    });
    it('106. 性别 - 未完善个人资料 1.完善资料页面 2.点击选择女' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var female = yield nightmare
            .click(logonSelectors.myxxnrProfileFillProfileGetPoint)
            .wait(logonSelectors.fillProfileBox)
            .click(logonSelectors.fillProfileFemale)
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileSex).val()
            },logonSelectors)
        expect(female).to.equal(config.profileSexFemaleValue);

    });

    it('107. 地区 - 1.完善资料页面 2.选择地区 展示所选地区，4级联动' , function * () {
        // TODO
        // 四级联动暂时没有办法
    });

    it('108. 地区 - 1.完善资料页面 2.选择河南省、济源市、任意乡镇 3.填写完整其他项目，点击提交' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)


        yield nightmare
            .click(logonSelectors.myxxnrProfileFillProfileGetPoint)
            .wait(logonSelectors.fillProfileBox)
            .select(logonSelectors.fillProfileAddressProvinceSelect,1)
            .wait(1500)
            .select(logonSelectors.fillProfileAddressCitySelect,8)
            .wait(1500)
            .select(logonSelectors.fillProfileAddressTownSelect,6)
            .wait(5000)
        // TODO
        // 需要pepe数据库
    });

    it('109. 地区 - 1.完善资料页面 2.填写姓名，不选择所在地区 3.点击提交' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        yield nightmare
            .click(logonSelectors.myxxnrProfileFillProfileGetPoint)
            .wait(logonSelectors.fillProfileBox)
            .evaluate(function (logonSelectors,config) {
                $(logonSelectors.fillProfileName).val(config.myxxnrTestNickname)
            },logonSelectors,config)
            .wait(5000)

        yield nightmare
            .click(logonSelectors.fillProfileCommitBtn)

        // 按钮无效状态
    });

    it('110. 用户类型 - 1.完善资料页面 2.选择用户类型 默认选中普通用户' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var defaultSex = yield nightmare
            .click(logonSelectors.myxxnrProfileFillProfileGetPoint)
            .wait(logonSelectors.fillProfileBox)
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileType).text()
            },logonSelectors)
        expect(defaultSex).to.equal(config.profileTypeDefaultText);

    });

    it('112. 用户类型 - 1.完善资料页面 2.选择用户类型 默认选中普通用户' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var defaultSex = yield nightmare
            .click(logonSelectors.myxxnrProfileFillProfileGetPoint)
            .wait(logonSelectors.fillProfileBox)
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileType).text()
            },logonSelectors)
        expect(defaultSex).to.equal(config.profileTypeDefaultText);

    });

    it('111. 用户类型 - 1.完善资料页面 2.选择用户类型 3.填写完整其他项目，点击提交' , function * () {
        // TODO
        // pepe数据支持

    });

    it('112. 跳过 - 1.完善资料页面 2.点击“不填了，先去首页看看”' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var indexTitle = yield nightmare
            .click(logonSelectors.myxxnrProfileFillProfileGetPoint)
            .wait(logonSelectors.fillProfileBox)
            .click(logonSelectors.fillProfileSkipFillProfile)
            .wait(logonSelectors.banner)
            .evaluate(function (logonSelectors) {
                return document.querySelector('title').innerHTML
            },logonSelectors);
        expect(indexTitle).to.equal(logonWording.indexTitle)
    });

    it('113. 正确流程 - 1.修改资料页面 2.修改资料，点击保存 ' , function * () {
        // TODO
        // 等待pepe数据
    });

    it('114. 未填写完整判断 - 1.修改资料页面 2.姓名删空 3.点击提交' , function * () {

        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)


        yield nightmare
            .click(logonSelectors.myxxnrModifyInfoBtn)
            .wait(logonSelectors.fillProfileBox)

        yield nightmare
            .evaluate(function (logonSelectors,config) {
                $(logonSelectors.fillProfileName).val("");
                $(logonSelectors.fillProfileName).trigger('input');
            },logonSelectors,config)
            .wait(500)

        var buttonStatus = yield nightmare
            .wait(logonSelectors.fillProfileCommitBtn)
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileCommitBtn).attr('class');
            },logonSelectors)
        expect(buttonStatus).to.have.string(config.profileNameBtnInvalidClassName);

    });

    it('115. 修改个人资料 - 姓名 1.修改资料页面 2.填写姓名超过6个汉字或12个英文字符，点击保存 ”，点击保存' , function * () {

        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)


        yield nightmare
            .click(logonSelectors.myxxnrModifyInfoBtn)
            .wait(logonSelectors.fillProfileBox)

        yield nightmare
            .evaluate(function (logonSelectors,config) {
                $(logonSelectors.fillProfileName).val(config.profileTestLongName);
                $(logonSelectors.fillProfileName).trigger('input');
            },logonSelectors,config)
            .wait(500);

        var validateMsg = yield nightmare
            .checkNgShow(logonSelectors.fillProfileNameValidateError)
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileNameValidateError).text();
            },logonSelectors,config)
        expect(validateMsg).to.have.string(config.profileNameValidatorMsg)
    });

    it('116. 姓名 - 1.修改资料页面 2.姓名未填写' , function * () {

        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)


        yield nightmare
            .click(logonSelectors.myxxnrModifyInfoBtn)
            .wait(logonSelectors.fillProfileBox)

        yield nightmare
            .evaluate(function (logonSelectors,config) {
                $(logonSelectors.fillProfileName).val("");
                $(logonSelectors.fillProfileName).trigger('input');
            },logonSelectors,config)
            .wait(500)

        var buttonStatus = yield nightmare
            .wait(logonSelectors.fillProfileCommitBtn)
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileCommitBtn).attr('class');
            },logonSelectors)
        expect(buttonStatus).to.have.string(config.profileNameBtnInvalidClassName);

    });


    it('117. 性别 - 1.修改资料页面 2.性别选择女' , function * () {

        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var sexClass = yield nightmare
            .wait(logonSelectors.myxxnrUserInfoBox)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrSex).className
            },logonSelectors)

        yield nightmare
            .click(logonSelectors.myxxnrModifyInfoBtn)
            .wait(logonSelectors.fillProfileBox)


        var editingSex = yield nightmare
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileSex).val()
            },logonSelectors)
        expect(sexClass).to.have.string(editingSex);

    });

    it('118. 性别 - 1.修改资料页面 2.性别选择女' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var female = yield nightmare
            .click(logonSelectors.myxxnrProfileFillProfileGetPoint)
            .wait(logonSelectors.fillProfileBox)
            .click(logonSelectors.fillProfileFemale)
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileSex).val()
            },logonSelectors)
        expect(female).to.equal(config.profileSexFemaleValue);
    });

    it('119. 性别 - 1.修改资料页面 2.性别选择男' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var male = yield nightmare
            .click(logonSelectors.myxxnrProfileFillProfileGetPoint)
            .wait(logonSelectors.fillProfileBox)
            .click(logonSelectors.fillProfileFemale)
            .click(logonSelectors.fillProfileMale)
            .evaluate(function (logonSelectors) {
                return $(logonSelectors.fillProfileSex).val()
            },logonSelectors)
        expect(male).to.equal(config.profileSexMaleValue);
    });

    it('120. 地区 - 1.修改资料页面 2.选择地区 展示所选地区，4级联动' , function * () {
        // TODO
        // 四级联动
    });

    it('121. 地区 - 1.修改资料页面 2.选择河南省、济源市、任意乡镇 3.填写完整其他项目，点击提交' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var address = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrAddress).innerHTML
            },logonSelectors)
        expect(address).to.have.string(config.phoneNumbers.registeredAddress);


        yield nightmare
            .click(logonSelectors.myxxnrModifyInfoBtn)
            .wait(logonSelectors.fillProfileBox)
            .select(logonSelectors.fillProfileAddressProvinceSelect,0)
            .wait(1500)
            .select(logonSelectors.fillProfileAddressCitySelect,8)
            .wait(1500)
            .select(logonSelectors.fillProfileAddressTownSelect,6)
            .wait(5000)
        // TODO
        // 需要pepe数据库
    });

    it('122. 用户类型 - 1.修改资料页面 2.选择用户类型“普通用户” 3.填写完整其他项目，点击提交' , function * () {

        // TODO
        // 需要pepe数据库
    });

    it('123. 用户类型 - 1.修改资料页面 2.选择用户类型“县级经销商” 3.填写完整其他项目，点击提交' , function * () {

        // TODO
        // 需要pepe数据库
    });

    it('124. 用户类型 - 1.修改资料页面 2.选择用户类型“新农经纪人” 3.填写完整其他项目，点击提交' , function * () {

        // TODO
        // 需要pepe数据库
    });

    it('125. 网点资料 - 1.我的新农人页面，若有申请认证按钮 2.点击申请认证 3.跳转至服务站认证填写资料页 4.填写完整并正确的资料 5.点击保存' , function * () {
        // TODO
        // 需要pepe数据库
    });

    it('126. 网点资料 - 1.服务站资料填写页面 2.选择所在地区河南省 济源市，任意镇 3.其他项均填写正确' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)


        yield nightmare
            .click(logonSelectors.myxxnrHuizhang)
            .wait(logonSelectors.fillProfileBox)
        // TODO
        // 需要pepe数据库
    });

    it('127. 网点资料 - 用户类型为县级经销商且未申请认证 1.服务站资料填写页面 2.未填写姓名、身份证号、门店名称、联系电话、所在地区、详细地址任何一项' , function * () {
        // TODO
        // 需要pepe数据库
    });

    it('128. 网点资料 - 用户类型为县级经销商且未申请认证 1.服务站资料填写页面 2.输入姓名“新新农人经销商”' , function * () {
        // TODO
        // 需要pepe数据库
    });

    it('129. 网点资料 - 用户类型为县级经销商且未申请认证 1.服务站资料填写页面 2.输入身份证号“1111”' , function * () {
        // TODO
        // 需要pepe数据库
    });

    it('130. 网点资料 - 用户类型为县级经销商且未申请认证 1.服务站资料填写页面 2.输入门店名称超过20个字' , function * () {
        // TODO
        // 需要pepe数据库
    });

    it('131. 网点资料 - 用户类型为县级经销商且未申请认证 1.服务站资料填写页面 2.输入联系电话“11111111111”' , function * () {
        // TODO
        // 需要pepe数据库
    });
    it('132. 网点资料 - 用户类型为县级经销商且未申请认证 1.服务站资料填写页面 2.输入详细地址超过30个字' , function * () {
        // TODO
        // 需要pepe数据库
    });
    it('133. 网点资料 - 用户类型为县级经销商且未申请认证 1.我的新农人页面，若有申请认证按钮 2.点击申请认证 3.跳转至服务站认证填写资料页 4.资料未填写完整 5.点击保存' , function * () {
        // TODO
        // 需要pepe数据库
    });
    it('134. 网点资料 - 服务站认证资料展示 1.我的新农人页面，已认证为县级经销商 2.点击认证徽章' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredRSCVerifiedPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredRSCVerifiedPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)


        yield nightmare
            .click(logonSelectors.myxxnrHuizhang)
            .wait(logonSelectors.applyCountyForm)

        var name = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.applyCountyFormName).value
            },logonSelectors)
        expect(name).to.have.string(config.phoneNumbers.registeredRSCVerifiedName);

        var id = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.applyCountyFormID).value
            },logonSelectors)
        expect(id).to.have.string(config.phoneNumbers.registeredRSCVerifiedID);

        var shopName = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.applyCountyFormShopName).value
            },logonSelectors)
        expect(shopName).to.have.string(config.phoneNumbers.registeredRSCVerifiedShopName);

        var phone = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.applyCountyFormPhoneNum).value
            },logonSelectors)
        expect(phone).to.have.string(config.phoneNumbers.registeredRSCVerifiedPhone);

        var detaileAddress = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.applyCountyFormDetailAddress).value
            },logonSelectors)
        expect(detaileAddress).to.have.string(config.phoneNumbers.registeredRSCVerifiedDetailAddress);
    });
    it('135. 修改密码 - 正确流程 1.点击修改密码 2.填写原密码、新密码、确认密码 3.点击确认' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)


        yield nightmare
            .click(logonSelectors.myxxnrProfileModifyPassword)
            .wait(logonSelectors.PopContent)
            .type(logonSelectors.myxxnrProfileModifyPasswordOldPassword,config.phoneNumbers.registeredPhonePassword)
            .type(logonSelectors.myxxnrProfileModifyPasswordOldNewPassword,config.phoneNumbers.registeredPhoneTmpPassword)
            .type(logonSelectors.myxxnrProfileModifyPasswordOldNewPasswordConfirm,config.phoneNumbers.registeredPhoneTmpPassword)
            .click(logonSelectors.myxxnrProfileModifyCommitBtn)
            .wait(500)

        var flashMsg = yield nightmare
            .wait(logonSelectors.flashMessage)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.flashMessage).innerHTML;
            },logonSelectors);

        expect(flashMsg).to.equal(logonWording.myxxnrChangePasswordSuccess);

        // 重置回初始状态

        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhoneTmpPassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)


        yield nightmare
            .click(logonSelectors.myxxnrProfileModifyPassword)
            .wait(logonSelectors.PopContent)
            .type(logonSelectors.myxxnrProfileModifyPasswordOldPassword,config.phoneNumbers.registeredPhoneTmpPassword)
            .type(logonSelectors.myxxnrProfileModifyPasswordOldNewPassword,config.phoneNumbers.registeredPhonePassword)
            .type(logonSelectors.myxxnrProfileModifyPasswordOldNewPasswordConfirm,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.myxxnrProfileModifyCommitBtn)
            .wait(500)

        var flashMsg = yield nightmare
            .wait(logonSelectors.flashMessage)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.flashMessage).innerHTML;
            },logonSelectors);

        expect(flashMsg).to.equal(logonWording.myxxnrChangePasswordSuccess);
    });
    it('136. 修改密码 - 未填写提示 1.修改密码页面未填写原密码，点击确认' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)


        yield nightmare
            .click(logonSelectors.myxxnrProfileModifyPassword)
            .wait(logonSelectors.PopContent)
            .click(logonSelectors.myxxnrProfileModifyCommitBtn)
            .wait(500)

        var errMsg = yield nightmare
            .wait(logonSelectors.myxxnrProfileModifyErr)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileModifyErr).innerHTML;
            },logonSelectors);

        expect(errMsg).to.have.string(logonWording.myxxnrChangeNoOldPassword);

    });
    it('137. 修改密码 - 未填写提示 1.修改密码页面未填写新密码，点击确认' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)


        yield nightmare
            .click(logonSelectors.myxxnrProfileModifyPassword)
            .wait(logonSelectors.PopContent)
            .type(logonSelectors.myxxnrProfileModifyPasswordOldPassword,config.phoneNumbers.registeredPhoneTmpPassword)
            .click(logonSelectors.myxxnrProfileModifyCommitBtn)
            .wait(500)

        var errMsg = yield nightmare
            .wait(logonSelectors.myxxnrProfileModifyErr)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileModifyErr).innerHTML;
            },logonSelectors);

        expect(errMsg).to.have.string(logonWording.myxxnrChangeNoNewPassword);
    });
    it('138. 修改密码 - 未填写提示 1.修改密码页面未填写确认密码，点击确认' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        yield nightmare
            .click(logonSelectors.myxxnrProfileModifyPassword)
            .wait(logonSelectors.PopContent)
            .type(logonSelectors.myxxnrProfileModifyPasswordOldPassword,config.phoneNumbers.registeredPhoneTmpPassword)
            .type(logonSelectors.myxxnrProfileModifyPasswordOldNewPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.myxxnrProfileModifyCommitBtn)
            .wait(500)

        var errMsg = yield nightmare
            .wait(logonSelectors.myxxnrProfileModifyErr)
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfileModifyErr).innerHTML;
            },logonSelectors);

        expect(errMsg).to.have.string(logonWording.myxxnrChangeNoNewConfirmPassword);
    });
    it('143. 展示用户积分 - 1.进入我的新农人页面' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var point = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfilePoint).innerHTML;
            },logonSelectors);

        expect(point).to.equal(config.phoneNumbers.registeredPoint);

    });

    it('146. 展示用户积分 - 1.进入我的积分页面 2.展示用户积分' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredPhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredPhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        var point = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.myxxnrProfilePoint).innerHTML;
            },logonSelectors);
        expect(point).to.equal(config.phoneNumbers.registeredPoint);

        yield nightmare
            .click(logonSelectors.myxxnrProfilePoint)
            .wait(logonSelectors.pointsRecordingSection)

        var pointsRecordingSectionPoint = yield nightmare
            .evaluate(function (logonSelectors) {
                return document.querySelector(logonSelectors.pointsRecordingSectionPoint).innerHTML;
            },logonSelectors);

        expect(pointsRecordingSectionPoint).to.equal(point);
    });

    it('147. 我的积分 积分记录 - 1.进入我的积分页面 2.展示用户积分记录' , function * () {
        // TODO
        // 等pepe
    });

    it('153. 我的客户-翻页 直接点数字 - 1.进入我的客户页面 2.点击数字' , function * () {
        // TODO
        // 等pepe
    });

    it('154. 我的客户-翻页 直接点数字 - 下（上）一页:有下（上）一页 ' , function * () {
        // TODO
        // 等pepe
    });

    it('155. 我的客户-翻页 直接点数字 - 下（上）一页:没有下（上）一页 ' , function * () {
        // TODO
        // 等pepe
    });

    it('160. 我的客户-客户订单-翻页 直接点数字 - 1.进入客户订单页面 2.点击数字' , function * () {
        // TODO
        // 等pepe
    });

    it('161. 我的客户-客户订单-翻页 直接点数字 - 下（上）一页:有下（上）一页 ' , function * () {
        // TODO
        // 等pepe
    });

    it('162. 我的客户-客户订单-翻页 直接点数字 - 下（上）一页:没有下（上）一页 ' , function * () {
        // TODO
        // 等pepe
    });

    it('164. 我的代表 - 我的代表为空 用户有推荐经纪人' , function * () {
        yield nightmare
            .goto(BaseUrl)
            //.cookies.clearAll()
            .click(logonSelectors.headerLogin)
            .wait(1000)
            .wait(logonSelectors.logonLoginForm)
            .type(logonSelectors.logonLoginFormPhone,config.phoneNumbers.registeredNoProfilePhone)
            .type(logonSelectors.logonLoginFormPassword,config.phoneNumbers.registeredNoProfilePhonePassword)
            .click(logonSelectors.logonLoginFormLoginBtn)
            .wait(1000)
            .click(logonSelectors.headerWelcomeLinkWithUserName)
            .wait(1000)

        yield nightmare
            .click(logonSelectors.myxxnrProfileInvitationBtn)
            .wait(logonSelectors.invitationSection)
    });

});