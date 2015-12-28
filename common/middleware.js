/**
 * Created by pepelu on 2015/11/18.
 */
var services = require('../services');
var UserService = services.user;
var AuthService = services.auth;
var BackEndUserService = services.backenduser;
var tools = require('./tools');

exports.isLoggedIn_middleware = function(req, res, next, options, controller){
    var token = null;
    // check if token is valid
    var data = req.method === 'GET' ? controller.query : controller.body;
    if(data.token){
        // if data contains token
        // it means the request is from app
        token = data.token;
    }else if (controller.req.cookie(F.config.tokencookie)){
        token = controller.req.cookie(F.config.tokencookie);
    }

    try {
        var payload = tools.verify_token(token);
        // token verify success, still need to check if the login id matches the current one in db
        UserService.get({userid:payload.userId}, function(err, data) {
            if (err) {
                // perhaps no user find
                console.log('isLogin_middleware user not found: ' + err);
                controller.respond({code: 1401, message: '用户不存在'});
                return;
            }

            var valid = payload.appLoginId ?
                payload.appLoginId == data.appLoginId :
                payload.webLoginId ?
                    payload.webLoginId == data.webLoginId :
                    false;

            if (!valid) {
                controller.respond({code: 1401, message: '您已在其他地方登录'});
                return;
            }

            if (req.method == 'GET') {
                controller.query['userId'] = payload.userId;
            } else {
                controller.body.userId = payload.userId;
            }

            controller.user = data;
            next();
        })
    }catch(e){
        // authentication fail
        console.log('Token verification fail:' + e);
        controller.respond({code: 1401, message: e});
    }
};

/**
 * check backend auth:
 * 1. check if user logged in, if not, redirect to login page
 * 2. check if user has permission to access the route, if not, return code 1401
 * @param req
 * @param res
 * @param next
 * @param options
 * @param controller
 */
exports.backend_auth = function(req, res, next, options, controller){
    var token = null;

    // check if token is valid
    var data = req.method === 'GET' ? controller.query : controller.body;
    if(data.token){
        // if data contains token
        // it means the request is from app
        token = data.token;
    }else if (controller.req.cookie(F.config.backendtokencookie)){
        token = controller.req.cookie(F.config.backendtokencookie);
    }

    try {
        var payload = tools.verify_token(token);
        // token verify success, still need to check if the login id matches the current one in db
        BackEndUserService.get({_id:payload.userId}, function(err, data) {
            if (err) {
                // perhaps no user find
                console.log('user not found: ' + err);
                controller.view('login');
                return;
            }

//            var valid = payload.appLoginId ?
//                payload.appLoginId == data.appLoginId :
//                payload.webLoginId ?
//                    payload.webLoginId == data.webLoginId :
//                    false;
//
//            if (!valid) {
//                controller.view('login');
//                return;
//            }

            if (req.method == 'GET') {
                controller.query['userId'] = payload.userId;
            } else {
                controller.body.userId = payload.userId;
            }

            // check user auth
            if(!controller.route){
                controller.respond({code:1403, message: '您没有权限这样操作'});
                return;
            }

            var route = controller.route.name.trim().toLowerCase();
            var method = controller.route.method.trim().toLowerCase();
            if (route.endsWith('/'))
                route = route.substring(0, route.length - 1);
            AuthService.auth_backend(data._id, route, method, function (err, hasPermission) {
                if (err || !hasPermission) {
                    if (err)
                        console.log('auth_middleware err: ' + err);
                    controller.respond({code: 1403, message: '您没有权限这样操作'});
                    return;
                }

                // now we have the permission to execute this method
                // but we need to do some specific validation for super admin
                // if the user is super admin, let businessId in query to be the user's businessId
                // so we can simplify the code in each api to just use user's businessId as current control set
                var isSuperAdmin = data.toObject().role.isSuperAdmin;
                if (isSuperAdmin) {
                    if (req.method == 'GET') {
                        data.business = controller.query['business'];
                    } else {
                        data.business = controller.body.business;
                    }
                }

                controller.user = data;
                next();
            })
        })
    }catch(e){
        // authentication fail
        controller.view('login');
    }
};