var common = {};
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// pikaday Localize
var i18n = {
  previousMonth   : '上个月',
  nextMonth       : '下个月',
  months          : ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
  weekdays        : ['周日','周一','周二','周三','周四','周五','周六'],
  weekdaysShort   : ['日','一','二','三','四','五','六']
};
var defaultColors = ['#BFE83E', '#FCAC42', '#6DD2F3', '#3FCCAC'];

// Current page
common.page = '';

// Current form
common.form = '';

$(document).ready(function() {
	$('.jrouting').jRouting().each(function() {
		var el = $(this);
		var role = el.attr('data-role');
		if (su.roles.length > 0 && su.roles.indexOf(role) === -1)
			el.hide();
	});

	loading(false, 1000);
	$(window).on('resize', resizer);
	resizer();
});

var redirectToHomePage = function(){
    jRouting.redirect(managerurl + '/' + su.roles[0] + '/');
};

jRouting.route(managerurl + '/', function() {

	if (can('dashboard')) {
		navClass('dashboard');
		SET('common.page', 'dashboard');
		return;
	}

    redirectToHomePage();
});

jRouting.route(managerurl + '/dashboard/weekly/', function(){
	if(can('dashboard')) {
		navClass('dashboard');
		SET('common.page', 'dashboard-weekly');
		return;
	}

	redirectToHomePage();
});

jRouting.route(managerurl + '/dashboard/agent-rank/', function(){
	if(can('dashboard')) {
		navClass('dashboard');
		SET('common.page', 'dashboard-agentRank');
		return;
	}

	redirectToHomePage();
});

jRouting.route(managerurl + '/orders/', function() {

    if (can('orders')) {
    	navClass('orders');
        SET('common.page', 'orders');
        return;
    }

    redirectToHomePage();
});

jRouting.route(managerurl + '/orders/detail', function() {

	if (can('orders')) {
		navClass('orders');
		SET('common.page', 'order-detail');
		return;
	}

	redirectToHomePage();
});

jRouting.route(managerurl + '/products/', function() {

    if (can('products')) {
		navClass('products');
        SET('common.page', 'products');
        return;
    }

    jRouting.redirect(managerurl + '/' + su.roles[0] + '/');
});

jRouting.route(managerurl + '/users/', function() {
	if (can('users')) {
		navClass('users');
		SET('common.page', 'users');
		return;
	}

	redirectToHomePage();
});

jRouting.route(managerurl + '/potentialcustomers/', function() {
	if (can('users')) {
		navClass('users');
		SET('common.page', 'potentialcustomers');
		return;
	}

	redirectToHomePage();
});

jRouting.route(managerurl + '/news/', function() {
    if (can('news')) {
		navClass('news');
        SET('common.page', 'news');
        return;
    }

    redirectToHomePage();
});

jRouting.route(managerurl + '/payrefunds/', function() {
    if (can('payrefunds')) {
		navClass('payrefunds');
        SET('common.page', 'payrefunds');
        return;
    }

    redirectToHomePage();
});

jRouting.route(managerurl + '/auditlogs/', function() {
    if (can('auditlogs')) {
		navClass('auditlogs');
        SET('common.page', 'auditlogs');
        return;
    }

    redirectToHomePage();
});

jRouting.route(managerurl + '/newsletter/', function() {
    if (can('newsletter')) {
        SET('common.page', 'newsletter');
        return;
    }

    redirectToHomePage();
});

jRouting.route(managerurl + '/settings/', function() {
    if (can('settings')) {
		navClass('settings');
        SET('common.page', 'settings');
        return;
    }

    redirectToHomePage();
});

jRouting.route(managerurl + '/pages/', function() {
    if (can('pages')) {
        SET('common.page', 'pages');
        return;
    }

    redirectToHomePage();
});

jRouting.route(managerurl + '/system/', function() {
    if (can('system')) {
        SET('common.page', 'system');
        return;
    }

    redirectToHomePage();
});

jRouting.route(managerurl + '/rsc/', function(){
	if(can('rsc')) {
		navClass('rsc');
		SET('common.page', 'rsc');
		return;
	}

	redirectToHomePage();
});

jRouting.route(managerurl + '/rsc/rsc-detail', function(){
	if(can('rsc')) {
		navClass('rsc');
		SET('common.page', 'rsc-detail');
		return;
	}

	redirectToHomePage();
});

jRouting.route(managerurl + '/rsc/rsc-order', function(){
	if(can('rsc')) {
		navClass('rsc');
		SET('common.page', 'rsc-order');
		return;
	}

	redirectToHomePage();
});

jRouting.route(managerurl + '/agents', function(){
	if(can('agents')) {
		navClass('agents');
		SET('common.page', 'agents');
		return;
	}

	redirectToHomePage();
});

jRouting.route(managerurl + '/agents/agents-detail', function(){
	if(can('agents')) {
		navClass('agents');
		SET('common.page', 'agents-detail');
		return;
	}

	redirectToHomePage();
});

// rewardshop
jRouting.route(managerurl + '/rewardshop', function(){
	if(can('rewardshop')) {
		navClass('rewardshop');
		SET('common.page', 'rewardshop');
		return;
	}

	redirectToHomePage();
});

jRouting.route(managerurl + '/rewardshop/gifts', function(){
	if(can('rewardshop')) {
		navClass('rewardshop');
		SET('common.page', 'rewardshop-gifts');
		return;
	}

	redirectToHomePage();
});

