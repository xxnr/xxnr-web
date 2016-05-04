/**
 * Created by pepelu on 2016/5/4.
 */

exports.redirectToHttps = function(req, res, next){
    if(req.protocol != 'https') {
        res.redirect('https://' + req.hostname + req.url);
        return;
    }

    next();
};
