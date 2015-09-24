/**
 * Created by alex.yang on 14-7-15.
 */
 
 // load shoppingCar
		$("#shoppingCar").click(function(){
			accessShoppingCar();
		});
		
window.RuiDa = window.RuiDa || {
    Module: {},
    Check: {},
    DeValue: {},
    Tool: {},
    Alert:{}
};
window.Rui=window.Rui||{
    Ajax:{},
    GetInfo:{}
};
window.Ksfc = window.Ksfc||{
    Dates:{}
};
window.publicweburl={'weburl1':'http://127.0.0.1:8070/','weburl2':''};
//window.publicweburl={'weburl1':'http://10.10.0.5:9999/xnr/','weburl2':''};
//http://10.10.0.8:8080/

window.Rui=(function(){
    var sus='';
    function Ajax(params, fun1, fun2) {
        sus = publicweburl.weburl1;
        $.ajax({
            url: sus + params.methodname,
            data: params,
            dataType: 'jsonp',
            /*type: "post",
            jsonp: "jsonpCallback",*/
            success: function (result) {
                if ($.isFunction(fun1)) {
                    fun1(result);
                }
            }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log('【error】 ' + textStatus + ' ' + errorThrown);
                if ($.isFunction(fun2)) {
                    fun2(XMLHttpRequest);
                }
            }
        });
    }
	
    function get(params, fun1, fun2){
	sus = publicweburl.weburl1;
        $.ajax({
            url: sus + params.methodname,
            data: params,
            dataType: 'json',
            type: "get",
            /* jsonp: "jsonpCallback",*/
            success: function (result) {
                if ($.isFunction(fun1)) {
                    fun1(result);
                }
            }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log('【error】 ' + textStatus + ' ' + errorThrown);
                if ($.isFunction(fun2)) {
                    fun2(XMLHttpRequest);
                }
            }
        });
    }
    return {
        Ajax:Ajax,
	get:get
    };
})();
RuiDa.Module = (function () {
    return{
        bindClickArr: bindClickArr,
        bindClickfnArr:bindClickfnArr,
        bindClickfn:bindClickfn,
        backUrl:backUrl,
        backHistory:backHistory,
        backHome:backHome,
        initIScroll:initIScroll,
        refreshIScroll:refreshIScroll,
        footerlogo:footerlogo
    };

    function footerlogo(index){
        for(var i=0;i<5;i++){
            bindchick(i);
        }
        function bindchick(i){
            $('footer nav').eq(i).bind('touchstart',function(){
                //console.log(i,strhred[i]);
                if(index!==i){
                    console.log(index,i);
                    if(i==2){
                        Rui.GetInfo.islogined();
                        var user=JSON.parse(sessionStorage.getItem('user'));
                        if(!user.memberRef||!user.memberRef.stuId){
                            console.log(3333333333333333333333);
                            window.location.href='../com/bindDiving.html?titlename=get';
                        }else{
                            window.location.href=strhred[i];
                        }
                    }else{
                        window.location.href=strhred[i];
                    }

                }
                //console.log(i,index);
            });
        }
    }
    function bindClickfnArr(arr,fn){
        console.log(arr);
        if (arr) {
            for (var key in arr)
                if (key && arr[key]) {
                    bindClickfn(arr[key],fn);
                }
        }
    }
    /*function bindClickfn(id,fn){
     $(id).bind('touchstart',function(){
     fn(this);
     });
     }*/
    function bindClickfn(id,fn){
        //console.log(1111,id);
        /*if(fn){
         $(id).click(function(){
         fn(this);
         });
         }*/
        if(fn){
            console.log(3333);
            $(id).on('touchstart', function (event) {
                //$(this).css('background-color','black');//测试
                var pageYStart = event.originalEvent.targetTouches[0].pageY;
                $(this).on('touchend', function (event) {
                    //$(this).css('background-color','');//测试
                    var pageYEnd = event.originalEvent.changedTouches[0].pageY;
                    //console.log(3333,id);
                    if (Math.abs(pageYStart - pageYEnd) < 30) {
                        //console.log('bindclickfn');
                        fn(this);
                        $(this).off('touchend');
                    }
                });
            });
        }
    }
    //绑定点击事件，isdelay不填写时为不延时，否则为延时
    function bindClickArr(arr, isdelay) {
        if (arr) {
            for (var key in arr)
                if (key && arr[key]) {
                    bindClickDelay(key, arr[key], isdelay);
                }
        }
    }
    function bindClickDelay(id, url, isdelay) {
        /*$(id).bind('touchstart',function(){
         window.location.href = url;
         });*/
        $(id).on('touchstart', function (event) {
            //$(this).css('background-color','black');//测试
            var pageYStart = event.originalEvent.targetTouches[0].pageY;
            $(this).on('touchend', function (event) {
                //$(this).css('background-color','');//测试
                var pageYEnd = event.originalEvent.changedTouches[0].pageY;
                //console.log(3333,id);
                if (Math.abs(pageYStart - pageYEnd) < 30) {
                    //console.log('bindclickfn');
                    window.location.href = url;
                    $(this).off('touchend');
                }
            });
        });
    }
    function backHome() {
        document.addEventListener("deviceready", function() {
            document.addEventListener("backbutton", function() {
                window.location.href = 'home.html';
            }, false);
        }, false);
    }

    function backHistory() {
        /* $('#backBtn').on('touchstart', function() {
         window.history.back();
         });*/
        $('#backBtn').on('click', function() {
            window.history.back();
        });
        document.addEventListener("deviceready", function() {
            document.addEventListener("backbutton", function() {
                window.history.back();
            }, false);
        }, false);
    }

    function backUrl(url) {
        console.log(2222222);
        //$('#backBtn').on('touchend', function () {
        $('#backBtn').on('touchstart', function () {
            window.location.href = url;
        });
        document.addEventListener("deviceready", function() {
            document.addEventListener("backbutton", function() {
                window.location.href = url;
            }, false);
        }, false);
    }

    //滚动初始化
    function initIScroll() {
        setTimeout(function () {
            window.iScroll = new iScroll('iScroll', {
                vScrollbar: false
            });
        }, 200);
    }

    //刷新滚动
    function refreshIScroll() {
        setTimeout(function () {
            window.iScroll.refresh();
        }, 200);
    }
})();
RuiDa.Module.backHistory();