jRouting.route(managerurl + '/rewardshop/gifts-detail', function(){
	if(can('rewardshop')) {
		navClass('rewardshop');
		SET('common.page', 'rewardshop-gifts-detail');
		return;
	}

	redirectToHomePage();
});

jRouting.route(managerurl + '/rewardshop/points-logs', function(){
	if(can('rewardshop')) {
		navClass('rewardshop');
		SET('common.page', 'rewardshop-points-logs');
		return;
	}

	redirectToHomePage();
});

// jRouting.on('location', function(url) {
// 	// var nav = $('nav');
// 	// nav.find('.selected').removeClass('selected');
// 	// nav.find('a[href="' + url + '"]').addClass('selected');
// });

function navClass(role) {
	var nav = $('nav');
	nav.find('.selected').removeClass('selected');
	nav.find('a[data-role="'+role+'"]').addClass('selected');
}

function loading(v, timeout) {
	setTimeout(function() {
		$('#loading').toggle(v);
	}, timeout || 0);
}

function resizer() {
	var h = $(window).height();
	var el = $('#body');
	var t = el.offset().top + 100;
	el.css('min-height', h - t);
}

function success() {
	loading(false, 1000);
	var el = $('#success');
	el.css({ top: '0%' }).fadeIn(100).animate({ top: '50%' }, 1000, 'easeOutBounce', function() {
		setTimeout(function() {
			el.fadeOut(300);
		}, 1000);
	});
}

function can(name) {
	if (su.roles.length === 0)
		return true;
	return su.roles.indexOf(name) !== -1;
}

Tangular.register('price', function(value, format) {
	if (value === undefined)
		value = 0;
	return value.format(format) + ' ' + currency;
});

Tangular.register('toFixed', function(value, format) {
	if (value === undefined)
		value = 0;
	if (format === undefined)
		format = (value.toString()).length();
	return value.toFixed(format) + ' ' + currency;
});

Tangular.register('join', function(value) {
	if (value instanceof Array)
		return value.join(', ');
	return '';
});

Tangular.register('default', function(value, def) {
	if (value === undefined || value === null || value === '')
		return def;
	return value;
});

jQuery.easing.easeOutBounce = function(e, f, a, h, g) {
	if ((f /= g) < (1 / 2.75)) {
		return h * (7.5625 * f * f) + a
	} else {
		if (f < (2 / 2.75)) {
			return h * (7.5625 * (f -= (1.5 / 2.75)) * f + 0.75) + a
		} else {
			if (f < (2.5 / 2.75)) {
				return h * (7.5625 * (f -= (2.25 / 2.75)) * f + 0.9375) + a
			} else {
				return h * (7.5625 * (f -= (2.625 / 2.75)) * f + 0.984375) + a
			}
		}
	}
};

function getSelectionStartNode(context){
	if (!context.getSelection)
		return;
	var node = context.getSelection().anchorNode;
	var startNode = (node.nodeName == "#text" ? node.parentNode : node);
	return startNode;
}

Delay_Search_WATCH = function(field, callback, latency_in_millisecond){
	if(typeof latency_in_millisecond == 'undefined'){
		latency_in_millisecond = 600;
	}
	var timer;
	WATCH(field, function(path, value){
		if(/.*filter\.search/.test(path)) {
			if (timer) {
				clearTimeout(timer);
			}
			if (value.search) {
				timer = setTimeout(function (path, value) {
					callback(path, value);
				}, latency_in_millisecond);
			}
		} else{
			callback(path, value);
		}
	})
};

hasElementArray = function(checkArray, judge) {
	// TODO : use js closure
	if(checkArray instanceof Array) {
		if(typeof judge == 'function') {
			for(var i = 0; i < checkArray.length; i++) {
				var rscObj = checkArray[i];
				if(judge(rscObj)) {
					return i;
				}
			}
			return -1;
		}
	}else if(typeof(checkArray) == "string") {
		return checkArray.indexOf(judge);
	}
};

getUrlParam = function(name) {
	var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
	if (result == null || result.length < 1) {
		return "";
	}
	return decodeURIComponent(result[1]);
};

var app = angular.module('xxnr.manager',['ngCookies'])
    .service('loginService', function($cookieStore) {
        var tokenKey = "be_token";
        this.logout = function () {
            $cookieStore.remove(tokenKey, {path: "/", domain: ".xinxinnongren.com"});
            $cookieStore.remove(tokenKey, {path: "/"});
        };
    })
    .controller('ManagerController', function($scope, loginService) {
        $scope.logout = function(){
            loginService.logout();
            window.location.reload();
        }
    });
app.controller('ProductController', function($scope){
		$scope.show_product_edit = false;
	});

// dashboard init
function dashboardInit() {
	$(".dashboard-sidebar li").off('click').on('click', function() {
    	var url;
		var el = $(this);
		var name = el.attr('name');
		switch (name) {
			case 'daily':
				url = '/';
				break;
			case 'weekly':
				url = '/dashboard/weekly/';
				break;
			case 'agentRank':
				url = '/dashboard/agent-rank/';
				break;
		}
		if (url) {
        	window.location.href = managerurl + url;
        }
    });
}

// Pagination
function Pagination(el, count, pageCount, currentPage, callback) {
	el.pagination({
        items: count,
        itemsOnPage: pageCount,
        currentPage: currentPage?currentPage:0,
		prevText: '<',
		nextText: '>',
        cssStyle: 'light-theme',
        onPageClick: function(pageNumber, event) {
        	callback(pageNumber);
        }
    });
}