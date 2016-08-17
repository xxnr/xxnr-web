var casper = require('casper').create({
    clientScripts: [
        './jquery.min.js' // These two scripts will be injected in remote
        // 'includes/underscore.js'   // DOM on every request
    ],
    pageSettings: {
        loadImages: false, // The WebPage instance used by Casper will
        loadPlugins: false // use these settings
    },
});
var mouse = require("mouse").create(casper);
var x = require('casper').selectXPath;
var BaseUrl = 'http://192.168.1.37/';
// var BaseUrl = 'http://192.168.1.117:8070';
// var BaseUrl = 'http://101.200.194.203';

casper.start(BaseUrl, function() {
    this.test.assertTitle('新新农人-农业互联网电商服务平台-新农业、新农村、新农人', '主页正常载入');
});
// testcase 2
// casper.thenOpen(BaseUrl + '/logon.html?tab=2', function() {
//     this.sendKeys('#regist_phone_num', '', {
//         keepFocus: true
//     });
// });
// casper.then(function() {
//     this.click('.reg_btn a');
// });
// casper.waitForSelector('.sweet-alert', function() {
//     // this.captureSelector('twitter.png', 'html');
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请输入手机号', '测试 2-请输入手机号');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// //testcase 3
// casper.thenOpen(BaseUrl + '/logon.html?tab=2', function() {
//     this.sendKeys('#regist_phone_num', '15222222222', {
//         keepFocus: true
//     });
// });
// casper.then(function() {
//     this.click('.reg_btn a');
// });
// casper.waitForSelector('.sweet-alert', function() { //
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请输入验证码', '测试 3-未填写密码验证码');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// // //testcase 4
// casper.thenOpen(BaseUrl + '/logon.html?tab=2', function() {
//     this.sendKeys('#regist_phone_num', '15222222222', {
//         keepFocus: true
//     });
//     this.sendKeys('#dynamic_code', '000000', {
//         keepFocus: true
//     });
// });
// casper.then(function() {
//     this.click('.reg_btn a');
// });
// casper.waitForSelector('.sweet-alert', function() {
//     // this.captureSelector('twitter.png', 'html');                 //成功时调用的函数,给整个页面截图
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请输入密码', '测试 4-未填写密码');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// //
// //testcase 5
// casper.thenOpen(BaseUrl + '/logon.html?tab=2', function() {
//     console.log(document.querySelector('#regist_phone_num'));
//     this.sendKeys('#regist_phone_num', '15222222222', {
//         keepFocus: true
//     });

//     this.sendKeys('#dynamic_code', '000000', {
//         keepFocus: true
//     });
//     this.sendKeys('#password', '123123', {
//         keepFocus: true
//     });
// });
// casper.then(function() {
//     this.click('.reg_btn a');
// });
// casper.waitForSelector('.sweet-alert', function() { //
//     // this.captureSelector('twitter.png', 'html');                 //成功时调用的函数,给整个页面截图
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请再次输入密码', '测试 5-未填写确认密码');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// //testcase 6
// casper.thenOpen(BaseUrl + '/logon.html?tab=2', function() {
//     this.sendKeys('#regist_phone_num', '18610240422', {
//         keepFocus: true
//     });
// });
// casper.then(function() {
//     this.click('.reg_get_code a');
// });
// casper.waitForSelector('.sweet-alert', function() {
//     // this.captureSelector('twitter.png', 'html');
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '该手机号已注册', '测试 6-手机号已注册');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
//testcase 7
casper.thenOpen(BaseUrl + '/logon.html?tab=2', function() {
    this.sendKeys('#regist_phone_num', '1111aaa', {
        keepFocus: true
    });
});
casper.then(function() {
    this.click('.reg_get_code a');
});
casper.waitForSelector('.sweet-alert', function() {
    this.captureSelector('twitter.png', 'html');
    this.echo(casper.getHTML('body')); 
    this.test.assertEquals(casper.getHTML('.sweet-alert p'), '手机号格式错误', '测试 7-手机号格式错误');
}, function() {
    this.die('Timeout reached. Fail whale?').exit(); //
}, 3000);
//testcase 8
casper.thenOpen(BaseUrl + '/logon.html?tab=2', function() {
    this.sendKeys('#regist_phone_num', '18610240422', {
        keepFocus: true
    });
});
casper.then(function() {
    this.click('.reg_get_code a');
});
casper.wait(2000);
casper.waitForSelector('.sweet-alert', function() { //
    // this.captureSelector('twitter.png', 'html');
    this.test.assertEquals(casper.getHTML('.sweet-alert p'), '成功获取短信，请注意查收','测试 8 - 成功获取短信，请注意查收');
}, function() {
    this.echo(casper.getHTML('body')); 
    this.die('Timeout reached. Fail whale?').exit();             //
},
3000);
//testcase 11
// casper.thenOpen(BaseUrl+'/logon.html?tab=2', function() {
//     this.sendKeys('#regist_phone_num', '15222222222', {keepFocus: true});
//     // this.click('.reg_get_code a');
//     // this.waitForSelector('.sweet-alert', function() {                  //
//     //     this.click('.sweet-alert .confirm');
//     // }, function() {
//     //     this.die('Timeout reached. Fail whale?').exit();             //
//     // }, 3000);

//     this.sendKeys('#dynamic_code', '000000', {keepFocus: true});
//     this.sendKeys('#password', '123123', {keepFocus: true});
//     this.sendKeys('#password_cf', '123123', {keepFocus: true});
//     this.click('.reg_btn a');
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '验证码输入错误','测试 11-没有查找到验证码');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
// });
//testcase 11/12
// casper.thenOpen(BaseUrl+'/logon.html?tab=2', function() {
//     this.sendKeys('#regist_phone_num', '15222222222', {keepFocus: true});
//     this.click('.reg_get_code a');
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.click('.sweet-alert .confirm');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
//     this.sendKeys('#dynamic_code', '000000', {keepFocus: true});
//     this.sendKeys('#password', '123123', {keepFocus: true});
//     this.sendKeys('#password_cf', '123123', {keepFocus: true});
//     casper.wait(3000);
//     this.click('.reg_btn a');
//     casper.wait(3000);
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '验证码输入错误','测试 11/12-验证码输入有误，请重新输入');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
// });

// // testcase 13
// casper.thenOpen(BaseUrl+'/logon.html?tab=2', function() {
//     this.sendKeys('#regist_phone_num', '15222222222', {keepFocus: true});
//     this.sendKeys('#dynamic_code', '000000', {keepFocus: true});
//     this.sendKeys('#password', '123', {keepFocus: true});
//     this.sendKeys('#password_cf', '123', {keepFocus: true});
//     this.click('.reg_btn a');
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '密码长度需大于6位','测试 13-密码长度需大于6位');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
// });
// //testcase 14
// casper.thenOpen(BaseUrl+'/logon.html?tab=2', function() {
//     this.sendKeys('#regist_phone_num', '15222222222', {keepFocus: true});
//     this.sendKeys('#dynamic_code', '000000', {keepFocus: true});
//     this.sendKeys('#password', '123123', {keepFocus: true});
//     this.sendKeys('#password_cf', '000000', {keepFocus: true});
//     this.click('.reg_btn a');
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '两次密码不一致','测试 14-两次密码不一致');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
// });
// //testcase 15
// casper.thenOpen(BaseUrl+'/logon.html?tab=2', function() {
//     this.click('.policy a');
//     this.waitForSelector('.pop_content_policy', function() {                  //
//         this.test.assertEquals(casper.getHTML('.pop_head span'), '新新农人网站使用协议','测试 15-打开新新农人网站使用协议');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
// });

// // testcase 16 checkbox not work
// casper.thenOpen(BaseUrl+'/logon.html?tab=2', function() {
//     this.waitForSelector(".policy input[name='readPolicy']", function() {                  //
//         // this.test.assertEquals(this.getElementAttribute(".policy input[name='readPolicy']", 'checked'), 'true' ,'测试 16-打开新新农人网站使用协议');
//         // this.click("input[name='readPolicy']");
//             // this.evaluate(function() {
//             //         document.querySelector(".policy input[name='readPolicy']").setAttribute('checked', false);
//             // });
//         this.test.assertEquals(this.getElementAttribute(".policy input[name='readPolicy']", 'checked'), 'true' ,'测试 16-打开新新农人网站使用协议');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
// });
// // testcase 17 checkbox not work
// casper.thenOpen(BaseUrl+'/logon.html?tab=2', function() {
//     // this.evaluate(function() {
//     //         document.querySelector('.policy input').setAttribute('checked', false);
//     // });
//     this.click('.policy input');
//     this.click('.reg_btn a');
//     this.waitForSelector('.sweet-alert', function() {
//         var checked = this.evaluate(function(check_id) {
//                 var element = $('.policy input');
//                 return element;
//             });
//         console.log(checked);
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请接受使用协议','测试 17 - 请接受使用协议');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();
//     }, 3000);
// });

// // testcase 18
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {keepFocus: true});
//     this.sendKeys('#login_password', '123123', {keepFocus: true});

// });
// casper.thenClick('.login_btn a');
// casper.wait(2000);
// casper.then(function(){
//     this.test.assertTitle('新新农人-农业互联网电商服务平台-新农业、新农村、新农人', '测试 18-正确登录流程 个人资料已完善');
//     phantom.clearCookies();
// });
// // testcase 19
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18518671828', {keepFocus: true});
//     this.sendKeys('#login_password', '111111', {keepFocus: true});

// });
// casper.thenClick('.login_btn a');
// casper.wait(2000);
// casper.then(function(){
//     this.test.assertTitle('完善个人资料', '测试 19-正确登录流程 个人资料未完善');
//     phantom.clearCookies();
// });

// //testcase 20
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '1861024', {keepFocus: true});
//     this.sendKeys('#login_password', '123123', {keepFocus: true});
//     this.click('.login_btn a');
//         this.waitForSelector('.sweet-alert', function() {                  //
//             this.test.assertEquals(casper.getHTML('.sweet-alert p'), '账号不存在','测试 20-手机号格式错误');
//         }, function() {
//             this.die('Timeout reached. Fail whale?').exit();             //
//         }, 3000);
// });
// //testcase 21
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18611111111', {keepFocus: true});
//     this.sendKeys('#login_password', '123123', {keepFocus: true});
//     this.click('.login_btn a');
//         this.waitForSelector('.sweet-alert', function() {                  //
//             this.test.assertEquals(casper.getHTML('.sweet-alert p'), '账号不存在','测试 21-手机号未注册');
//         }, function() {
//             this.die('Timeout reached. Fail whale?').exit();             //
//         }, 3000);
// });

// //testcase 22
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {keepFocus: true});
//     this.sendKeys('#login_password', '111111', {keepFocus: true});
//     this.click('.login_btn a');
//         this.waitForSelector('.sweet-alert', function() {                  //
//             this.test.assertEquals(casper.getHTML('.sweet-alert p'), '密码错误','测试 22-密码错误');
//         }, function() {
//             this.die('Timeout reached. Fail whale?').exit();             //
//         }, 3000);
// });

// //testcase 23
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {keepFocus: true});
//     this.click('.login_btn a');
//         this.waitForSelector('.sweet-alert', function() {                  //
//             this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请输入用户名和密码','测试 23-仅输入手机号');
//         }, function() {
//             this.die('Timeout reached. Fail whale?').exit();             //
//         }, 3000);
// });

// // testcase 24
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_password', '111111', {keepFocus: true});
//     this.click('.login_btn a');
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请输入账号','测试 24-仅输入密码');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
// });

// // testcase 26
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.click('.get_pass a');
//     this.waitForSelector('.pop_content', function() {                  //
//         this.click('a.btn');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请输入手机号','测试 26-未填写手机号');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
// });

// // testcase 27
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.click('.get_pass a');
//     this.waitForSelector('.pop_content', function() {                  //
//         this.sendKeys('.pop_login #tel', '18610240422', {keepFocus: true});
//         this.click('a.btn');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请输入验证码','测试 27-未填写验证码');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
// });

// // testcase 28
// casper.thenOpen(BaseUrl+'/logon.html?tab=2', function() {
//     this.click('.get_pass a');
//     this.waitForSelector('.pop_content', function() {                  //
//         this.sendKeys('.pop_login #tel', '18610240422', {keepFocus: true});
//         this.sendKeys('.pop_login .input_reg_code', '000000', {keepFocus: true});
//         this.click('a.btn');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请输入密码','测试 28-未填写密码');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
// });

// // testcase 29
// casper.thenOpen(BaseUrl+'/logon.html?tab=2', function() {
//     this.click('.get_pass a');
//     this.waitForSelector('.pop_content', function() {                  //
//         this.sendKeys('.pop_login #tel', '18610240422', {keepFocus: true});
//         this.sendKeys('.pop_login .input_reg_code', '000000', {keepFocus: true});
//         this.sendKeys("input#password", "000000", {keepFocus: true});
//         this.click('a.btn');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请再次输入密码','测试 29-未填写确认密码');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
// });

// // testcase 30
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.click('.get_pass a');
//     this.waitForSelector('.pop_content', function() {                  //
//         this.sendKeys('.pop_login #tel', '15211111111', {keepFocus: true});
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
//     casper.waitForSelector('.pop_login  .reg_get_code a',
//        function success() {
//            this.test.assertExists('.pop_login  .reg_get_code a');
//            this.click('.pop_login  .reg_get_code a');
//        },
//        function fail() {
//            this.test.assertExists('.pop_login  .reg_get_code a');
//    });
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '您输入的手机号未注册，请核对后重新输入','测试 30-提示“您输入的手机号未注册，请核对后重新输入”');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     });
// });

