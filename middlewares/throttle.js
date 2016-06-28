/**
 * Created by pepelu on 2016/6/27.
 */
const ValidIpAddressRegex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
const ValidDomainRegex = new RegExp('xinxinnongren.com', 'i');
const UserAgentForwardedRegex = new RegExp('X-Forwarded-For:(.+)', 'i');
const BigIpCookieRegex = new RegExp('BIGip', 'i');
const DomainCookieRegex = new RegExp('domain=(.+);');

exports.forbidden_sms_attack_request = function(req, res, next){
    var realIp = req.get('x-forwarded-for');
    var realIpInUserAgent;
    var domain = '.xinxinnongren.com';

    var userAgentForwarded = req.get('user-agent').match(UserAgentForwardedRegex);
    if(userAgentForwarded && userAgentForwarded.length >1){
        realIpInUserAgent = userAgentForwarded[1].trim();
    }

    var cookie = req.get('cookie');
    if(cookie) {
        var domainMatch = cookie.match(DomainCookieRegex);
        if (domainMatch && domainMatch.length > 1) {
            domain = domainMatch[1].trim();
        }
    }

    if(ValidIpAddressRegex.test(realIp) || BigIpCookieRegex.test(cookie) || ValidIpAddressRegex.test(realIpInUserAgent) || !ValidDomainRegex.test(domain)) {
        res.status(403);
        res.send('x-forwarded forbidden');
    } else {
        next();
    }
};