RuiDa.Alert = {
    //显示一个定制的警告框，依赖于 PhoneGap
    //'手机号不能为空', '', '警告', '返回修改'
    showAlert: function (msg, bacFn, title, btnName) {
        if (navigator.notification) {
            navigator.notification.alert(
                msg,                 //要显示的信息
                function () {
                },       //警告被忽略的回调函数
                title,               //标题
                btnName || '好'             //按钮名称
            )
        } else {
            alert(msg)
        }
    },
    //弹出对话框，带回调，btn===1,为第一个按钮，btn===2为第二个按钮
    showConfirm:function(msg,title,backFn,btns){
        navigator.notification.confirm(
            msg,                 //要显示的信息
            backFn,             //警告被忽略的回调函数
            title,               //标题
            btns||'取消,确定'           //按钮名称
        )
    },
    //弹出框
    getAlert:function(msg,time){
        console.log('弹出框');
        $("body").append('<div class="alert"><span>'+msg+'</span></div>');
        setTimeout(function(){
            $('.alert').hide();
        },time?time:2000);
    }
};
RuiDa.Tool = {
    //获取url参数值
    GetRequest: function () {
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
            }
        }
        return theRequest;
        //调用方法
        //var Request = new Object();
        //Request = GetRequest();
        //var 参数1, 参数2, 参数3, 参数N;
        //参数1 = Request['参数1'];
    },
    getString:function(str,len){
        //return str;
        if(str.length&&str.length>len){
            return str.substring(0,len)+'...';
        }else{
            return str;
        }
    },
    //如果图片加载失败则加载默认图片
    getDefpicInit:function(){
        $(window).load(function() {
            $('img').each(function() {
                if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
                    this.src = 'img/default.gif';
                }
            });
        });
    },
    GetData: function(val){
        window.Time.UnixToDate(val);
    },
    GetToday:function(){
        var d = new Date(),str = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
        return str;
    },
    DateFormat:function(time){
        var   now=new  Date(time);
        var   year=now.getFullYear();
        var   month=now.getMonth()+1;
        var   date=now.getDate();
        return   year+"-"+month+"-"+date;
    },
    //判断设备类型
    deviceType: function () {
        var checker = {
            ios: navigator.userAgent.match(/(iPhone|iPod|iPad)/i),
            blackberry: navigator.userAgent.match(/BlackBerry/i),
            android: navigator.userAgent.match(/Android/i),
            windows: navigator.userAgent.match(/windows/i)
        };
        if (checker.android) {
            return "android";
        } else if (checker.ios) {
            return "ios";
        } else if (checker.blackberry) {
            return "blackberry";
        } else if (checker.windows) {
            return "windows";
        } else {
            return "";
        }
    }
};
//封装2
RuiDa.Check = {
    //【start】
    //检查是否为数字
    isCureNum:function(value){//"^[0-9]*$"
        //console.log('数字',value);
        if (value.match(/^[0-9]*$/) !== null)
            return true;
        else
            return false;
    },
    //检查是否为正整数
    isPositiveInteger: function(value) {
        if (value.match(/^([1-9]\d*|0)$/) !== null)
            return true;
        else
            return false;
    },

    //验证字符串长度value,最小长度min,最大长度max
    isCertainLength: function(value, min, max) {
        var len = value.length;
        if (len >= min && len <= max)
            return true;
        else
            return false;
    },

    //arr是否包含element
    isContains: function(arr, element) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === element)
                return true;
        }
        return false;
    },

    //验证大陆手机号
    isMHMobile: function(value) {
        var mob_preg = /^((\+?86)|(\(\+86\)))?1[3|4|5|7|8][0-9]{9}$/;
        if (!mob_preg.test(value))
            return false;
        else
            return true;
    },

    //验证邮箱
    isEmail: function(value) {
        var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
        return reg.test(value);
    }

    //【end】
};