// // testcase 31
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.click('.get_pass a');
//     this.waitForSelector('.pop_content', function() {                  //
//         this.sendKeys('.pop_login #tel', '11111111111', {keepFocus: true});
//         this.click('.pop_login  .reg_get_code a');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '手机号格式错误','测试 31-手机号格式错误');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
// });
// //testcase 35
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.click('.get_pass a');
//     this.waitForSelector('.pop_content', function() {                  //
//         this.sendKeys('.pop_login #tel', '18610240422', {keepFocus: true});
//         this.sendKeys('.pop_login .input_reg_code', '000000', {keepFocus: true});
//         this.sendKeys("input#pop_password", "000000", {keepFocus: true});
//         this.sendKeys("input#pop_password_cf", "000000", {keepFocus: true});
//         this.click('.pop_body .pop_login li:last-child a');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     });
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '验证码已过期，请重新获取','测试 35-验证码已过期，请重新获取');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     });
// });
// // testcase 36
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.click('.get_pass a');
//     this.waitForSelector('.pop_content', function() {                  //
//         this.sendKeys('.pop_login #tel', '18610240422', {keepFocus: true});
//         this.sendKeys('.pop_login .input_reg_code', '000000', {keepFocus: true});
//         this.click('.pop_login  .reg_get_code a');
//         this.sendKeys("input#pop_password", "000000", {keepFocus: true});
//         this.sendKeys("input#pop_password_cf", "000000", {keepFocus: true});
//         this.click('.pop_body .pop_login li:last-child a');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     });
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '验证码输入错误','测试 36-验证码输入错误');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     });
// });
// // testcase 38
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.click('.get_pass a');
//     this.waitForSelector('.pop_content', function() {                  //
//         this.sendKeys('.pop_login #tel', '18610240422', {keepFocus: true});
//         this.sendKeys('.pop_login .input_reg_code', '000000', {keepFocus: true});
//         this.click('.pop_login  .reg_get_code a');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     });
//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.click('.sweet-alert .confirm');
//         this.sendKeys("input#pop_password", "000000", {keepFocus: true});
//         this.sendKeys("input#pop_password_cf", "111111", {keepFocus: true});
//         this.click('.pop_body .pop_login li:last-child a');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     });

//     this.waitForSelector('.sweet-alert', function() {                  //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '两次密码不一致','测试 38-两次密码输入不一致，请重新输入');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     });
// });

// // testcase 39
// casper.thenOpen(BaseUrl, function() {
//     casper.wait(100, function() {
//         this.click('#header_login');
//     });
//     // this.click('#header_login');
// this.waitForSelector('.pop_content', function() {                  //
//     this.test.assertEquals(this.getElementAttribute(".user_tabs li:nth-child(1)", 'class'),'current','测试 40 - 跳转到注册页');

//         // this.test.assertTitle('登录', '测试 39 - 点击登录按钮');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit();             //
//     }, 3000);
// });
// // testcase 40
// casper.thenOpen(BaseUrl, function() {
//     casper.wait(100, function() {
//         this.click('#header_register');
//     });
//     // this.click('#header_login');
//     this.waitForSelector('.pop_content', function() {                  //
//         this.test.assertEquals(this.getElementAttribute(".user_tabs li:nth-child(2)", 'class'),'current','测试 40 - 跳转到注册页');

//             // this.test.assertTitle('登录', '测试 40 - 点击注册按钮');
//         }, function() {
//             this.die('Timeout reached. Fail whale?').exit();             //
//         }, 3000);
// });

// //testcase 41
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {keepFocus: true});
//     this.sendKeys('#login_password', '123123', {keepFocus: true});

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.then(function(){
//     // this.echo(this.getTitle());

//     this.test.assertEquals(this.getHTML('.login a'),'欢迎，haha' ,'测试 41 - 原登录和注册按钮去掉，改为“欢迎，[用户昵称]”和退出');
//     phantom.clearCookies();
// });
// // testcase 42
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {keepFocus: true});
//     this.sendKeys('#login_password', '123123', {keepFocus: true});
// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);
// casper.waitForSelector(x("//a[normalize-space(text())='欢迎，haha']"),
//    function success() {
//        this.test.assertExists(x("//a[normalize-space(text())='欢迎，haha']"));
//        this.click(x("//a[normalize-space(text())='欢迎，haha']"));
//    },
//    function fail() {
//        this.test.assertExists(x("//a[normalize-space(text())='欢迎，haha']"));
// });
// casper.then(function(){
//     this.test.assertEquals(this.getTitle(),'我的新农人' ,'测试 42 - 点击用户昵称-跳转到我的新农人页面');
//     phantom.clearCookies();
// });
// // testcase 43
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18518671828', {keepFocus: true});
//     this.sendKeys('#login_password', '111111', {keepFocus: true});

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.then(function(){
//     // this.echo(this.getTitle());

//     this.test.assertEquals(this.getHTML('.login a'),'欢迎，新新农人' ,'测试 43 - .登录后，用户没有昵称,展示“欢迎，新新农人”');
//     phantom.clearCookies();
// });
// // testcase 44
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {keepFocus: true});
//     this.sendKeys('#login_password', '123123', {keepFocus: true});

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.then(function(){
//     this.test.assertEquals(
//         this.getHTML('.login a'),'欢迎，haha' ,'测试 44 - “欢迎，[用户昵称]”'
//     );
//     phantom.clearCookies();
// });
// // testcase 45
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {keepFocus: true});
//     this.sendKeys('#login_password', '123123', {keepFocus: true});
//     this.click('.login_btn a');
//     this.wait(3000);
//     this.waitForSelector(x("//a[normalize-space(text())='退出']"),
//       function success() {
//         //   this.test.assertExists(x("//a[normalize-space(text())='退出']"));
//           this.click(x("//a[normalize-space(text())='退出']"));
//       },
//       function fail() {
//           test.assertExists(x("//a[normalize-space(text())='退出']"));
//   });
//   this.waitForSelector("input#login_account",
//       function success() {
//           this.test.assertExists("input#login_account","测试 45 - 点击退出,用户cookie清掉，退出，跳转到登录页");
//           this.click("input#login_account");
//       },
//       function fail() {
//           this.test.assertExists("input#login_account");
//   });
// });
// // testcase 48
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector(".logo a",
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='新新农人']"));
//         this.test.assertTitle('新新农人-农业互联网电商服务平台-新农业、新农村、新农人', '测试48(主页) - 任何页面点击logo，跳转到首页');
//     },
//     function fail() {
//         this.test.assertExists(".logo a");
//     });
// casper.thenOpen(BaseUrl + 'huafei_list.html', function() {});
// casper.waitForSelector(".logo a",
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='新新农人']"));
//         this.test.assertTitle('新新农人-农业互联网电商服务平台-新农业、新农村、新农人', '测试48(化肥) - 任何页面点击logo，跳转到首页');
//     },
//     function fail() {
//         this.test.assertExists(".logo a");
//     });
// casper.thenOpen(BaseUrl + 'car_list.html', function() {});
// casper.waitForSelector(".logo a",
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='新新农人']"));
//         this.test.assertTitle('新新农人-农业互联网电商服务平台-新农业、新农村、新农人', '测试48(汽车) - 任何页面点击logo，跳转到首页');
//     },
//     function fail() {
//         this.test.assertExists(".logo a");
//     });
// casper.thenOpen(BaseUrl + 'news_list.html', function() {});
// casper.waitForSelector(".logo a",
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='新新农人']"));
//         this.test.assertTitle('新新农人-农业互联网电商服务平台-新农业、新农村、新农人', '测试48(资讯) - 任何页面点击logo，跳转到首页');
//     },
//     function fail() {
//         this.test.assertExists(".logo a");
//     });
// casper.thenOpen(BaseUrl + 'about.html', function() {});
// casper.waitForSelector(".logo a",
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='新新农人']"));
//         this.test.assertTitle('新新农人-农业互联网电商服务平台-新农业、新农村、新农人', '测试48(公司) - 任何页面点击logo，跳转到首页');
//     },
//     function fail() {
//         this.test.assertExists(".logo a");
//     });

// //testcase 49
// casper.thenOpen(BaseUrl, function() {});
// casper.wait(3000);
// casper.waitForSelector(x("//a[normalize-space(text())='首页']"),
//     function success() {
//            this.test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='首页']"));
        
//         this.test.assertTitle('新新农人-农业互联网电商服务平台-新农业、新农村、新农人', '测试49(主页) - 任何页面点击"首页"，跳转到首页');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='首页']"));
//     });
// casper.thenOpen(BaseUrl + 'huafei_list.html', function() {});
// casper.wait(3000);
// casper.waitForSelector(x("//a[normalize-space(text())='首页']"),
//     function success() {
//            this.test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='首页']"));
        
//         this.test.assertTitle('新新农人-农业互联网电商服务平台-新农业、新农村、新农人', '测试49(化肥) - 任何页面点击"首页"，跳转到首页');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='首页']"));
//     });
// casper.thenOpen(BaseUrl + 'car_list.html', function() {});
// casper.wait(3000);
// casper.waitForSelector(x("//a[normalize-space(text())='首页']"),
//     function success() {
//            this.test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='首页']"));
        
//         this.test.assertTitle('新新农人-农业互联网电商服务平台-新农业、新农村、新农人', '测试49(汽车) - 任何页面点击"首页"，跳转到首页');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='首页']"));
//     });
// casper.thenOpen(BaseUrl + 'new_list.html', function() {});
// casper.wait(3000);
// casper.waitForSelector(x("//a[normalize-space(text())='首页']"),
//     function success() {
//            this.test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='首页']"));
        
//         this.test.assertTitle('新新农人-农业互联网电商服务平台-新农业、新农村、新农人', '测试49(资讯) - 任何页面点击"首页"，跳转到首页');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='首页']"));
//     });
// casper.thenOpen(BaseUrl + 'about.html', function() {});
// casper.wait(3000);
// casper.waitForSelector(x("//a[normalize-space(text())='首页']"),
//     function success() {
//            this.test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='首页']"));
//         this.test.assertTitle('新新农人-农业互联网电商服务平台-新农业、新农村、新农人', '测试49(公司) - 任何页面点击"首页"，跳转到首页');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='首页']"));
//     });
// //testcase 50
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='化肥专场']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.test.assertExists(x("//a[normalize-space(text())='化肥专场']"));
//         this.click(x("//a[normalize-space(text())='化肥专场']"));
//         this.test.assertTitle('化肥专场-新新农人', '测试50(主页) - 任何页面点击"化肥专场"，跳转到化肥专场');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='化肥专场']"));
//     });
// casper.thenOpen(BaseUrl + 'huafei_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='化肥专场']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='化肥专场']"));
//         this.test.assertTitle('化肥专场-新新农人', '测试50(化肥) - 任何页面点击"化肥专场"，跳转到化肥专场');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='化肥专场']"));
//     });
// casper.thenOpen(BaseUrl + 'car_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='化肥专场']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='化肥专场']"));
//         this.test.assertTitle('化肥专场-新新农人', '测试50(汽车) - 任何页面点击"化肥专场"，跳转到化肥专场');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='化肥专场']"));
//     });
// casper.thenOpen(BaseUrl + 'new_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='化肥专场']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='化肥专场']"));
//         this.test.assertTitle('化肥专场-新新农人', '测试50(资讯) - 任何页面点击"化肥专场"，跳转到化肥专场');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='化肥专场']"));
//     });
// casper.thenOpen(BaseUrl + 'about.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='化肥专场']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='化肥专场']"));
//         this.test.assertTitle('化肥专场-新新农人', '测试50(公司) - 任何页面点击"化肥专场"，跳转到化肥专场');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='化肥专场']"));
//     });
// //testcase 51
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='汽车专场']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.test.assertExists(x("//a[normalize-space(text())='汽车专场']"));
//         this.click(x("//a[normalize-space(text())='汽车专场']"));
//         this.test.assertTitle('汽车专场-新新农人', '测试51(主页) - 任何页面点击"汽车专场"，跳转到汽车专场');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='汽车专场']"));
//     });
// casper.thenOpen(BaseUrl + 'huafei_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='汽车专场']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='汽车专场']"));
//         this.test.assertTitle('汽车专场-新新农人', '测试51(化肥) - 任何页面点击"汽车专场"，跳转到汽车专场');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='汽车专场']"));
//     });
// casper.thenOpen(BaseUrl + 'car_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='汽车专场']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='汽车专场']"));
//         this.test.assertTitle('汽车专场-新新农人', '测试51(汽车) - 任何页面点击"汽车专场"，跳转到汽车专场');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='汽车专场']"));
//     });
// casper.thenOpen(BaseUrl + 'new_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='汽车专场']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='汽车专场']"));
//         this.test.assertTitle('汽车专场-新新农人', '测试51(资讯) - 任何页面点击"汽车专场"，跳转到汽车专场');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='汽车专场']"));
//     });
// casper.thenOpen(BaseUrl + 'about.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='汽车专场']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='汽车专场']"));
//         this.test.assertTitle('汽车专场-新新农人', '测试51(公司) - 任何页面点击"汽车专场"，跳转到汽车专场');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='汽车专场']"));
//     });
// // testcase 52
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='新农资讯']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.test.assertExists(x("//a[normalize-space(text())='新农资讯']"));
//         this.click(x("//a[normalize-space(text())='新农资讯']"));
//         this.test.assertTitle('新农资讯-新新农人', '测试52(主页) - 任何页面点击"新农资讯"，跳转到新农资讯');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='汽车专场']"));
//     });
// casper.thenOpen(BaseUrl + 'huafei_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='新农资讯']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='新农资讯']"));
//         this.test.assertTitle('新农资讯-新新农人', '测试52(化肥) - 任何页面点击"新农资讯"，跳转到新农资讯');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='新农资讯']"));
//     });
// casper.thenOpen(BaseUrl + 'car_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='新农资讯']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='新农资讯']"));
//         this.test.assertTitle('新农资讯-新新农人', '测试52(汽车) - 任何页面点击"新农资讯"，跳转到新农资讯');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='新农资讯']"));
//     });
// casper.thenOpen(BaseUrl + 'new_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='新农资讯']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='新农资讯']"));
//         this.test.assertTitle('新农资讯-新新农人', '测试52(资讯) - 任何页面点击"新农资讯"，跳转到新农资讯');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='新农资讯']"));
//     });
// casper.thenOpen(BaseUrl + 'about.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='新农资讯']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='新农资讯']"));
//         this.test.assertTitle('新农资讯-新新农人', '测试52(公司) - 任何页面点击"新农资讯"，跳转到新农资讯');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='新农资讯']"));
//     });
// // testcase 53
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='公司介绍']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.test.assertExists(x("//a[normalize-space(text())='公司介绍']"));
//         this.click(x("//a[normalize-space(text())='公司介绍']"));
//         this.test.assertTitle('公司简介-新新农人', '测试53(主页) - 任何页面点击"公司介绍"，跳转到公司介绍');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='公司介绍']"));
//     });
// casper.thenOpen(BaseUrl + 'huafei_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='公司介绍']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='公司介绍']"));
//         this.test.assertTitle('公司简介-新新农人', '测试53(化肥) - 任何页面点击"公司介绍"，跳转到公司介绍');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='公司介绍']"));
//     });
// casper.thenOpen(BaseUrl + 'car_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='公司介绍']"),
//     function success() {
//         console.log(this.getTitle());
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='公司介绍']"));
//         this.test.assertTitle('公司简介-新新农人', '测试53(汽车) - 任何页面点击"公司介绍"，跳转到公司介绍');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='公司介绍']"));
//     });
// casper.thenOpen(BaseUrl + 'new_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='公司介绍']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='公司介绍']"));
//         this.test.assertTitle('公司简介-新新农人', '测试53(资讯) - 任何页面点击"公司介绍"，跳转到公司介绍');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='公司介绍']"));
//     });
// casper.thenOpen(BaseUrl + 'about.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='公司介绍']"),
//     function success() {
//         //    test.assertExists(x("//a[normalize-space(text())='新新农人']"));
//         this.click(x("//a[normalize-space(text())='公司介绍']"));
//         this.test.assertTitle('公司简介-新新农人', '测试53(公司) - 任何页面点击"公司介绍"，跳转到公司介绍');
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='公司介绍']"));
//     });
// // testcase 54
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });

