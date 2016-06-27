/**
 * Created by pepelu on 2016/6/27.
 */
const ValidIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

exports.forbidden_proxy_request = function(req, res, next){
    var realIp = req.get('x-forwarded-for');
    if(ValidIpAddressRegex.test(realIp)) {
        res.status(403);
        res.send('x-forwarded forbidden');
    }else {
        next();
    }
};