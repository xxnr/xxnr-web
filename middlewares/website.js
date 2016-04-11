/**
 * Created by pepelu on 2016/4/11.
 */
module.exports = function(req, res, next){
    res.success = function(data){
        res.status(200);
        if(!data){
            data = {code:1000, message:'success'};
        }

        return res.json(data);
    };

    res.fail = function(data){
        if(!data){
            data = {code:1001, message:'Unknown failure'};
        }

        return res.json(data);
    };

    res.respond = function(data) {
        res.status(200);

        var callbackName = req.data.callback;
        callbackName ? res.jsonp(data) : res.json(data);
        if (this.auditInfo) {
            AuditService.saveLog(this.auditInfo, arguments);
        }
    };

    next();
};