// casper.waitForSelector(".logon",
//     function success() {
//         this.test.assertTitle("登录", '测试 54-跳转到登录页面(主页)');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// casper.thenOpen(BaseUrl + 'huafei_list.html', function() {});
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });

// casper.waitForSelector(".logon",
//     function success() {
//         this.test.assertTitle("登录", '测试 54-跳转到登录页面（化肥）');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// casper.thenOpen(BaseUrl + 'car_list.html', function() {});
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });

// casper.waitForSelector(".logon",
//     function success() {
//         this.test.assertTitle("登录", '测试 54-跳转到登录页面（汽车）');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// casper.thenOpen(BaseUrl + 'news_list.html', function() {});
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });

// casper.waitForSelector(".logon",
//     function success() {
//         this.test.assertTitle("登录", '测试 54-跳转到登录页面（资讯）');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// casper.thenOpen(BaseUrl + 'about.html', function() {});
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });

// casper.waitForSelector(".logon",
//     function success() {
//         this.test.assertTitle("登录", '测试 54-跳转到登录页面（公司）');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// // testcase 55
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {keepFocus: true});
//     this.sendKeys('#login_password', '123123', {keepFocus: true});

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });

// casper.waitForSelector(".cart_box",
//     function success() {
//         this.test.assertTitle("购物车 - 新新农人", '测试 55-跳转到购物车(主页)');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// casper.thenOpen(BaseUrl + 'huafei_list.html', function() {});
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });

// casper.waitForSelector(".cart_box",
//     function success() {
//         this.test.assertTitle("购物车 - 新新农人", '测试 55-跳转到购物车（化肥）');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// casper.thenOpen(BaseUrl + 'car_list.html', function() {});
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });

// casper.waitForSelector(".cart_box",
//     function success() {
//         this.test.assertTitle("购物车 - 新新农人", '测试 55-跳转到购物车（汽车）');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// casper.thenOpen(BaseUrl + 'news_list.html', function() {});
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });

// casper.waitForSelector(".cart_box",
//     function success() {
//         this.test.assertTitle("购物车 - 新新农人", '测试 55-跳转到购物车（资讯）');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// casper.thenOpen(BaseUrl + 'about.html', function() {});
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });

// casper.waitForSelector(".cart_box",
//     function success() {
//         this.test.assertTitle("购物车 - 新新农人", '测试 55-跳转到购物车（公司）');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// phantom.clearCookies();
// // testcase 56
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {keepFocus: true});
//     this.sendKeys('#login_password', '123123', {keepFocus: true});

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector("#side_shoping_cart",
//     function success() {
//         this.test.assertExists("#side_shoping_cart");
//         this.click("#side_shoping_cart");
//     },
//     function fail() {
//         this.test.assertExists("#side_shoping_cart");
//     });

// casper.waitForSelector(".cart_box",
//     function success() {
//         this.test.assertTitle("购物车 - 新新农人", '测试 56-任何有购物车浮层的页面，点击“购物车,跳转到购物车(主页)');
//     },
//     function fail() {
//         this.test.assertExists(".cart_box");
//     });
// casper.thenOpen(BaseUrl + 'huafei_list.html', function() {});
// casper.waitForSelector("#side_shoping_cart",
//     function success() {
//         this.test.assertExists("#side_shoping_cart");
//         this.click("#side_shoping_cart");
//     },
//     function fail() {
//         this.test.assertExists("#side_shoping_cart");
//     });

// casper.waitForSelector(".cart_box",
//     function success() {
//         this.test.assertTitle("购物车 - 新新农人", '测试 56-任何有购物车浮层的页面，点击“购物车,跳转到购物车（化肥）');
//     },
//     function fail() {
//         this.test.assertExists(".cart_box");
//     });
// casper.thenOpen(BaseUrl + 'car_list.html', function() {});
// casper.waitForSelector("#side_shoping_cart",
//     function success() {
//         this.test.assertExists("#side_shoping_cart");
//         this.click("#side_shoping_cart");
//     },
//     function fail() {
//         this.test.assertExists("#side_shoping_cart");
//     });

// casper.waitForSelector(".cart_box",
//     function success() {
//         this.test.assertTitle("购物车 - 新新农人", '测试 56-任何有购物车浮层的页面，点击“购物车,跳转到购物车（汽车）');
//     },
//     function fail() {
//         this.test.assertExists(".cart_box");
//     });
// casper.thenOpen(BaseUrl + 'news_list.html', function() {});
// casper.waitForSelector("#side_shoping_cart",
//     function success() {
//         this.test.assertExists("#side_shoping_cart");
//         this.click("#side_shoping_cart");
//     },
//     function fail() {
//         this.test.assertExists("#side_shoping_cart");
//     });

// casper.waitForSelector(".cart_box",
//     function success() {
//         this.test.assertTitle("购物车 - 新新农人", '测试 56-任何有购物车浮层的页面，点击“购物车,跳转到购物车（资讯）');
//     },
//     function fail() {
//         this.test.assertExists(".cart_box");
//     });
// casper.thenOpen(BaseUrl + 'about.html', function() {});
// casper.waitForSelector("#side_shoping_cart",
//     function success() {
//         this.test.assertExists("#side_shoping_cart");
//         this.click("#side_shoping_cart");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });

// casper.waitForSelector(".cart_box",
//     function success() {
//         this.test.assertTitle("购物车 - 新新农人", '测试 56-任何有购物车浮层的页面，点击“购物车,跳转到购物车（公司）');
//     },
//     function fail() {
//         this.test.assertExists(".cart_box");
//     });
// // testcase 57
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector("#side_shoping_cart",
//     function success() {
//         this.test.assertExists("#side_shoping_cart");
//         this.click("#side_shoping_cart");
//     },
//     function fail() {
//         this.test.assertExists("#side_shoping_cart");
//     });

// casper.waitForSelector(".logon",
//     function success() {
//         this.test.assertTitle("登录", '测试 57-任何有购物车浮层的页面，点击“购物车”,跳转到登录页面(主页)');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// casper.thenOpen(BaseUrl + 'huafei_list.html', function() {});
// casper.waitForSelector("#side_shoping_cart",
//     function success() {
//         this.test.assertExists("#side_shoping_cart");
//         this.click("#side_shoping_cart");
//     },
//     function fail() {
//         this.test.assertExists("#side_shoping_cart");
//     });

// casper.waitForSelector(".logon",
//     function success() {
//         this.test.assertTitle("登录", '测试 57-任何有购物车浮层的页面，点击“购物车”,跳转到登录页面（化肥）');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// casper.thenOpen(BaseUrl + 'car_list.html', function() {});
// casper.waitForSelector("#side_shoping_cart",
//     function success() {
//         this.test.assertExists("#side_shoping_cart");
//         this.click("#side_shoping_cart");
//     },
//     function fail() {
//         this.test.assertExists("#side_shoping_cart");
//     });

// casper.waitForSelector(".logon",
//     function success() {
//         this.test.assertTitle("登录", '测试 57-任何有购物车浮层的页面，点击“购物车”,跳转到登录页面（汽车）');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// casper.thenOpen(BaseUrl + 'news_list.html', function() {});
// casper.waitForSelector("#side_shoping_cart",
//     function success() {
//         this.test.assertExists("#side_shoping_cart");
//         this.click("#side_shoping_cart");
//     },
//     function fail() {
//         this.test.assertExists("#side_shoping_cart");
//     });

// casper.waitForSelector(".logon",
//     function success() {
//         this.test.assertTitle("登录", '测试 57-任何有购物车浮层的页面，点击“购物车”,跳转到登录页面（资讯）');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// casper.thenOpen(BaseUrl + 'about.html', function() {});
// casper.waitForSelector("#side_shoping_cart",
//     function success() {
//         this.test.assertExists("#side_shoping_cart");
//         this.click("#side_shoping_cart");
//     },
//     function fail() {
//         this.test.assertExists("#side_shoping_cart");
//     });

// casper.waitForSelector(".logon",
//     function success() {
//         this.test.assertTitle("登录", '测试 57-任何有购物车浮层的页面，点击“购物车”,跳转到登录页面（公司）');
//     },
//     function fail() {
//         this.test.assertExists(".logon");
//     });
// // testcase 63
// casper.thenOpen(BaseUrl, function() {});
// for(var i = 2;i<5;i++){
// 		(function(i){
// 			var news_title;
// 			casper.waitForSelector('.index_details_tab li:nth-child('+i+')',
// 	       function success() {
// 	           this.test.assertExists('.index_details_tab li:nth-child('+i+')');
// 	           // news_title = this.getHTML('.index_details_tab li:nth-child('+i+') a');
// 	           // console.log(news_title);
// 	           this.click('.index_details_tab li:nth-child('+i+')');
// 	       },
// 	       function fail() {
// 	           this.test.assertExists('.index_details_tab li:nth-child('+i+')');
// 	   		});

// 	   		for(var j = 1;j<5;j++){
// 	   			(function(i,j){
// 	   				casper.thenOpen(BaseUrl, function() {});
// 	   				casper.waitForSelector(".index_news_list ul:nth-child("+i+") li:nth-child("+j+")",
// 			       function success() {
// 			           this.test.assertExists(".index_news_list ul:nth-child("+i+") li:nth-child("+j+")");
// 			           this.click(".index_news_list ul:nth-child("+i+") li:nth-child("+j+") img");
// 			       },
// 			       function fail() {
// 			           this.test.assertExists(".index_news_list ul:nth-child("+i+") li:nth-child("+j+")");
// 			   		});
// 			   		casper.waitForSelector('.tags a',
// 			       		function success() {
// 			           		this.test.assertExists('.tags a');
// 			           		// console.log(this.getHTML('.tags a'));
// 			       		},
// 			       		function fail() {
// 			           		this.test.assertExists('.tags a');
// 			   		});
// 	   			}(i,j))
				
// 			}

// 		}(i))
// }
   
// // testcase 64
// casper.thenOpen(BaseUrl, function() {});
// var newsTitle;
// casper.waitForSelector(".row.ng-scope:nth-child(1) .ng-scope:nth-child(1) .ng-binding",
//    function success() {
//        this.test.assertExists(".row.ng-scope:nth-child(1) .ng-scope:nth-child(1) .ng-binding");
//        newsTitle = this.getHTML(".row.ng-scope:nth-child(1) .ng-scope:nth-child(1) .ng-binding").slice(0,10);
//        this.click(".row.ng-scope:nth-child(1) .ng-scope:nth-child(1) .ng-binding");
//    },
//    function fail() {
//        this.test.assertExists(".row.ng-scope:nth-child(1) .ng-scope:nth-child(1) .ng-binding");
// });
// casper.waitForSelector(".news_detail h2",
//    function success() {
//        this.test.assertExists(".news_detail h2");
//        this.click(".news_detail h2");
//    },
//    function fail() {
//        this.test.assertExists(".news_detail h2");
// });
// casper.waitForSelector(".news_detail h2",
//    function success() {
//        this.test.assertExists(".news_detail h2");
//        this.test.assertEquals(this.getHTML(".news_detail h2").indexOf(newsTitle) === 0,true,"测试 - 64: 1.点击资讯图片或标题 , 跳转到对应资讯详情页")
//    },
//    function fail() {
//        this.test.assertExists(".news_detail h2");
// });
// casper.then(function() {
//     this.test.assertTitle('新农资讯-新新农人', '测试 64-点击资讯图片或标题');
// });
// // testcase 65
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='更多资讯']"),
//        function success() {
//            this.test.assertExists(x("//a[normalize-space(text())='更多资讯']"));
//            this.click(x("//a[normalize-space(text())='更多资讯']"));
//        },
//        function fail() {
//            this.test.assertExists(x("//a[normalize-space(text())='更多资讯']"));
//    });
// casper.then(function() {
//     this.test.assertTitle('新农资讯-新新农人', '测试 65-点击更多资讯');
// });
// //testcase 66
// casper.thenOpen(BaseUrl, function() {

// });
// casper.waitForSelector(x("//a[normalize-space(text())='更多商品']"),
//        function success() {
//            this.test.assertExists(x("//a[normalize-space(text())='更多商品' and @href='huafei_list.html']"));
//            this.click(x("//a[normalize-space(text())='更多商品' and @href='huafei_list.html']"));
//        },
//        function fail() {
//            this.test.assertExists(x("//a[normalize-space(text())='更多商品' and @href='huafei_list.html']"));
//    });
// casper.then(function() {
//    this.test.assertTitle('化肥专场-新新农人', '测试 66-点击化肥banner，跳转化肥专场');
// });
// //testcase 67
// casper.thenOpen(BaseUrl, function() {

// });
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .product_img img",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .product_img img");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .product_img img");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .product_img img");
//     });
// casper.then(function() {
//     this.test.assertTitle('化肥专场-新新农人', '测试 67-点击化肥banner，跳转化肥专场');
// });
// //testcase 68
// casper.thenOpen(BaseUrl, function() {

