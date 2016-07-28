/**
 * Created by pepelu on 2016/7/27.
 */
var models = require('../models');
var OrderModel = models.order;
var UserService = require('../services/user');

var dateEnd = new Date();
var dateStart;
UserService.getTestAccountList(function(err, testAccountList) {
    if (err) {
        callback(err);
        return;
    }

    var querier = {deliverStatus:5, buyerId:{$nin:testAccountList}};

    querier.dateCreated = {
        $lt: dateEnd
    };

    if(dateStart){
        querier.dateCreated.$gte = dateStart;
    }

    OrderModel.count(querier, function (err, count) {
        if (err) {
            console.error(err);
            callback('query order count fail');
            return;
        }

        console.log(count);
        process.exit(1);
    })
});