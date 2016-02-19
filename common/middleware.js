/**
 * Created by pepelu on 2015/11/18.
 */
var services = require('../services');
var UserService = services.user;
var AuthService = services.auth;
var BackEndUserService = services.backenduser;
var AuditService = services.auditservice;
var ThrottleService = services.throttle;
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

    if(!token){
        controller.respond({code:1401, message:'请先登录'});
        return;
    }

    try {
        var payload = tools.verify_token(token);
        // token verify success, still need to check if the login id matches the current one in db
        UserService.get({userid:payload.userId}, function(err, data) {
            if (err) {
                // perhaps no user find
                console.error('isLogin_middleware user not found:', err);
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
        console.error('Token verification fail:', e);
        controller.respond({code: 1401, message: '用户信息验证错误，请重新登录'});
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
                console.error('user not found:', err);
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
                        console.error('auth_middleware err:', err);
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

/**
 * check user in user white list
 * @param req
 * @param res
 * @param next
 * @param options
 * @param controller
 */
exports.isInWhiteList_middleware = function(req, res, next, options, controller) {
    var token = null;
    // check if token is valid
    var data = req.method === 'GET' ? controller.query : controller.body;
    if (data.token) {
        // if data contains token
        // it means the request is from app
        token = data.token;
    } else if (controller.req.cookie(F.config.tokencookie)) {
        token = controller.req.cookie(F.config.tokencookie);
    }

    if (!token) {
        next();
        return;
    }

    try {
        var payload = tools.verify_token(token);
        // token verify success, still need to check if the login id matches the current one in db
        UserService.get({userid:payload.userId}, function(err, user) {
            if (err) {
                // perhaps no user find
                console.error('isInWhiteList_middleware isLogin_middleware user not found:', err);
                next();
                return;
            }

            try {
                if (user) {
                    // check user in white list
                    UserService.inWhiteList({userid:user.id}, function(err, data) {
                        if (err) {
                            // perhaps no user find
                            console.error('isInWhiteList_middleware user not found:', err);
                            next();
                            return;
                        }

                        if (data) {
                            user.inWhiteList = true;
                            controller.user = user;
                        }
                        next();
                    });
                } else {
                    next();
                }
            } catch(e) {
                // white list check fail
                console.error('White list check fail:', e);
                next();
            }
        });
    } catch(e) {
        // white list check fail
        console.error('White list check fail:', e);
        next();
    }
};

exports.isXXNRAgent_middleware = function(req, res, next, options, controller){
    var user = controller.user;
    if(!user){
        console.error('need login first');
        controller.respond({code:1401, message:'请先登录'});
        return;
    }

    UserService.isXXNRAgent(user, function(err, isXXNRAgent){
        if(err || !isXXNRAgent){
            controller.respond({code:1403, message:'您没有权限这样操作'});
            return;
        }

        next();
    })
};

/**
 * user auditing info
 * @param req
 * @param res
 * @param next
 * @param options
 * @param controller
 */
exports.auditing_middleware = function(req, res, next, options, controller) {
    try {
        AuditService.auditInfo(req, controller);
        next();
    } catch(e) {
        // auditing fail
        console.error('auditing fail:', e);
        next();
    }
};

exports.throttle = function(req, res, next, options, controller){
    var user = controller.user;
    var route = controller.route.name.trim();
    if (route.endsWith('/'))
        route = route.substring(0, route.length - 1);
    var method = controller.route.method.trim().toLowerCase();
    var ip = controller.ip.trim();
    ThrottleService.requireAccess(route, method, ip, user?user._id:null, function(pass, reason){
        if(!pass){
            switch(reason){
                case ThrottleService.THROTTLE_BY_HITS_PER_USER:
                case ThrottleService.THROTTLE_BY_HITS_PER_IP:
                    controller.respond({code:1429, message:'您操作的太频繁了，请稍后再试'});
                    break;
                default:
                    controller.respond({code:1429, message:'系统繁忙，请稍后再试'});
            }
        } else{
            next();
        }
    })
};