// });
// casper.waitForSelector(x("//a[normalize-space(text())='更多商品']"),
//        function success() {
//            this.test.assertExists(x("//a[normalize-space(text())='更多商品' and @href='car_list.html']"));
//            this.click(x("//a[normalize-space(text())='更多商品' and @href='car_list.html']"));
//        },
//        function fail() {
//            this.test.assertExists(x("//a[normalize-space(text())='更多商品' and @href='car_list.html']"));
//    });
// casper.then(function() {
//    this.test.assertTitle('汽车专场-新新农人', '测试 68-点击汽车banner，跳转化肥专场');
// });
// //testcase 69
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(1) .product_img img",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(1) .product_img img");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(1) .product_img img");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(1) .product_img img");
//     });
// casper.then(function() {
//     this.test.assertTitle('汽车专场-新新农人', '测试 69-点击汽车banner，跳转汽车专场');
// });
// // testcase 70
// casper.thenOpen(BaseUrl, function() {

// });
// casper.waitForSelector(x("//a[normalize-space(text())='中化美农 - 第3代缓控释肥 - 29-6-8 - 40kg*25...']"),
//        function success() {
//            this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(2) .ng-binding.presale");
//            this.test.assertEquals(casper.getHTML(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(2) .ng-binding.presale").indexOf("即将上线")!=-1,true,"测试 70 - 取默认的SKU的名称，价格为即将上线");
//        },
//        function fail() {
//            this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(2) .ng-binding.presale");
//    });
// //testcase 71
// casper.thenOpen(BaseUrl, function() {

// });
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .ng-binding.price");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.test.assertEquals(casper.getHTML(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active span"), "加入购物车", "测试 71 - 取默认的SKU的名称和价格");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     });
// //testcase 72
// casper.thenOpen(BaseUrl, function() {

// });
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(2)",
//        function success() {
//            this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(2) .ng-binding.presale");
//            this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(2) .ng-binding.presale");
//        },
//        function fail() {
//            this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(2) .ng-binding.presale");
//    });
//    casper.wait(3000);
//    casper.then(function(){
//        this.test.assertTitle('新新农人-农业互联网电商服务平台-新农业、新农村、新农人', '测试 72-敬请期待不可点击');
//    });
// //testcase 73
// casper.thenOpen(BaseUrl, function() {
// });
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//       function success() {
//           this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//           this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//       },
//       function fail() {
//           this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//   });
//   casper.wait(3000);
//   casper.then(function(){
//       this.test.assertTitle('商品详情 - 新新农人', '测试 73-跳转到预售的商品详情页面，注意不需选中默认的sku');
//   });
// //testcase 74 - 1
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.then(function() {
//     this.test.assertTitle('登录', '测试 74-若用户未登录，跳转到登录页面；');
// });
// //testcase 74 - 2
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {keepFocus: true});
//     this.sendKeys('#login_password', '123123', {keepFocus: true});
// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);
// casper.thenOpen(BaseUrl, function() {});
// var tmpCartCount
// casper.waitForSelector(".side_shopping_cart_badge.ng-binding",
//     function success() {
//         this.test.assertExists(".side_shopping_cart_badge.ng-binding");
//         tmpCartCount = casper.getHTML('.side_shopping_cart_badge.ng-binding');
//     },
//     function fail() {
//         this.test.assertExists(".side_shopping_cart_badge.ng-binding");
//     });
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });

// casper.wait(3000);
// casper.then(function() {
//     this.test.assertEquals(
//         parseInt(casper.getHTML('.side_shopping_cart_badge')),
//         parseInt(tmpCartCount) + 1,
//         '测试 74-若用户已登录，商品的默认sku加入购物车，同时动画商品biu到浮层购物车中'
//     );
//     phantom.clearCookies();
// });

// // testcase 75
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(2)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(2) img");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(2) img");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(2) img");
//     });
// casper.wait(3000);
// casper.then(function() {
//     this.test.assertTitle('商品详情 - 新新农人', '测试 75-跳转到商品详情页面，注意不需选中默认的sku');
// });
// // testcase 76
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector(".index_institute img",
//        function success() {
//            this.test.assertExists(".index_institute img");
//            this.click(".index_institute img");
//        },
//        function fail() {
//            this.test.assertExists(".index_institute img");
// });
//    casper.wait(3000);
//    casper.then(function() {
//        this.test.assertTitle('新新农人研究院', '测试 76-跳转到研究院页面');
//    });
//    //testcase 77
//    casper.thenOpen(BaseUrl, function() {});
//    casper.waitForSelector(".index_bigdata a",
//           function success() {
//               this.test.assertExists(".index_bigdata a");
//               this.click(".index_bigdata a");
//           },
//           function fail() {
//               this.test.assertExists(".index_bigdata a");
//    });
//       casper.wait(3000);
//       casper.then(function() {
//           this.test.assertTitle('新农大数据农技服务', '测试 77-新农大数据农技服务');
//       });
//       //testcase 78
//       casper.thenOpen(BaseUrl, function() {});
//       casper.waitForSelector(".index_finance img",
//              function success() {
//                  this.test.assertExists(".index_finance img");
//                  this.click(".index_finance img");
//              },
//              function fail() {
//                  this.test.assertExists(".index_finance img");
//       });
//          casper.wait(3000);
//          casper.then(function() {
//              this.test.assertTitle('新农金融服务', '测试 78-跳转到新新农人的新农金融介绍页面');
//          });
// // testcase 79
// casper.thenOpen(BaseUrl+'/huafei_list.html', function() {});
// casper.waitForSelector(".search .search_category ul li:nth-child(1)",
//      function success() {
//          this.test.assertExists(".search .search_category ul li:nth-child(1)");
//          this.test.assertEquals(this.getElementAttribute(".search .search_category ul li:nth-child(1)", 'class').indexOf("current")==-1, true ,'测试 79 - 筛选区默认展示所有品牌、共有属性、价格区间，均为不选中状态');
//      },
//      function fail() {
//          this.test.assertExists(".search .search_category ul li:nth-child(1)");
// });
// // testcase 80
// casper.thenOpen(BaseUrl+'/huafei_list.html', function() {});
// casper.waitForSelector(".search .search_category ul li:nth-child(1)",
//      function success() {
//          this.test.assertExists(".search .search_category ul li:nth-child(1)");
//          this.test.assertEquals(this.getElementAttribute(".search .search_category ul li:nth-child(1)", 'class').indexOf("current")==-1, true ,'测试 79 - 筛选区默认展示所有品牌、共有属性、价格区间，均为不选中状态');
//      },
//      function fail() {
//          this.test.assertExists(".search .search_category ul li:nth-child(1)");
// });
// // testcase 82
// casper.thenOpen(BaseUrl+'/huafei_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='0~3000元']"),
//    function success() {
//        this.test.assertExists(x("//a[normalize-space(text())='0~3000元']"));
//        this.click(x("//a[normalize-space(text())='0~3000元']"));
//    },
//    function fail() {
//        test.assertExists(x("//a[normalize-space(text())='0~3000元']"));
// });
// casper.waitForSelector("#goodsList li",
//    function success() {
//        this.test.assertExists("#goodsList li");
//        var goodsList = this.evaluate(function() {
//            var goodsList = $("#goodsList li")
//            return goodsList;
//        });
//        for(var i=0;i<goodsList.length;i++){
//            var tempStr = ".fenye .channel3_body ul li:nth-child("+(i+1)+ ") p.price";
//            this.test.assertEquals(casper.getElementInfo(tempStr).text.slice(1)<3000,true,"测试 82 - 筛选出价格在选中区间内的商品");
//        }
//    },
//    function fail() {
//        this.assertExists("#goodsList li");
// });
// // testcase 84
// casper.thenOpen(BaseUrl+'/huafei_list.html', function() {});
// var tmpProductName = '';
// casper.waitForSelector("#goodsList .ng-scope:nth-child(1) .product-name.ng-binding",
//    function success() {
//        this.test.assertExists("#goodsList .ng-scope:nth-child(1) .product-name.ng-binding");
//        tmpProductName = casper.getHTML("#goodsList .ng-scope:nth-child(1) .product-name.ng-binding");
//        this.click("#goodsList .ng-scope:nth-child(1) .product-name.ng-binding");
//    },
//    function fail() {
//        this.test.assertExists("#goodsList .ng-scope:nth-child(1) .product-name.ng-binding");
// });
// casper.waitForSelector("h4",
//    function success() {
//        this.test.assertEquals(casper.getHTML("h4"),tmpProductName,"测试84 - 跳转到选择商品的商品详情页");
//    },
//    function fail() {
//        this.test.assertExists("h4");
// });
// // testcase 87
// casper.thenOpen(BaseUrl+'/car_list.html', function() {});
// casper.waitForSelector(x("//a[normalize-space(text())='70000元以上']"),
//    function success() {
//        this.test.assertExists(x("//a[normalize-space(text())='70000元以上']"));
//        this.click(x("//a[normalize-space(text())='70000元以上']"));
//    },
//    function fail() {
//        test.assertExists(x("//a[normalize-space(text())='70000元以上']"));
// });
// casper.waitForSelector("#goodsList li",
//    function success() {
//        this.test.assertExists("#goodsList li");
//        var goodsList = this.evaluate(function() {
//            var goodsList = $("#goodsList li")
//            return goodsList;
//        });
//        for(var i=0;i<goodsList.length;i++){
//            var tempStr = ".fenye .channel3_body ul li:nth-child("+(i+1)+ ") p.price";
//            this.test.assertEquals(casper.getElementInfo(tempStr).text.slice(1)>70000,true,"测试 87 - 筛选出价格在选中区间内的商品");
//        }
//    },
//    function fail() {
//        this.assertExists("#goodsList li");
// });
// // testcase 87
// casper.thenOpen(BaseUrl+'/car_list.html', function() {});
// var tmpProductName = '';
// casper.waitForSelector("#goodsList .ng-scope:nth-child(1) .product-name.ng-binding",
//    function success() {
//        this.test.assertExists("#goodsList .ng-scope:nth-child(1) .product-name.ng-binding");
//        tmpProductName = casper.getHTML("#goodsList .ng-scope:nth-child(1) .product-name.ng-binding");
//        this.click("#goodsList .ng-scope:nth-child(1) .product-name.ng-binding");
//    },
//    function fail() {
//        this.test.assertExists("#goodsList .ng-scope:nth-child(1) .product-name.ng-binding");
// });
// casper.waitForSelector("h4",
//    function success() {
//        this.test.assertEquals(casper.getHTML("h4"),tmpProductName,"测试87 - 跳转到选择商品的商品详情页");
//    },
//    function fail() {
//        this.test.assertExists("h4");
// });
// // testcase 91 暂时不用
// casper.thenOpen(BaseUrl, function() {});
// var defaultSKUPrice;
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) .ng-binding.price",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) .ng-binding.price");
//         defaultSKUPrice = casper.getElementInfo(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) .ng-binding.price").text;
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) .ng-binding.price");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) .ng-binding.price");
//     });
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) img",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) img");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) img");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.waitForSelector(".price.ng-binding:nth-child(2)",
//     function success() {
//         this.test.assertExists(".price.ng-binding:nth-child(2)");
//         this.test.assertExists(casper.getHTML(".price.ng-binding:nth-child(2)").indexOf(defaultSKUPrice) != -1, true, "测试91 - 其中商品价格展示");
//     },
//     function fail() {
//         this.test.assertExists(".price.ng-binding:nth-child(2)");
//     });
// // testcase 92 暂时不用
// casper.thenOpen(BaseUrl, function() {});
// var defaultSKUPrice;
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) .ng-binding.price",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) .ng-binding.price");
//         defaultSKUPrice = casper.getElementInfo(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) .ng-binding.price").text;
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) .ng-binding.price");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) .ng-binding.price");
//     });
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) img",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) img");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) img");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.waitForSelector(".price.ng-binding:nth-child(2)",
//     function success() {
//         this.test.assertExists(".price.ng-binding:nth-child(2)");
//         this.test.assertExists(casper.getHTML(".price.ng-binding:nth-child(2)").indexOf(defaultSKUPrice) != -1, true, "测试91 - 其中商品价格展示");
//     },
//     function fail() {
//         this.test.assertExists(".price.ng-binding:nth-child(2)");
//     });
// // testcase 98
// casper.thenOpen(BaseUrl, function() {});
// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) img",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) img");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) img");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(1) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.waitForSelector("input#buy-num",
//     function success() {
//         this.test.assertExists("input#buy-num");
//         //    console.log(this.getElementAttribute("input#buy-num",'value'));
//         value = this.evaluate(function() {
//             return $("input#buy-num").val();
//         });
//         this.click("input#buy-num");
//     },
//     function fail() {
//         this.test.assertExists("input#buy-num");
//     });
// casper.waitForSelector(x("//a[normalize-space(text())='+']"),
//     function success() {
//         this.test.assertExists(x("//a[normalize-space(text())='+']"));
//         for (var i = 0; i < 30000; i++) {
//             this.click(x("//a[normalize-space(text())='+']"));
//         }
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='+']"));
//     });
// casper.waitForSelector("input#buy-num",
//     function success() {
//         this.test.assertExists("input#buy-num");
//         //    console.log(this.getElementAttribute("input#buy-num",'value'));
//         value = this.evaluate(function() {
//             return $("input#buy-num").val();
//         });
//         this.test.assertEquals(value, '9999', "测试 - 98：商品详情页面，数量处点击加号，最多加至9999")
//     },
//     function fail() {
//         this.test.assertExists("input#buy-num");
//     });
// // testcase 99
// casper.waitForSelector(x("//a[normalize-space(text())='-']"),
//     function success() {
//         this.test.assertExists(x("//a[normalize-space(text())='-']"));
//         for (var i = 0; i < 30000; i++) {
//             this.click(x("//a[normalize-space(text())='-']"));
//         }
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='-']"));
//     });
// casper.waitForSelector("input#buy-num",
//     function success() {
//         this.test.assertExists("input#buy-num");
//         //    console.log(this.getElementAttribute("input#buy-num",'value'));
//         value = this.evaluate(function() {
//             return $("input#buy-num").val();
//         });
//         this.test.assertEquals(value, '1', "测试 - 99：商品详情页面，数量处点击减号号，最少减至1")
//     },
//     function fail() {
//         this.test.assertExists("input#buy-num");
//     });
// // testcase 115
// casper.thenOpen(BaseUrl+'news_list.html', function() {});
// for(var i = 2;i<6;i++){
// 	(function(i){
// 		var news_title;
// 		var tabStr = ['','nongyexinwen','gongsidongtai','hangqingfenxi','zhihuinongye'];
// 		casper.waitForSelector('.news_tab li:nth-child('+i+')',
//        function success() {
//            this.test.assertExists('.news_tab li:nth-child('+i+')');
//            // news_title = this.getHTML('.index_details_tab li:nth-child('+i+') a');
//            // console.log(news_title);
//            this.click('.news_tab li:nth-child('+i+') a');
//            casper.wait(3000);
// 			casper.waitForSelector(".news_list li:nth-child(1)",
// 	       	function success() {
// 	           this.test.assertExists(".news_list li:nth-child(1)");
// 	           value = this.evaluate(function() {
// 	            	return $(".news_list li:nth-child(1) .news_category").attr('class');
// 	        	});