/*
 RuiDa.Tool = {
 getString:function(str,len){
 //return str;
 if(str.length&&str.length>len){
 return str.substring(0,len)+'...';
 }else{
 return str;
 }
 },
 //如果图片加载失败则加载默认图片
 getDefpicInit:function(){
 $(window).load(function() {
 $('img').each(function() {
 if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
 this.src = 'img/default.gif';
 }
 });
 });
 },
 //如果图片加载失败则加载默认图片
 getDefpic:function(){
 $('img').each(function() {
 if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
 this.src = 'img/default.gif';
 }
 });
 },

 //判断设备类型
 deviceType: function () {
 var checker = {
 ios: navigator.userAgent.match(/(iPhone|iPod|iPad)/i),
 blackberry: navigator.userAgent.match(/BlackBerry/i),
 android: navigator.userAgent.match(/Android/i),
 windows: navigator.userAgent.match(/windows/i)
 };
 if (checker.android) {
 return "android";
 } else if (checker.ios) {
 return "ios";
 } else if (checker.blackberry) {
 return "blackberry";
 } else if (checker.windows) {
 return "windows";
 } else {
 return "";
 }
 },
 //判断字符是否有效
 isValid: function (value) {
 if (value)
 return true;
 else
 return false;
 },
 //返回当前的索引
 indexOf: function (arr, val) {
 for (var i = 0; i < arr.length; i++) {
 if (arr[i] == val) return i;
 }
 return -1;
 },
 //移除当前元素
 remove: function (arr, val) {
 var index = indexOf(arr, val);
 if (index > -1) {
 arr.splice(index, 1);
 }
 },
 count: function (o) {
 var t = typeof o;
 if (t === 'string') {
 return o.length;
 } else if (t === 'object') {
 var n = 0;
 for (var i in o) {
 n++;
 }
 return n;
 }
 return false;
 },
 //获取url参数值
 GetRequest: function () {
 var url = location.search; //获取url中"?"符后的字串
 var theRequest = new Object();
 if (url.indexOf("?") != -1) {
 var str = url.substr(1);
 strs = str.split("&");
 for (var i = 0; i < strs.length; i++) {
 theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
 }
 }
 return theRequest;
 //调用方法
 //var Request = new Object();
 //Request = GetRequest();
 //var 参数1, 参数2, 参数3, 参数N;
 //参数1 = Request['参数1'];
 },
 GetData2: function (time) {
 return new Date(parseInt(time) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
 },
 GetData: window.Time.UnixToDate,
 //6月25日
 GetDataYM: function (unixTime) {
 var time = new Date(unixTime * 1000);
 var ymdhis = "";
 ymdhis += time.getUTCFullYear() + "-";
 ymdhis += time.getUTCMonth() + "-";
 ymdhis += time.getUTCDate();
 return ymdhis;
 },
 RuleNum: function (strid) { //输入规则：只能输入数字或点号
 $(strid).attr("onkeyup", "this.value=this.value.replace(\/[^\\d.]\/g,'')")
 .attr("onblur", "this.value=this.value.replace(\/[^\\d.]\s/g,'')");
 },
 getSafeData: function (value) {
 if (value) {
 if (RuiDa.Check.isMHMobile(value)) {
 return value.substr(0, value.length - 4) + '****';
 }
 }
 return '';
 },
 removeSessionItem_rebate:function(){
 //要清理下session留下的数据
 if(sessionStorage.rebateCloneEl != null && sessionStorage.rebateCloneEl != "" && sessionStorage.rebateCloneEl != "undefined"){
 sessionStorage.removeItem("rebateCloneEl");
 sessionStorage.removeItem("rebateSearchCondition");
 }
 }
 };*/

