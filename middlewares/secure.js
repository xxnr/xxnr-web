/**
 * Created by pepelu on 2016/5/4.
 */

exports.redirectToHttps = function(req, res, next){
    // redirect can be used only when app support
    //if(req.protocol != 'https' && require('../config').secure) {
    //    res.redirect('https://' + req.hostname + req.url);
    //    return;
    //}

    next();
};