// 	           console.log(i);
// 	           console.log(value);
// 	           	this.test.assertEquals(value.indexOf(tabStr[i])!=-1, true, "测试 - 115：资料列表展示对应分类下的全部资讯")
// 	       	},
// 	       	function fail() {
// 	           this.test.assertExists(".news_list li:nth-child(1)");
// 	   		});
//        },
//        function fail() {
//            this.test.assertExists('.news_tab li:nth-child('+i+')');
//    		});

// 	}(i))
// }

// // testcase 116
// casper.thenOpen(BaseUrl+"news_list.html",function() {});
// var newsTitle;
// casper.waitForSelector(".news_list ul li:nth-child(1)",
//    function success() {
//        this.test.assertExists(".news_list ul li:nth-child(1)");
//        newsTitle = this.getHTML(".news_list ul li:nth-child(1) a .news_title").slice(0,10);
//        this.click(".news_list ul li:nth-child(1) .image img");
//    },
//    function fail() {
//        this.test.assertExists(".row.ng-scope:nth-child(1) .ng-scope:nth-child(1) .ng-binding");
// });
// casper.waitForSelector(".news_detail h2",
//    function success() {
//        this.test.assertExists(".news_detail h2");
//        this.click(".news_detail h2");
//    },
//    function fail() {
//        this.test.assertExists(".news_detail h2");
// });
// casper.waitForSelector(".news_detail h2",
//    function success() {
//        this.test.assertExists(".news_detail h2");
//        this.test.assertEquals(this.getHTML(".news_detail h2").indexOf(newsTitle) === 0,true,"测试 - 116: 1.进入新农资讯列表页 2.点击资讯名称（资讯摘要、资讯图片）跳转到对应的资讯详情页");
//    },
//    function fail() {
//        this.test.assertExists(".news_detail h2");
// });
// //testcase 117
// casper.thenOpen(BaseUrl+"news_list.html",function() {});
// var newsTitle;
// casper.waitForSelector(".news_list ul li:nth-child(1)",
//    function success() {
//        this.test.assertExists(".news_list ul li:nth-child(1)");
//        newsTitle = this.getHTML(".news_list ul li:nth-child(1) .news_title").slice(0,10);
//        this.click(".news_list ul li:nth-child(1) .image img");
//    },
//    function fail() {
//        this.test.assertExists(".row.ng-scope:nth-child(1) .ng-scope:nth-child(1) .ng-binding");
// });
// casper.waitForSelector(".news_detail h2",
//    function success() {
//        this.test.assertExists(".news_detail h2");
//        this.click(".news_detail h2");
//    },
//    function fail() {
//        this.test.assertExists(".news_detail h2");
// });
// casper.waitForSelector(".news_detail h2",
//    function success() {
//        this.test.assertExists(".news_detail h2");
//        this.test.assertEquals(this.getHTML(".news_detail h2").indexOf(newsTitle) === 0,true,"测试 - 117: 点击资讯标题 跳转到对应的资讯详情页");
//    },
//    function fail() {
//        this.test.assertExists(".news_detail h2");
// });




// // testcase7 shopping
// casper.thenOpen(BaseUrl+'/logon.html?tab=1', function() {
// this.sendKeys('#login_account', '18610240422', {keepFocus: true});
// this.sendKeys('#login_password', '123123', {keepFocus: true});

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);


// casper.waitForSelector(".buy a",
// function success() {
//     this.test.assertExists(".buy a");
//     this.click(".buy a");
// },
// function fail() {
//     this.test.assertExists(".buy a");
// });
// casper.waitForSelector(".cart_box .item-list .item-item:nth-child(1) input#buy-num",
//     function success() {
//         this.test.assertExists(".cart_box .item-list .item-item:nth-child(1) input#buy-num");
//         //    console.log(this.getElementAttribute("input#buy-num",'value'));
//         value = this.evaluate(function() {
//             return $(".cart_box .item-list .item-item:nth-child(1) input#buy-num").val();
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#buy-num");
//     });
// casper.waitForSelector(".cart_box .item-list .item-item:nth-child(1) .btn-add",
//     function success() {
//         for (var i = 0; i < 30000; i++) {
//             this.click(".cart_box .item-list .item-item:nth-child(1) .btn-add");
//         }
//         value = this.evaluate(function() {
//             return $(".cart_box .item-list .item-item:nth-child(1) input#buy-num").val();
//         });
//         this.test.assertEquals(value, '9999', "测试 - 7 shopping：对某个商品的数量处点击加号，数量处点击加号，最多加至9999");
//     },
//     function fail() {
//         this.test.assertExists(".cart_box .item-list .item-item:nth-child(1) .btn-add");
//     });
// testcase8 shopping
// casper.waitForSelector(".cart_box .item-list .item-item:nth-child(1) .btn-reduce",
//     function success() {
//         this.test.assertExists(".cart_box .item-list .item-item:nth-child(1) .btn-reduce");
//         for (var i = 0; i < 30000; i++) {
//             this.click(".cart_box .item-list .item-item:nth-child(1) .btn-reduce");
//         }
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='-']"));
//     });
// casper.waitForSelector("input#buy-num",
//     function success() {
//         this.test.assertExists("input#buy-num");
//         //    console.log(this.getElementAttribute("input#buy-num",'value'));
//         value = this.evaluate(function() {
//             return $("input#buy-num").val();
//         });
//         this.test.assertEquals(value, '1', "测试 - 8 shopping：对某个商品的数量处点击减号，数量处点击减号号，最少减至1");
//     },
//     function fail() {
//         this.test.assertExists("input#buy-num");
//     });
// phantom.clearCookies();
// testcase13 shopping
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });
// casper.wait(3000);
// casper.waitForSelector('.item-list .item-item:nth-child(1) .p-ops a',
//     function success() {
//         this.test.assertExists('.item-list .item-item:nth-child(1) .p-ops a');
//         this.click('.item-list .item-item:nth-child(1) .p-ops a');
//     },
//     function fail() {
//         this.test.assertExists('.item-list .item-item:nth-child(1) .p-ops a');
//     });
// testcase19,35 shopping
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         console.log(this.getTitle());
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });
// casper.wait(3000);
// casper.waitForSelector('.submit-btn a',
//     function success() {
//         this.test.assertExists('.submit-btn a');
//         console.log(this.getTitle());
//         this.click('.submit-btn a');
//     },
//     function fail() {
//         this.test.assertExists('.submit-btn a');
//     });
// casper.wait(3000);
// casper.waitForSelector('.options-box .submit-btn a',
//        function success() {
//            this.test.assertExists('.options-box .submit-btn a');
//            console.log(this.getTitle());
//            this.click('.options-box .submit-btn a');
//        },
//        function fail() {
//            this.test.assertExists('.options-box .submit-btn a');
//    });
// casper.waitForSelector('.sweet-alert', function() {                  //
//        this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请填写您的收货地址','testcase19,35 shopping - 1.进入结算页面2.没有收货地址	文字展示”您还没有收货地址，请添加新地址“');
//    }, function() {
//        this.die('Timeout reached. Fail whale?').exit();             //
//    }, 3000);
// phantom.clearCookies();

// testcase21 shopping
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         console.log(this.getTitle());
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });
// casper.wait(3000);
// casper.waitForSelector('.submit-btn a',
//     function success() {
//         this.test.assertExists('.submit-btn a');
//         this.click('.submit-btn a');
//     },
//     function fail() {
//         this.test.assertExists('.submit-btn a');
//     });
// casper.wait(3000);
// casper.waitForSelector('.addNewAddBtn a',
//     function success() {
//         this.test.assertExists('.addNewAddBtn a');
//         this.click('.addNewAddBtn a');
//     },
//     function fail() {
//         this.test.assertExists('.addNewAddBtn a');
//     });
// casper.waitForSelector('#D4', function() { //
//     this.test.assertExists('#D4', 'testcase21 shopping: 1.结算页面，点击添加新地址按钮	弹出添加新地址页面');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// phantom.clearCookies();


// //testcase21,24 shopping
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         console.log(this.getTitle());
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });
// casper.wait(3000);
// casper.waitForSelector('.submit-btn a',
//     function success() {
//         this.test.assertExists('.submit-btn a');
//         this.click('.submit-btn a');
//     },
//     function fail() {
//         this.test.assertExists('.submit-btn a');
//     });
// casper.wait(3000);
// casper.waitForSelector('.addNewAddBtn a',
//     function success() {
//         this.test.assertExists('.addNewAddBtn a');
//         this.click('.addNewAddBtn a');
//     },
//     function fail() {
//         this.test.assertExists('.addNewAddBtn a');
//     });
// casper.waitForSelector('#D4', function() { //
//     this.test.assertExists('#D4', 'testcase21 shopping: 1.结算页面，点击添加新地址按钮	弹出添加新地址页面');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// casper.waitForSelector("#D4 textarea",
//     function success() {
//         this.test.assertExists("#D4 textarea");
//         this.click("#D4 textarea");
//     },
//     function fail() {
//         this.test.assertExists("#D4 textarea");
//     });
// casper.waitForSelector("#D4 textarea",
//     function success() {
//         this.sendKeys("#D4 textarea", "123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 textarea");
//     });
// casper.waitForSelector("#D4 .shouhuoren.ng-pristine.ng-valid",
//     function success() {
//         this.sendKeys("#D4 .shouhuoren.ng-pristine.ng-valid", "123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 .shouhuoren.ng-pristine.ng-valid");
//     });
// casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//     function success() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//         this.click("#D4 .mobile-num.ng-pristine.ng-valid");
//     },
//     function fail() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//     });
// casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//     function success() {
//         this.sendKeys("#D4 .mobile-num.ng-pristine.ng-valid", "18610240422", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//     });
// casper.waitForSelector('#D4 .tijiao',
//     function success() {
//         this.test.assertExists('#D4 .tijiao');
//         this.click('#D4 .tijiao');
//     },
//     function fail() {
//         this.test.assertExists('#D4 .tijiao');
//     });
// casper.waitForSelector('.sweet-alert', function() { //
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '添加地址成功', 'testcase21,24 : shopping - 1.进入结算页面2.没有收货地址	文字展示”您还没有收货地址，请添加新地址“');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// phantom.clearCookies();

// //testcase23 shopping
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         console.log(this.getTitle());
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });
// casper.wait(3000);
// casper.waitForSelector('.submit-btn a',
//     function success() {
//         this.test.assertExists('.submit-btn a');
//         this.click('.submit-btn a');
//     },
//     function fail() {
//         this.test.assertExists('.submit-btn a');
//     });
// casper.wait(3000);
// casper.waitForSelector('.consignee-cont',
//     function success() {
//         this.test.assertExists('.consignee-cont');
//         this.click('.consignee-cont ul li:nth-child(1) .opt a:nth-child(1)');
//     },
//     function fail() {
//         this.test.assertExists('.consignee-cont');
//     });
//     casper.waitForSelector("#D3 textarea",
//         function success() {
//             this.test.assertExists("#D3 textarea","testcase23 shopping: 1.结算页面，对某个地址点击编辑	弹出编辑地址页面");
//         },
//         function fail() {
//             this.test.assertExists("#D4 textarea");
//         });

//     phantom.clearCookies();

