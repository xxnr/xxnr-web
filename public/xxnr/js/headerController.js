var app = angular.module('xxnr_common');
app.controller('headerController', function(loginService,remoteApiService){
	var user = loginService.getUser();
	$(function(){
		$(".header_slide").hover(function(){
			$(this).toggleClass("current");
			$(".option").find(".line").toggle();
			$(".header_pop").toggle();
		});

		if(user){
			if(!user.nickName || user.nickName.length == 0){
				user.loginName = "新新农人";
			}else{
				user.loginName = decodeURIComponent(user.nickName);
			}

			if(window.location.href.indexOf("resources") == -1){
				var html='<a href="my_xxnr.html">欢迎，'+ user.loginName +'</a>&nbsp;&nbsp;<a href="javascript:void(0)" onclick="logout()">退出</a>';
				$('.login').html(html);
			}else{
				var html='<a href="../../my_xxnr.html">欢迎，'+ user.loginName +'</a>&nbsp;&nbsp;<a href="javascript:void(0)" onclick="logout()">退出</a>';
				var login = document.getElementById('header_login');
				login.href = "../../logon.html";
				var register = document.getElementById('header_register');
				register.href = "../../logon.html?tab=2";
				var myNewFarmer = document.getElementById('myNewFarmer');
				myNewFarmer.href = "../../my_xxnr.html";
				var androidLink = document.getElementById('androidLink');
				androidLink.href = "../../newFarmer.apk";
				$('.login').html(html);
			}
        }

   //  	if(user.userid){
			// remoteApiService.getBasicUserInfo()
			// 	.then(function(data){
			// 		if(!data.datas.nickname){
			// 			user.loginName = "新新农人";
			// 		}else{
			// 			user.loginName = data.datas.nickname;
			// 		}

			// 		if(window.location.href.indexOf("resources") == -1){
			// 			var html='<a href="my_xxnr.html">欢迎，'+ user.loginName +'</a>&nbsp;&nbsp;<a href="javascript:void(0)" onclick="logout()">退出</a>';
			// 			$('.login').html(html);
			// 		}else{
			// 			var html='<a href="../../my_xxnr.html">欢迎，'+ user.loginName +'</a>&nbsp;&nbsp;<a href="javascript:void(0)" onclick="logout()">退出</a>';
			// 			var login = document.getElementById('header_login');
			// 			login.href = "../../logon.html";
			// 			var register = document.getElementById('header_register');
			// 			register.href = "../../logon.html?tab=2";
			// 			var myNewFarmer = document.getElementById('myNewFarmer');
			// 			myNewFarmer.href = "../../my_xxnr.html";
			// 			var androidLink = document.getElementById('androidLink');
			// 			androidLink.href = "../../newFarmer.apk";
			// 			$('.login').html(html);
			// 		}
			// 	});

   //      }
	});
	$("#myNewFarmer").click(function(){
        if(loginService.isLogin){
			window.location.href="my_xxnr.html";
		}else{
			window.location.href="logon.html";
		}
	});

    window.logout = function(){
        loginService.logout();
		if(window.location.href.indexOf("resources") == -1){
			window.location.href = "logon.html";
		}else {
			window.location.href = "../../logon.html";
		}
    };
});