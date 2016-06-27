/**
 * Created by pepelu on 2016/6/27.
 */
const ValidIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
const CookieRegex = new RegExp('BIGip', 'i');
exports.forbidden_sms_attack_request = function(req, res, next){
    var realIp = req.get('x-forwarded-for');
    var userAgentForwarded = req.get('user-agent').match(/X-Forwarded-For:(.+)/);
    var cookie = req.get('cookie');
    if(ValidIpAddressRegex.test(realIp) || CookieRegex.test(cookie)) {
        res.status(403);
        res.send('x-forwarded forbidden');
    }else {
        if(userAgentForwarded && userAgentForwarded.length >1){
            realIp = userAgentForwarded[1].trim();
            if(ValidIpAddressRegex.test(realIp)) {
                res.status(403);
                res.send('x-forwarded forbidden');
            } else{
                next();
            }
        } else{
            next();
        }
    }
};