// //testcase22 shopping
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         console.log(this.getTitle());
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });
// casper.wait(3000);
// casper.waitForSelector('.submit-btn a',
//     function success() {
//         this.test.assertExists('.submit-btn a');
//         this.click('.submit-btn a');
//     },
//     function fail() {
//         this.test.assertExists('.submit-btn a');
//     });
// casper.wait(3000);
// casper.waitForSelector('.consignee-cont',
//     function success() {
//         this.test.assertExists('.consignee-cont');
//         this.click('.consignee-cont ul li:nth-child(1) .opt a:nth-child(2)');
//     },
//     function fail() {
//         this.test.assertExists('.consignee-cont');
//     });
//     casper.waitForSelector('.sweet-alert', function() { //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '删除成功', 'testcase22 shopping - 1.结算页面，对某个地址点击删除	删除地址');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit(); //
//     }, 3000);
//     phantom.clearCookies();

//     //testcase25 shopping
//     casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//         this.sendKeys('#login_account', '18610240422', {
//             keepFocus: true
//         });
//         this.sendKeys('#login_password', '123123', {
//             keepFocus: true
//         });

//     });
//     casper.thenClick('.login_btn a');
//     casper.wait(3000);

//     casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//         function success() {
//             this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//             this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         },
//         function fail() {
//             this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//         });
//     casper.wait(3000);
//     casper.waitForSelector(".buy a",
//         function success() {
//             this.test.assertExists(".buy a");
//             console.log(this.getTitle());
//             this.click(".buy a");
//         },
//         function fail() {
//             this.test.assertExists(".buy a");
//         });
//     casper.wait(3000);
//     casper.waitForSelector('.submit-btn a',
//         function success() {
//             this.test.assertExists('.submit-btn a');
//             this.click('.submit-btn a');
//         },
//         function fail() {
//             this.test.assertExists('.submit-btn a');
//         });
//     casper.wait(3000);
//     casper.waitForSelector('.addNewAddBtn a',
//         function success() {
//             this.test.assertExists('.addNewAddBtn a');
//             this.click('.addNewAddBtn a');
//         },
//         function fail() {
//             this.test.assertExists('.addNewAddBtn a');
//         });
//     casper.waitForSelector('#D4', function() { //
//         this.test.assertExists('#D4', 'testcase21 shopping: 1.结算页面，点击添加新地址按钮	弹出添加新地址页面');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit(); //
//     }, 3000);
//     casper.waitForSelector("#D4 .shouhuoren.ng-pristine.ng-valid",
//         function success() {
//             this.sendKeys("#D4 .shouhuoren.ng-pristine.ng-valid", "123", {
//                 keepFocus: true
//             });
//         },
//         function fail() {
//             this.test.assertExists("#D4 .shouhuoren.ng-pristine.ng-valid");
//         });
//     casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//         function success() {
//             this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//             this.click("#D4 .mobile-num.ng-pristine.ng-valid");
//         },
//         function fail() {
//             this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//         });
//     casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//         function success() {
//             this.sendKeys("#D4 .mobile-num.ng-pristine.ng-valid", "18610240422", {
//                 keepFocus: true
//             });
//         },
//         function fail() {
//             this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//         });
//     casper.waitForSelector('#D4 .tijiao',
//         function success() {
//             this.test.assertExists('#D4 .tijiao');
//             this.click('#D4 .tijiao');
//         },
//         function fail() {
//             this.test.assertExists('#D4 .tijiao');
//         });
//     casper.waitForSelector('.sweet-alert', function() { //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请填写详细地址', 'testcase25 : shopping - "1.进入添加地址页面 2.未填写详细地址，点击提交"	提示“请填写详细地址”');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit(); //
//     }, 3000);
//     phantom.clearCookies();
//     //testcase26 shopping
//     casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//         this.sendKeys('#login_account', '18610240422', {
//             keepFocus: true
//         });
//         this.sendKeys('#login_password', '123123', {
//             keepFocus: true
//         });

//     });
//     casper.thenClick('.login_btn a');
//     casper.wait(3000);

//     casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//         function success() {
//             this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//             this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         },
//         function fail() {
//             this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//         });
//     casper.wait(3000);
//     casper.waitForSelector(".buy a",
//         function success() {
//             this.test.assertExists(".buy a");
//             console.log(this.getTitle());
//             this.click(".buy a");
//         },
//         function fail() {
//             this.test.assertExists(".buy a");
//         });
//     casper.wait(3000);
//     casper.waitForSelector('.submit-btn a',
//         function success() {
//             this.test.assertExists('.submit-btn a');
//             this.click('.submit-btn a');
//         },
//         function fail() {
//             this.test.assertExists('.submit-btn a');
//         });
//     casper.wait(3000);
//     casper.waitForSelector('.addNewAddBtn a',
//         function success() {
//             this.test.assertExists('.addNewAddBtn a');
//             this.click('.addNewAddBtn a');
//         },
//         function fail() {
//             this.test.assertExists('.addNewAddBtn a');
//         });
//     casper.waitForSelector('#D4', function() { //
//         this.test.assertExists('#D4', 'testcase21 shopping: 1.结算页面，点击添加新地址按钮	弹出添加新地址页面');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit(); //
//     }, 3000);
//     casper.waitForSelector("#D4 textarea",
//         function success() {
//             this.test.assertExists("#D4 textarea");
//             this.click("#D4 textarea");
//         },
//         function fail() {
//             this.test.assertExists("#D4 textarea");
//         });
//     casper.waitForSelector("#D4 textarea",
//         function success() {
//             this.sendKeys("#D4 textarea", "123", {
//                 keepFocus: true
//             });
//         },
//         function fail() {
//             this.test.assertExists("#D4 textarea");
//         });
//     casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//         function success() {
//             this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//             this.click("#D4 .mobile-num.ng-pristine.ng-valid");
//         },
//         function fail() {
//             this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//         });
//     casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//         function success() {
//             this.sendKeys("#D4 .mobile-num.ng-pristine.ng-valid", "18610240422", {
//                 keepFocus: true
//             });
//         },
//         function fail() {
//             this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//         });
//     casper.waitForSelector('#D4 .tijiao',
//         function success() {
//             this.test.assertExists('#D4 .tijiao');
//             this.click('#D4 .tijiao');
//         },
//         function fail() {
//             this.test.assertExists('#D4 .tijiao');
//         });
//     casper.waitForSelector('.sweet-alert', function() { //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请填写收件人姓名', 'testcase26 : shopping - "1.进入添加地址页面 2.未填写姓名，点击提交"	提示“请填写收件人姓名”');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit(); //
//     }, 3000);
//     phantom.clearCookies();

//     //testcase27 shopping
//     casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//         this.sendKeys('#login_account', '18610240422', {
//             keepFocus: true
//         });
//         this.sendKeys('#login_password', '123123', {
//             keepFocus: true
//         });

//     });
//     casper.thenClick('.login_btn a');
//     casper.wait(3000);

//     casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//         function success() {
//             this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//             this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         },
//         function fail() {
//             this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//         });
//     casper.wait(3000);
//     casper.waitForSelector(".buy a",
//         function success() {
//             this.test.assertExists(".buy a");
//             console.log(this.getTitle());
//             this.click(".buy a");
//         },
//         function fail() {
//             this.test.assertExists(".buy a");
//         });
//     casper.wait(3000);
//     casper.waitForSelector('.submit-btn a',
//         function success() {
//             this.test.assertExists('.submit-btn a');
//             this.click('.submit-btn a');
//         },
//         function fail() {
//             this.test.assertExists('.submit-btn a');
//         });
//     casper.wait(3000);
//     casper.waitForSelector('.addNewAddBtn a',
//         function success() {
//             this.test.assertExists('.addNewAddBtn a');
//             this.click('.addNewAddBtn a');
//         },
//         function fail() {
//             this.test.assertExists('.addNewAddBtn a');
//         });
//     casper.waitForSelector('#D4', function() { //
//         this.test.assertExists('#D4', 'testcase21 shopping: 1.结算页面，点击添加新地址按钮	弹出添加新地址页面');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit(); //
//     }, 3000);
//     casper.waitForSelector("#D4 textarea",
//         function success() {
//             this.test.assertExists("#D4 textarea");
//             this.click("#D4 textarea");
//         },
//         function fail() {
//             this.test.assertExists("#D4 textarea");
//         });
//     casper.waitForSelector("#D4 textarea",
//         function success() {
//             this.sendKeys("#D4 textarea", "123", {
//                 keepFocus: true
//             });
//         },
//         function fail() {
//             this.test.assertExists("#D4 textarea");
//         });
//         casper.waitForSelector("#D4 .shouhuoren.ng-pristine.ng-valid",
//             function success() {
//                 this.sendKeys("#D4 .shouhuoren.ng-pristine.ng-valid", "123", {
//                     keepFocus: true
//                 });
//             },
//             function fail() {
//                 this.test.assertExists("#D4 .shouhuoren.ng-pristine.ng-valid");
//             });
//     casper.waitForSelector('#D4 .tijiao',
//         function success() {
//             this.test.assertExists('#D4 .tijiao');
//             this.click('#D4 .tijiao');
//         },
//         function fail() {
//             this.test.assertExists('#D4 .tijiao');
//         });
//     casper.waitForSelector('.sweet-alert', function() { //
//         this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请填写电话', 'testcase27 : shopping - "1.进入添加地址页面 2.未填写手机号，点击提交"	提示“请填写收件人手机号”');
//     }, function() {
//         this.die('Timeout reached. Fail whale?').exit(); //
//     }, 3000);
//     phantom.clearCookies();
// testcase28 shopping
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         console.log(this.getTitle());
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });
// casper.wait(3000);
// casper.waitForSelector('.submit-btn a',
//     function success() {
//         this.test.assertExists('.submit-btn a');
//         this.click('.submit-btn a');
//     },
//     function fail() {
//         this.test.assertExists('.submit-btn a');
//     });
// casper.wait(3000);
// casper.waitForSelector('.addNewAddBtn a',
//     function success() {
//         this.test.assertExists('.addNewAddBtn a');
//         this.click('.addNewAddBtn a');
//     },
//     function fail() {
//         this.test.assertExists('.addNewAddBtn a');
//     });
// casper.waitForSelector('#D4', function() { //
//     this.test.assertExists('#D4', 'testcase21 shopping: 1.结算页面，点击添加新地址按钮	弹出添加新地址页面');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// casper.waitForSelector("#D4 textarea",
//     function success() {
//         this.test.assertExists("#D4 textarea");
//         this.click("#D4 textarea");
//     },
//     function fail() {
//         this.test.assertExists("#D4 textarea");
//     });
// casper.waitForSelector("#D4 textarea",
//     function success() {
//         this.sendKeys("#D4 textarea", "123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 textarea");
//     });
// casper.waitForSelector("#D4 .shouhuoren.ng-pristine.ng-valid",
//     function success() {
//         this.sendKeys("#D4 .shouhuoren.ng-pristine.ng-valid", "123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 .shouhuoren.ng-pristine.ng-valid");
//     });
// casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//     function success() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//         this.click("#D4 .mobile-num.ng-pristine.ng-valid");
//     },
//     function fail() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//     });
// casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//     function success() {
//         this.sendKeys("#D4 .mobile-num.ng-pristine.ng-valid", "11111111", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//     });
// casper.waitForSelector('#D4 .tijiao',
//     function success() {
//         this.test.assertExists('#D4 .tijiao');
//         this.click('#D4 .tijiao');
//     },
//     function fail() {
//         this.test.assertExists('#D4 .tijiao');
//     });
// casper.waitForSelector('.sweet-alert', function() { //
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请填写正确的电话', 'testcase28 : shopping - "1.进入添加地址页面 2.未填写手机号，点击提交"	提示“请填写收件人手机号”');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// phantom.clearCookies();

// //testcase29 shopping
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         console.log(this.getTitle());
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });
// casper.wait(3000);
// casper.waitForSelector('.submit-btn a',
//     function success() {
//         this.test.assertExists('.submit-btn a');
//         this.click('.submit-btn a');
//     },
//     function fail() {
//         this.test.assertExists('.submit-btn a');
//     });
// casper.wait(3000);
// casper.waitForSelector('.addNewAddBtn a',
//     function success() {
//         this.test.assertExists('.addNewAddBtn a');
//         this.click('.addNewAddBtn a');
//     },
//     function fail() {
//         this.test.assertExists('.addNewAddBtn a');
//     });
// casper.waitForSelector('#D4', function() { //
//     this.test.assertExists('#D4', 'testcase21 shopping: 1.结算页面，点击添加新地址按钮	弹出添加新地址页面');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// casper.waitForSelector("#D4 textarea",
//     function success() {
//         this.test.assertExists("#D4 textarea");
//         this.click("#D4 textarea");
//     },
//     function fail() {
//         this.test.assertExists("#D4 textarea");
//     });
// casper.waitForSelector("#D4 textarea",
//     function success() {
//         this.sendKeys("#D4 textarea", "123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 textarea");
//     });
// casper.waitForSelector("#D4 .shouhuoren.ng-pristine.ng-valid",
//     function success() {
//         this.sendKeys("#D4 .shouhuoren.ng-pristine.ng-valid", "123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 .shouhuoren.ng-pristine.ng-valid");
//     });
// casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//     function success() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//         this.click("#D4 .mobile-num.ng-pristine.ng-valid");
//     },
//     function fail() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//     });
// casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//     function success() {
//         this.sendKeys("#D4 .mobile-num.ng-pristine.ng-valid", "18610240422", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//     });
// casper.waitForSelector('#D4 .tijiao',
//     function success() {
//         this.test.assertExists('#D4 .tijiao');
//         this.click('#D4 .tijiao');
//     },
//     function fail() {
//         this.test.assertExists('#D4 .tijiao');
//     });
// casper.waitForSelector('.sweet-alert', function() { //
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '添加地址成功', 'testcase21,24 : shopping - 1.进入结算页面2.没有收货地址	文字展示”您还没有收货地址，请添加新地址“');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         console.log(this.getTitle());
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });
// casper.wait(3000);
// casper.waitForSelector('.submit-btn a',
//     function success() {
//         this.test.assertExists('.submit-btn a');
//         this.click('.submit-btn a');
//     },
//     function fail() {
//         this.test.assertExists('.submit-btn a');
//     });
// casper.wait(3000);
// casper.waitForSelector('.consignee-cont',
//     function success() {
//         this.test.assertExists('.consignee-cont');
//         this.click('.consignee-cont ul li:nth-child(1) .opt a:nth-child(1)');
//     },
//     function fail() {
//         this.test.assertExists('.consignee-cont');
//     });
// casper.waitForSelector("#D3 textarea",
//     function success() {
//         var address = this.evaluate(function() {
//             return $('#D3 textarea').val();
//         });
//         var shouhuoren = this.evaluate(function() {
//             return $('#D3 .shouhuoren').val();
//         });
//         var mobile_num = this.evaluate(function() {
//             return $('#D3 .mobile-num').val();
//         });
//         this.test.assertEquals(address, '123', 'testcase29 shopping - 编辑地址展示原地址信息');
//         this.test.assertEquals(shouhuoren, '123', 'testcase29 shopping - 编辑地址展示原地址信息');
//         this.test.assertEquals(mobile_num, '18610240422', 'testcase29 shopping - 编辑地址展示原地址信息');
//     },
//     function fail() {
//         this.test.assertExists("#D4 textarea");
//     });