window.Time = {
    /**
     * 当前时间戳
     * @return <int>        unix时间戳(秒)
     */
    CurTime: function () {
        return Date.parse(new Date()) / 1000;
    },
    /**
     * 日期 转换为 Unix时间戳
     * @param <string> 2014-01-01 20:20:20  日期格式
     * @return <int>        unix时间戳(秒)
     */
    DateToUnix: function (string) {
        var f = string.split(' ', 2);
        var d = (f[0] ? f[0] : '').split('-', 3);
        var t = (f[1] ? f[1] : '').split(':', 3);
        return (new Date(
            parseInt(d[0], 10) || null,
            (parseInt(d[1], 10) || 1) - 1,
            parseInt(d[2], 10) || null,
            parseInt(t[0], 10) || null,
            parseInt(t[1], 10) || null,
            parseInt(t[2], 10) || null
        )).getTime() / 1000;
    },
    /**
     * 时间戳转换日期
     * @param <int> unixTime    待时间戳(秒)
     * @param <bool> isFull    返回完整时间(Y-m-d 或者 Y-m-d H:i:s)
     * @param <int>  timeZone   时区
     */
    UnixToDate: function (unixTime, isFull, timeZone) {
        if (typeof (timeZone) == 'number') {
            unixTime = parseInt(unixTime) + parseInt(timeZone) * 60 * 60;
        }
        var time = new Date(unixTime * 1000);
        var ymdhis = "";
        ymdhis += Time.GetTwo(time.getUTCFullYear()) + "-";
        ymdhis += Time.GetTwo((time.getUTCMonth() + 1)) + "-";
        ymdhis += Time.GetTwo(time.getUTCDate());
        if (isFull === true) {
            ymdhis += " " + Time.GetTwo(time.getUTCHours()) + ":";
            ymdhis += Time.GetTwo(time.getUTCMinutes()) + ":";
            ymdhis += Time.GetTwo(time.getUTCSeconds());
        }
        return ymdhis;
    },
    GetTwo:function(value){
        if(value.toString().length===1){
            return '0'+value;
        }
        return value;
    }
};


Rui.GetInfo=(function(){
    var user='';
    function islogined(){
        if(sessionStorage.getItem('user')){
            return true;
        }else{
            console.log('您需要登陆才可以进来');
            RuiDa.Alert.getAlert('您还未登陆');
            setTimeout(function(){
                window.location.href='../login/login.html';
            },2000);
            return false;
        }
    }
    function getuser(){
        if(sessionStorage.getItem('user')){
            user=JSON.parse(sessionStorage.getItem('user'));
            console.log('用户信息：',user);
            return user;
        }
        /*localStorage['user']=JSON.stringify(res.content);
         console.log(JSON.parse(localStorage['user']));
         var user=JSON.parse(localStorage['user']);
         console.log('user',user,user.memberRef.stuId);*/
        //user.memberRef.stuId
    }

    function clearcuser(){
        localStorage.removeItem('user');
    }
    return{
        islogined:islogined,
        getuser:getuser,
        clearcuser:clearcuser
    }
})();

