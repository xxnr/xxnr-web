var common = {};
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
		SET('common.page', 'dashboard');
		return;
	}

    redirectToHomePage();
});

jRouting.route(managerurl + '/orders/', function() {

    if (can('orders')) {
        SET('common.page', 'orders');
        return;
    }

    redirectToHomePage();
});

jRouting.route(managerurl + '/products/', function() {

    if (can('products')) {
        SET('common.page', 'products');
        return;
    }

    jRouting.redirect(managerurl + '/' + su.roles[0] + '/');
});

jRouting.route(managerurl + '/users/', function() {
    if (can('users')) {
        SET('common.page', 'users');
        return;
    }

    redirectToHomePage();
});

jRouting.route(managerurl + '/news/', function() {
    if (can('news')) {
        SET('common.page', 'news');
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

jRouting.on('location', function(url) {
	var nav = $('nav');
	nav.find('.selected').removeClass('selected');
	nav.find('a[href="' + url + '"]').addClass('selected');
});

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

angular.module('xxnr_manager',['ngCookies'])
    .service('loginService', function($cookieStore) {
        var tokenKey = "be_token";
        this.logout = function () {
            $cookieStore.remove(tokenKey, {path: "/", domain: ".xinxinnongren.com"});
            $cookieStore.remove(tokenKey, {path: "/"});
        };
    })
    .controller('managerController', function($scope, loginService) {
        $scope.logout = function(){
            loginService.logout();
            window.location.reload();
        }
    });