// phantom.clearCookies();

// testcase31 shopping
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         console.log(this.getTitle());
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });
// casper.wait(3000);
// casper.waitForSelector('.submit-btn a',
//     function success() {
//         this.test.assertExists('.submit-btn a');
//         this.click('.submit-btn a');
//     },
//     function fail() {
//         this.test.assertExists('.submit-btn a');
//     });
// casper.wait(3000);
// casper.waitForSelector('.addNewAddBtn a',
//     function success() {
//         this.test.assertExists('.addNewAddBtn a');
//         this.click('.addNewAddBtn a');
//     },
//     function fail() {
//         this.test.assertExists('.addNewAddBtn a');
//     });
// casper.waitForSelector('#D4', function() { //
//     this.test.assertExists('#D4', 'testcase21 shopping: 1.结算页面，点击添加新地址按钮	弹出添加新地址页面');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// casper.waitForSelector("#D4 textarea",
//     function success() {
//         this.test.assertExists("#D4 textarea");
//         this.click("#D4 textarea");
//     },
//     function fail() {
//         this.test.assertExists("#D4 textarea");
//     });
// casper.waitForSelector("#D4 textarea",
//     function success() {
//         this.sendKeys("#D4 textarea", "123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 textarea");
//     });
// casper.waitForSelector("#D4 .shouhuoren.ng-pristine.ng-valid",
//     function success() {
//         this.sendKeys("#D4 .shouhuoren.ng-pristine.ng-valid", "123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 .shouhuoren.ng-pristine.ng-valid");
//     });
// casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//     function success() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//         this.click("#D4 .mobile-num.ng-pristine.ng-valid");
//     },
//     function fail() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//     });
// casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//     function success() {
//         this.sendKeys("#D4 .mobile-num.ng-pristine.ng-valid", "18610240422", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//     });
// casper.waitForSelector('#D4 .tijiao',
//     function success() {
//         this.test.assertExists('#D4 .tijiao');
//         this.click('#D4 .tijiao');
//     },
//     function fail() {
//         this.test.assertExists('#D4 .tijiao');
//     });
// casper.waitForSelector('.sweet-alert', function() { //
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '添加地址成功', 'testcase21,24 : shopping - 1.进入结算页面2.没有收货地址	文字展示”您还没有收货地址，请添加新地址“');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         console.log(this.getTitle());
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });
// casper.wait(3000);
// casper.waitForSelector('.submit-btn a',
//     function success() {
//         this.test.assertExists('.submit-btn a');
//         this.click('.submit-btn a');
//     },
//     function fail() {
//         this.test.assertExists('.submit-btn a');
//     });
// casper.wait(3000);
// casper.waitForSelector('.consignee-cont',
//     function success() {
//         this.test.assertExists('.consignee-cont');
//         this.click('.consignee-cont ul li:nth-child(1) .opt a:nth-child(1)');
//     },
//     function fail() {
//         this.test.assertExists('.consignee-cont');
//     });
//     casper.waitForSelector("#D3 textarea",
//         function success() {
//             this.test.assertExists("#D3 textarea");
//             this.click("#D3 textarea");
//         },
//         function fail() {
//             this.test.assertExists("#D3 textarea");
//         });
//     casper.waitForSelector("#D3 textarea",
//         function success() {
//             this.sendKeys("#D3 textarea", "新修改的地址", {
//                 keepFocus: true
//             });
//         },
//         function fail() {
//             this.test.assertExists("#D3 textarea");
//         });
//         casper.waitForSelector('#D3 .tijiao',
//             function success() {
//                 this.test.assertExists('#D3 .tijiao');
//                 this.click('#D3 .tijiao');
//             },
//             function fail() {
//                 this.test.assertExists('#D3 .tijiao');
//             });
//         casper.waitForSelector('.sweet-alert', function() { //
//             this.test.assertEquals(casper.getHTML('.sweet-alert p'), '修改地址成功', 'testcase31 : shopping - 1.进入编辑地址页面，修改地址	判断逻辑同添加地址，修改成功提示“修改地址成功”');
//         }, function() {
//             this.die('Timeout reached. Fail whale?').exit(); //
//         }, 3000);
// phantom.clearCookies();
// testcase36 shopping
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         console.log(this.getTitle());
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });
// casper.wait(3000);
// casper.waitForSelector('.submit-btn a',
//     function success() {
//         this.test.assertExists('.submit-btn a');
//         this.click('.submit-btn a');
//     },
//     function fail() {
//         this.test.assertExists('.submit-btn a');
//     });
// casper.wait(3000);
// casper.waitForSelector('.addNewAddBtn a',
//     function success() {
//         this.test.assertExists('.addNewAddBtn a');
//         this.click('.addNewAddBtn a');
//     },
//     function fail() {
//         this.test.assertExists('.addNewAddBtn a');
//     });
// casper.waitForSelector('#D4', function() { //
//     this.test.assertExists('#D4', 'testcase21 shopping: 1.结算页面，点击添加新地址按钮	弹出添加新地址页面');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// casper.waitForSelector("#D4 textarea",
//     function success() {
//         this.test.assertExists("#D4 textarea");
//         this.click("#D4 textarea");
//     },
//     function fail() {
//         this.test.assertExists("#D4 textarea");
//     });
// casper.waitForSelector("#D4 textarea",
//     function success() {
//         this.sendKeys("#D4 textarea", "123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 textarea");
//     });
// casper.waitForSelector("#D4 .shouhuoren.ng-pristine.ng-valid",
//     function success() {
//         this.sendKeys("#D4 .shouhuoren.ng-pristine.ng-valid", "123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 .shouhuoren.ng-pristine.ng-valid");
//     });
// casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//     function success() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//         this.click("#D4 .mobile-num.ng-pristine.ng-valid");
//     },
//     function fail() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//     });
// casper.waitForSelector("#D4 .mobile-num.ng-pristine.ng-valid",
//     function success() {
//         this.sendKeys("#D4 .mobile-num.ng-pristine.ng-valid", "18610240422", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("#D4 .mobile-num.ng-pristine.ng-valid");
//     });
// casper.waitForSelector('#D4 .tijiao',
//     function success() {
//         this.test.assertExists('#D4 .tijiao');
//         this.click('#D4 .tijiao');
//     },
//     function fail() {
//         this.test.assertExists('#D4 .tijiao');
//     });
// casper.waitForSelector('.sweet-alert', function() { //
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '添加地址成功', 'testcase21,24 : shopping - 1.进入结算页面2.没有收货地址	文字展示”您还没有收货地址，请添加新地址“');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);

// casper.waitForSelector(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1)",
//     function success() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//         this.click(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) .action_box_base.action_box_active");
//     },
//     function fail() {
//         this.test.assertExists(".clear.channel3 .wrap > .ng-scope:nth-child(2) .index_product_item.ng-scope:nth-child(1) img");
//     });
// casper.wait(3000);
// casper.waitForSelector(".buy a",
//     function success() {
//         this.test.assertExists(".buy a");
//         console.log(this.getTitle());
//         this.click(".buy a");
//     },
//     function fail() {
//         this.test.assertExists(".buy a");
//     });
// casper.wait(3000);
// casper.waitForSelector('.submit-btn a',
//     function success() {
//         this.test.assertExists('.submit-btn a');
//         this.click('.submit-btn a');
//     },
//     function fail() {
//         this.test.assertExists('.submit-btn a');
//     });
// casper.wait(3000);
// casper.waitForSelector('.consignee-cont',
//     function success() {
//         this.test.assertExists('.consignee-cont');
//         this.click('.consignee-cont ul li:nth-child(1) .opt a:nth-child(1)');
//     },
//     function fail() {
//         this.test.assertExists('.consignee-cont');
//     });
// casper.waitForSelector('.submit-btn a',
//     function success() {
//         this.test.assertExists('.submit-btn a');
//         this.click('.submit-btn a');
//     },
//     function fail() {
//         this.test.assertExists('.submit-btn a');
//     });
// casper.waitForSelector('.orderInfo',
//     function success() {
//         this.test.assertExists('.orderInfo');
//         this.test.assertEquals(this.getTitle(), '订单结算 - 新新农人', '1.进入结算页面2.点击提交订单	订单提交成功，存入数据库，进入支付方式页面')
//     },
//     function fail() {
//         this.test.assertExists('.orderInfo');
//     });
// phantom.clearCookies();

// testcase4 my_xxnr
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);
// casper.thenOpen(BaseUrl + '/my_xxnr.html', function() {

// });
// casper.wait(3000);
// casper.waitForSelector(".editable_button_not_editing",
//     function success() {
//         this.test.assertExists('.editable_button_not_editing');
//         this.click('.editable_button_not_editing');
//     },
//     function fail() {
//         this.test.assertExists('.editable_button_not_editing');
//     });
// casper.waitForSelector(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing",
//     function success() {
//         this.test.assertExists(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing");
//         this.click(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing");
//     },
//     function fail() {
//         this.test.assertExists(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing");
//     });
// casper.waitForSelector(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing",
//     function success() {
//         this.sendKeys(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing", "123123123123");
//     },
//     function fail() {
//         this.test.assertExists(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing");
//     });
// casper.waitForSelector(".editable_button_editing",
//     function success() {
//         this.test.assertExists('.editable_button_editing');
//         this.click('.editable_button_editing');
//     },
//     function fail() {
//         this.test.assertExists('.editable_button_editing');
//     });
// casper.waitForSelector('.sweet-alert', function() { //
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '昵称输入过长', 'testcase4 my_xxnr - 提示“昵称输入过长”，保持修改状态');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);

// testcase5 my_xxnr
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);
// casper.thenOpen(BaseUrl + '/my_xxnr.html', function() {

// });
// casper.wait(3000);
// casper.waitForSelector(".editable_button_not_editing",
//     function success() {
//         this.test.assertExists('.editable_button_not_editing');
//         this.click('.editable_button_not_editing');
//     },
//     function fail() {
//         this.test.assertExists('.editable_button_not_editing');
//     });
// casper.waitForSelector(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing",
//     function success() {
//         this.test.assertExists(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing");
//         this.click(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing");
//     },
//     function fail() {
//         this.test.assertExists(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing");
//     });
// casper.waitForSelector(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing",
//     function success() {
//         this.sendKeys(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing", "123123");
//     },
//     function fail() {
//         this.test.assertExists(".ng-isolate-scope.ng-pristine.ng-valid.editable_input_editing");
//     });
// casper.waitForSelector(".editable_button_editing",
//     function success() {
//         this.test.assertExists('.editable_button_editing');
//         this.click('.editable_button_editing');
//     },
//     function fail() {
//         this.test.assertExists('.editable_button_editing');
//     });
// casper.waitForSelector('.sweet-alert', function() { //
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '修改昵称成功', 'testcase5 my_xxnr - 提示“修改昵称成功”，保存并展示新昵称');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// //testcase21 my_xxnr
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);
// casper.thenOpen(BaseUrl + '/my_xxnr.html', function() {

// });
// casper.wait(3000);
// casper.waitForSelector(".modifyPassword",
//        function success() {
//            this.test.assertExists(".modifyPassword");
//            this.click(".modifyPassword");
//        },
//        function fail() {
//            this.test.assertExists(".modifyPassword");
//    });
// casper.wait(3000);
// casper.waitForSelector(x("//a[normalize-space(text())='确 认']"),
//       function success() {
//           this.test.assertExists(x("//a[normalize-space(text())='确 认']"));
//           this.click(x("//a[normalize-space(text())='确 认']"));
//       },
//       function fail() {
//           this.test.assertExists(x("//a[normalize-space(text())='确 认']"));
//   });
//   casper.wait(3000);
//   casper.waitForSelector('.sweet-alert', function() { //
//       this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请输入密码', 'testcase21 my_xxnr - 1.修改密码页面未填写原密码，点击确认	提示“请填写原密码”');
//   }, function() {
//       this.die('Timeout reached. Fail whale?').exit(); //
//   }, 3000);

// //testcase22 my_xxnr
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);
// casper.thenOpen(BaseUrl + '/my_xxnr.html', function() {

