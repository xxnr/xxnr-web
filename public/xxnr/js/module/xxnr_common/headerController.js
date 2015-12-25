var app = angular.module('xxnr_common');
app.controller('headerController', function(loginService){
	var user = loginService.user;
	$(function(){
		$(".header_slide .mobile").click(function(){
			$(this).toggleClass("current");
			$(".option").find(".line").toggle();
			$(".header_pop").toggle();
		});
    	if(user.userid){
    		var html='<a href="my_xxnr.html">'+ user.loginName +'</a>&nbsp;|&nbsp;<a href="javascript:void(0)" onclick="logout()">退出</a>';
        	$('.login').html(html);
        }
	});

	$("#myNewFarmer").click(function(){
        if(user!=null&&user.userid!=null&&user.userid!=""){
			window.location.href="my_xxnr.html";
		}else{
			window.location.href="logon.html";
		}
	});

    window.logout = function(){
        loginService.logout();
        window.location.href="logon.html";
    };
});