Date.prototype.format = function(format){
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(), //day
        "h+" : this.getHours(), //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3), //quarter
        "S" : this.getMilliseconds() //millisecond
    };

    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for(var k in o) {
        if(new RegExp("("+ k +")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
};

//url 转码
window.encodeUri = function(str){
    str = (str + '').toString();
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
        replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
};
//登录
var LoginUtils = (function(){

    var Request = RuiDa.Tool.GetRequest(), redirect = Request['redirect'];

    function login(){
        var params = {
            methodname:'app/user/login',
            //locationUserId:'',
            account:$('#login_account').val(),
            password:$('#login_password').val()
        };
        console.log(params);
        Rui.Ajax(params,function(res){
            //console.log(res.datas);
            // res = {code:'', message:'' , datas:''}
            if(res.code == '1000'){
                sessionStorage.setItem("user",JSON.stringify(res.datas));
                if(redirect){
                    window.location.href=redirect;
                } else {
                    window.location.href='index.html';
                }

            } else {
                alert(res.message);
                //$("#notice1").html(res.message);
                //$('#msg').text(res.message);
            }
        });
    }
    function logout(){
        sessionStorage.removeItem('user');
        localStorage.removeItem('addresses');
        window.location.href="login.html";
    }
    function checkpwd(){
        var pwdError=document.getElementById("pwdError");
        var pwd=document.logonForm.password.value;
        if(pwd==""){
            pwdError.innerHTML="<font color='#ff0000'>请输入密码！</font>";
        }
        else if(pwd.length<6 || pwd.length>16){
            pwdError.innerHTML="<font color='#ff0000'>密码应为6--16个字符！</font>";

        }
        else{
            pwdError.innerHTML="<font color='#00c72e'>通过验证信息!</font>";
        }
    }

    function check_tel(obj){
        var objvalue=obj.value;
        var regx=/^(?:13\d|15\d|18[123456789])-?\d{5}(\d{3}|\*{3})$/;
        if(objvalue==""){
            document.getElementById("checktel").innerHTML="<font color='#ff0000'>请输入手机号!</font>";
        }
        else if(regx.test(objvalue)){
            document.getElementById("checktel").innerHTML="<font color='#00c72e'>手机号码输入正确！</font>";
        }else{
            document.getElementById("checktel").innerHTML="<font color='#ff0000'>请输入正确的手机号!</font>";
        }
    }
    return {
        login : login,
        logout:logout,
        checkpwd:checkpwd,
        check_tel:check_tel
    }
})();
$(function(){
    var user = sessionStorage.getItem('user');
    if(user){
        //如果用户登录
        $('.tools .user').css('display','block');
        $('.sidebar .L2').css('display','block');
    }else{
        $('.tools .user').css('display','none');
        $('.sidebar .L2').css('display','none');
        if(window.location.href.indexOf('personal-info')>0
            ||window.location.href.indexOf('comment')>0
            ||window.location.href.indexOf('confirm')>0
            ||window.location.href.indexOf('order')>0
            ||window.location.href.indexOf('personal')>0
            ||window.location.href.indexOf('shopping')>0){
            window.location.href="index.html";
        }
    }
});

	function accessShoppingCar()
	{
 var user= $.parseJSON(sessionStorage.getItem("user"));
        if(user!=null&&user.userid!=null&&user.userid!=""){
			window.location.href="shoppingcar.html";
		}else{
			window.location.href="login.html";
		}
	}
	
	function accessMyNewFarmer()
	{
 var user= $.parseJSON(sessionStorage.getItem("user"));
        if(user!=null&&user.userid!=null&&user.userid!=""){
			window.location.href="personal-info.html";
		}else{
			window.location.href="login.html";
		}
	}

	/*购物车总数*/
    function shoppingCount(){
		var user= $.parseJSON(sessionStorage.getItem("user"));
		if(!user){
			user={
				userid:'',
				userType:''
			};
			$('#goodcarcount').text(0);
		}else{
			var params={
				'methodname':'app/shopCart/getShopCartList',
				'locationUserId':user.userid,
				'userId':user.userid
			};
			Rui.Ajax(params,function(res){
				var count = 0;
				if(res.code=='1000'){
					if(res.datas.rows)
					{
						if(res.datas.rows.length>0){
							var data = res.datas.rows;
							for(var key in data){
								var goodsList = data[key].goodsList;
								count += parseInt(goodsList.length);
							}
						}
					}
				}
				$('#goodcarcount').text(count);
			});
		}
    }
    /*购物车总数end*/

	shoppingCount();
	
	var googsUtils=(function(){
		var user= $.parseJSON(sessionStorage.getItem("user"));
		if(!user){
			user={
				userid:'',
				userType:''
			}
    }
	
    function start(){
        $('.app').click(function(){
            var dispalystr = document.getElementById('apk_down').style.display;
            if(dispalystr=='none'){
                document.getElementById('apk_down').style.display = 'block';
            }else if(dispalystr=='block'){
                document.getElementById('apk_down').style.display = 'none';
            }
        });
        $('#fertilizer-list').html('');
        $('#agricultural_vehicle').html('');
        goodsList('49921c468feb4cc6bd69e5de0e1b9e15');
		goodsList('085c3dde0b5e413ab70e5f0a8dfd3c4c');
    }

    /*菜单列表接口*/
    function goodsList(classId){
        var params={
            methodname:'app/goods/getGoodsListPage',
            locationUserId:user.userid,
			page:1,
            rows:8,
            classId:classId
        };
        console.log('菜单列表参数',params);
        Rui.Ajax(params,function(res){
            console.log('菜单列表接口成功',res);
            if(res.code=='1000'){
                console.log(res.datas);
                writeAllGoodsToHtml(res.datas.rows);
            }
        });
    }

    function writeAllGoodsToHtml(rows){
        var cars="";
        var fertilizer="";
        for(var i in rows){
            var goods = rows[i].rows;
            for(var j=0;j<goods.length;j++){
                var originalPrice=goods[j].originalPrice;
                var nowPrice=goods[j].unitPrice;
                if(user.userType!=3){
                    nowPrice=originalPrice;
                    originalPrice='';
                }
				var scorestr = "";
				if(goods[j].allowScore!=""){
					scorestr = goods[j].allowScore+"积分可抵现";
				}
				var goodsName = goods[j].goodsName;
				var nameTooLong = goodsName.length>28 ? true : false;
                var li =
                    '<li onclick="googsUtils.detail(\''+goods[j].goodsId+'\', \'' + rows[0].typeName +'\')">' +
                    '<a href="#n">' +
                    '<p class="img">' +
                    '<img data-rid="134749" width="211px" height="172px" data-index="0" src="'+ publicweburl.weburl1 + goods[j].thumbnail+ '" data-max-height="172" data-max-width="211" />'+
                    '</p>'+
                    '<p class="product-name" title="' + goodsName + '">' + (nameTooLong ? (goodsName.substr(0, 22) + '...') : goodsName) + '</p>'+
                    // '<p class="product-address">'+goods[j].brandName+'</p>'+
                    // '<p class="product-integral">'+scorestr+goods[j].allowScore+'</p>'+
                    '<p class="price">'+'￥'+nowPrice+ (nowPrice==originalPrice? '' : ' <del style="color:#C0C0C0">'+originalPrice+' </del>')+'</p>'+
                    '</a>'+
                    '</li>';
                if(rows[i].typeName=="化肥"){
                    fertilizer+=li;
                }else{
                    cars+=li;
                }
            }
        }
        $('#fertilizer-list').append($(fertilizer));
        $('#agricultural_vehicle').append($(cars));
    }
    /*菜单列表end*/

    
    function detail(goodId, type)
    {
        console.log(goodId);
        window.location.href= 'product-detail.html?goodsId='+goodId+'&type='+type;
    }


    function nextStep(){
        var user = sessionStorage.getItem('user');
        if(!user){
            var redirect = window.location.href;
            window.location.href = 'login.html?redirect=' + encodeUri(redirect);
        } else {
            window.location.href = 'product-detail.html';
        }
    }
	
    return{
        start:start,
        nextStep:nextStep,
        detail:detail
    }
})();
$(function(){
    var user = sessionStorage.getItem('user');
    if(user){
        //如果用户登录
        var html='<a href="personal-info.html">'+JSON.parse(user).loginName+'</a>&nbsp;|&nbsp;<a href="javascript:void(0)" onclick="LoginUtils.logout()">退出</a>';
        $('.login').html(html);
        $('.tools .user').css('display','block');
        $('.sidebar .L2').css('display','block');
    }else{
        $('.tools .user').css('display','none');
        $('.sidebar .L2').css('display','none');
        if(window.location.href.indexOf('personal-info')>0
            ||window.location.href.indexOf('comment')>0
            ||window.location.href.indexOf('confirm')>0
            ||window.location.href.indexOf('order')>0
            ||window.location.href.indexOf('personal')>0
            ||window.location.href.indexOf('shopping')>0){
            window.location.href="index.html";
        }
    }
});