// });
// casper.wait(3000);
// casper.waitForSelector(".modifyPassword",
//     function success() {
//         this.test.assertExists(".modifyPassword");
//         this.click(".modifyPassword");
//     },
//     function fail() {
//         this.test.assertExists(".modifyPassword");
//     });
// casper.wait(3000);
// casper.waitForSelector("input#password",
//     function success() {
//         this.test.assertExists("input#password");
//         this.click("input#password");
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.waitForSelector("input#password",
//     function success() {
//         this.sendKeys("input#password", "123123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.wait(3000);
// casper.waitForSelector(x("//a[normalize-space(text())='确 认']"),
//     function success() {
//         this.test.assertExists(x("//a[normalize-space(text())='确 认']"));
//         this.click(x("//a[normalize-space(text())='确 认']"));
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='确 认']"));
//     });
// casper.wait(3000);

// casper.waitForSelector('.sweet-alert', function() { //
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请输入新密码', 'testcase22 my_xxnr - 1.修改密码页面未填写新密码，点击确认	提示“请填写新密码”');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// testcase23 my_xxnr
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);
// casper.thenOpen(BaseUrl + '/my_xxnr.html', function() {

// });
// casper.wait(3000);
// casper.waitForSelector(".modifyPassword",
//     function success() {
//         this.test.assertExists(".modifyPassword");
//         this.click(".modifyPassword");
//     },
//     function fail() {
//         this.test.assertExists(".modifyPassword");
//     });
// casper.wait(3000);
// casper.waitForSelector("input#password",
//     function success() {
//         this.test.assertExists("input#password");
//         this.click("input#password");
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.waitForSelector("input#password",
//     function success() {
//         this.sendKeys("input#password", "123123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.waitForSelector("input#password",
//     function success() {
//         this.test.assertExists("input#password");
//         this.click("input#password");
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.waitForSelector("input#password",
//     function success() {
//         this.sendKeys("input#password", "123123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.waitForSelector("input#new_password",
//     function success() {
//         this.test.assertExists("input#new_password");
//         this.click("input#new_password");
//     },
//     function fail() {
//         this.test.assertExists("input#new_password");
//     });
// casper.waitForSelector("input#new_password",
//     function success() {
//         this.sendKeys("input#new_password", "321321", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#new_password");
//     });
// casper.wait(3000);
// casper.waitForSelector(x("//a[normalize-space(text())='确 认']"),
//     function success() {
//         this.test.assertExists(x("//a[normalize-space(text())='确 认']"));
//         this.click(x("//a[normalize-space(text())='确 认']"));
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='确 认']"));
//     });
// casper.wait(3000);

// casper.waitForSelector('.sweet-alert', function() { //
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '请填写确认密码', 'testcase23 my_xxnr - 1.修改密码页面未填写确认密码，点击确认	提示“请填写确认密码”');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// testcase24 my_xxnr
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);
// casper.thenOpen(BaseUrl + '/my_xxnr.html', function() {

// });
// casper.wait(3000);
// casper.waitForSelector(".modifyPassword",
//     function success() {
//         this.test.assertExists(".modifyPassword");
//         this.click(".modifyPassword");
//     },
//     function fail() {
//         this.test.assertExists(".modifyPassword");
//     });
// casper.wait(3000);
// casper.waitForSelector("input#password",
//     function success() {
//         this.test.assertExists("input#password");
//         this.click("input#password");
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.waitForSelector("input#password",
//     function success() {
//         this.sendKeys("input#password", "123123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.waitForSelector("input#password",
//     function success() {
//         this.test.assertExists("input#password");
//         this.click("input#password");
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.waitForSelector("input#password",
//     function success() {
//         this.sendKeys("input#password", "asdasd", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.waitForSelector("input#new_password",
//     function success() {
//         this.test.assertExists("input#new_password");
//         this.click("input#new_password");
//     },
//     function fail() {
//         this.test.assertExists("input#new_password");
//     });
// casper.waitForSelector("input#new_password",
//     function success() {
//         this.sendKeys("input#new_password", "321321", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#new_password_cf");
//     });
// casper.waitForSelector("input#new_password_cf",
//     function success() {
//         this.test.assertExists("input#new_password_cf");
//         this.click("input#new_password");
//     },
//     function fail() {
//         this.test.assertExists("input#new_password_cf");
//     });
// casper.waitForSelector("input#new_password_cf",
//     function success() {
//         this.sendKeys("input#new_password_cf", "321321", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#new_password_cf");
//     });
// casper.wait(3000);
// casper.waitForSelector(x("//a[normalize-space(text())='确 认']"),
//     function success() {
//         this.test.assertExists(x("//a[normalize-space(text())='确 认']"));
//         this.click(x("//a[normalize-space(text())='确 认']"));
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='确 认']"));
//     });
// casper.wait(3000);

// casper.waitForSelector('.sweet-alert', function() { //
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '旧密码输入错误', 'testcase24 my_xxnr - 1.点击修改密码 2.填写错误原密码、新密码、确认密码，点击确认	提示“旧密码输入错误”');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// //testcase25 my_xxnr
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);
// casper.thenOpen(BaseUrl + '/my_xxnr.html', function() {

// });
// casper.wait(3000);
// casper.waitForSelector(".modifyPassword",
//     function success() {
//         this.test.assertExists(".modifyPassword");
//         this.click(".modifyPassword");
//     },
//     function fail() {
//         this.test.assertExists(".modifyPassword");
//     });
// casper.wait(3000);
// casper.waitForSelector("input#password",
//     function success() {
//         this.test.assertExists("input#password");
//         this.click("input#password");
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.waitForSelector("input#password",
//     function success() {
//         this.sendKeys("input#password", "123123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.waitForSelector("input#new_password",
//     function success() {
//         this.test.assertExists("input#new_password");
//         this.click("input#new_password");
//     },
//     function fail() {
//         this.test.assertExists("input#new_password");
//     });
// casper.waitForSelector("input#new_password",
//     function success() {
//         this.sendKeys("input#new_password", "123123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#new_password_cf");
//     });
// casper.waitForSelector("input#new_password_cf",
//     function success() {
//         this.test.assertExists("input#new_password_cf");
//         this.click("input#new_password");
//     },
//     function fail() {
//         this.test.assertExists("input#new_password_cf");
//     });
// casper.waitForSelector("input#new_password_cf",
//     function success() {
//         this.sendKeys("input#new_password_cf", "123123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#new_password_cf");
//     });
// casper.wait(3000);
// casper.waitForSelector(x("//a[normalize-space(text())='确 认']"),
//     function success() {
//         this.test.assertExists(x("//a[normalize-space(text())='确 认']"));
//         this.click(x("//a[normalize-space(text())='确 认']"));
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='确 认']"));
//     });
// casper.wait(3000);

// casper.waitForSelector('.sweet-alert', function() { //
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '新密码与旧密码不能一致', 'testcase25 my_xxnr - 1.点击修改密码 2.填写原密码、与原密码相同的新密码、确认密码，点击确认	提示“新密码与旧密码不能一致”');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);
// //testcase26 my_xxnr
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);
// casper.thenOpen(BaseUrl + '/my_xxnr.html', function() {

// });
// casper.wait(3000);
// casper.waitForSelector(".modifyPassword",
//     function success() {
//         this.test.assertExists(".modifyPassword");
//         this.click(".modifyPassword");
//     },
//     function fail() {
//         this.test.assertExists(".modifyPassword");
//     });
// casper.wait(3000);
// casper.waitForSelector("input#password",
//     function success() {
//         this.test.assertExists("input#password");
//         this.click("input#password");
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.waitForSelector("input#password",
//     function success() {
//         this.sendKeys("input#password", "123123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#password");
//     });
// casper.waitForSelector("input#new_password",
//     function success() {
//         this.test.assertExists("input#new_password");
//         this.click("input#new_password");
//     },
//     function fail() {
//         this.test.assertExists("input#new_password");
//     });
// casper.waitForSelector("input#new_password",
//     function success() {
//         this.sendKeys("input#new_password", "123123", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#new_password_cf");
//     });
// casper.waitForSelector("input#new_password_cf",
//     function success() {
//         this.test.assertExists("input#new_password_cf");
//         this.click("input#new_password");
//     },
//     function fail() {
//         this.test.assertExists("input#new_password_cf");
//     });
// casper.waitForSelector("input#new_password_cf",
//     function success() {
//         this.sendKeys("input#new_password_cf", "321321", {
//             keepFocus: true
//         });
//     },
//     function fail() {
//         this.test.assertExists("input#new_password_cf");
//     });
// casper.wait(3000);
// casper.waitForSelector(x("//a[normalize-space(text())='确 认']"),
//     function success() {
//         this.test.assertExists(x("//a[normalize-space(text())='确 认']"));
//         this.click(x("//a[normalize-space(text())='确 认']"));
//     },
//     function fail() {
//         this.test.assertExists(x("//a[normalize-space(text())='确 认']"));
//     });
// casper.wait(3000);

// casper.waitForSelector('.sweet-alert', function() { //
//     this.test.assertEquals(casper.getHTML('.sweet-alert p'), '两次密码不一致', 'testcase26 my_xxnr - 1.点击修改密码 2.填写原密码、新密码、确认密码，点击确认	提示“两次密码不一致”');
// }, function() {
//     this.die('Timeout reached. Fail whale?').exit(); //
// }, 3000);

// //testcase 34 my_xxnr
// casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
//     this.sendKeys('#login_account', '18610240422', {
//         keepFocus: true
//     });
//     this.sendKeys('#login_password', '123123', {
//         keepFocus: true
//     });

// });
// casper.thenClick('.login_btn a');
// casper.wait(3000);
// casper.thenOpen(BaseUrl + '/my_xxnr.html', function() {

// });
// casper.waitForSelector(x("//a[normalize-space(text())='新农代表']"),
//        function success() {
//            this.test.assertExists(x("//a[normalize-space(text())='新农代表']"));
//            this.click(x("//a[normalize-space(text())='新农代表']"));
//        },
//        function fail() {
//            this.test.assertExists(x("//a[normalize-space(text())='新农代表']"));
//    });
//    casper.waitForSelector(x("//a[normalize-space(text())='我的新农代表']"),
//        function success() {
//            this.test.assertExists(x("//a[normalize-space(text())='我的新农代表']"));
//            this.click(x("//a[normalize-space(text())='我的新农代表']"));
//        },
//        function fail() {
//            this.test.assertExists(x("//a[normalize-space(text())='我的新农代表']"));
//    });
//    casper.waitForSelector("input",
//        function success() {
//            this.test.assertExists("input");
//            this.click("input");
//        },
//        function fail() {
//            this.test.assertExists("input");
//    });
//    casper.waitForSelector("input",
//        function success() {
//            this.sendKeys("input", "18610240422");
//        },
//        function fail() {
//            this.test.assertExists("input");
//    });
//    casper.waitForSelector(x("//a[normalize-space(text())='添加代表人']"),
//        function success() {
//            this.test.assertExists(x("//a[normalize-space(text())='添加代表人']"));
//            this.click(x("//a[normalize-space(text())='添加代表人']"));
//        },
//        function fail() {
//            this.test.assertExists(x("//a[normalize-space(text())='添加代表人']"));
//    });
//    casper.waitForSelector('.sweet-alert', function() { //
//        this.test.assertEquals(casper.getHTML('.sweet-alert p'), '不能设置自己为邀请人', 'testcase34 my_xxnr - 1.点击我的新农代表2.输入用户自己的注册手机号3.点击添加新农代表	提示“不能设置自己为新农代表哦”');
//    }, function() {
//        this.die('Timeout reached. Fail whale?').exit(); //
//    });
   // // testcase 35 my_xxnr
   // casper.thenOpen(BaseUrl + '/logon.html?tab=1', function() {
   //     this.sendKeys('#login_account', '18610240422', {
   //         keepFocus: true
   //     });
   //     this.sendKeys('#login_password', '123123', {
   //         keepFocus: true
   //     });
   
   // });
   // casper.thenClick('.login_btn a');
   // casper.wait(3000);
   // casper.thenOpen(BaseUrl + '/my_xxnr.html', function() {
   
   // });
   // casper.waitForSelector(x("//a[normalize-space(text())='新农代表']"),
   //        function success() {
   //            this.test.assertExists(x("//a[normalize-space(text())='新农代表']"));
   //            this.click(x("//a[normalize-space(text())='新农代表']"));
   //        },
   //        function fail() {
   //            this.test.assertExists(x("//a[normalize-space(text())='新农代表']"));
   //    });
   //    casper.waitForSelector(x("//a[normalize-space(text())='我的新农代表']"),
   //        function success() {
   //            this.test.assertExists(x("//a[normalize-space(text())='我的新农代表']"));
   //            this.click(x("//a[normalize-space(text())='我的新农代表']"));
   //        },
   //        function fail() {
   //            this.test.assertExists(x("//a[normalize-space(text())='我的新农代表']"));
   //    });
   //    casper.waitForSelector("input",
   //        function success() {
   //            this.test.assertExists("input");
   //            this.click("input");
   //        },
   //        function fail() {
   //            this.test.assertExists("input");
   //    });
   //    casper.waitForSelector("input",
   //        function success() {
   //            this.sendKeys("input", "18600000000");
   //        },
   //        function fail() {
   //            this.test.assertExists("input");
   //    });
   //    casper.waitForSelector(x("//a[normalize-space(text())='添加代表人']"),
   //        function success() {
   //            this.test.assertExists(x("//a[normalize-space(text())='添加代表人']"));
   //            this.click(x("//a[normalize-space(text())='添加代表人']"));
   //        },
   //        function fail() {
   //            this.test.assertExists(x("//a[normalize-space(text())='添加代表人']"));
   //    });
   //    casper.waitForSelector('.sweet-alert', function() { //
   //        this.test.assertEquals(casper.getHTML('.sweet-alert p'), '该手机号未注册，请确认后重新输入', 'testcase35 my_xxnr - 1.点击我的新农代表2.输入未注册过的手机号3.点击添加新农代表	提示“该手机号未注册，请确认后重新输入”');
   //    }, function() {
   //        this.die('Timeout reached. Fail whale?').exit(); //
   //    });

casper.run(function() {
    this.test.renderResults(true); //输出检测结果
});
