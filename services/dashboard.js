/**
 * Created by pepelu on 2016/4/26.
 */
var UserModel = require('../models').user;
var OrderModel = require('../models').order;
var UserSignModel = require('../models').userSign;
var HourlyReportModel = require('../models').hourlyReport;
var AgentReportModel = require('../models').agentReport;
var PotentialCustomerModel = require('../models').potential_customer;
var ReportUpdateTimeModel = require('../models').reportUpdateTime;
var PAYMENTSTATUS = require('../common/defs').PAYMENTSTATUS;
var DELIVERSTATUS = require('../common/defs').DELIVERSTATUS;
var tools = require('../common/tools');
var utils = require('../common/utils');
var config = require('../config');
var UserService = require('./user');
var moment = require('moment-timezone');

var DashboardService = function(){
    this.Dimension = {
        hour:{name:'hour', key:'hourInBeijingTime', sequenceKey:'hourSequenceNo'},
        day:{name:'day', key:'dayInBeijingTime', sequenceKey:'daySequenceNo'},
        week:{name:'week', key:'weekInBeijingTime', sequenceKey:'weekSequenceNo'},
        month:{name:'month', key:'monthInBeijingTime', sequenceKey:'monthSequenceNo'},
        year:{name:'year', key:'yearInBeijingTime', sequenceKey:'yearSequenceNo'}
    }
};

DashboardService.prototype.generateHourlyReport = function(hourMinus, callback) {
    if(typeof hourMinus === 'function'){
        callback = hourMinus;
        hourMinus = 1;
    }

    hourMinus = utils.parseInt(hourMinus, 1);
    if(hourMinus < 1){
        hourMinus = 1;
    }

    var currentTime = new Date();

    // startTime and endTime is used for database query, cause we store UTC in database, so we should minus time zone diff here
    var startTime = new Date(currentTime.add('h', -hourMinus).format('yyyy-MM-dd hh')+':00:00').add('h', -config.currentTimeZoneDiff);
    var endTime = new Date(currentTime.add('h', -hourMinus + 1).format('yyyy-MM-dd hh')+':00:00').add('h', -config.currentTimeZoneDiff);

    // this time is used for recording into hourly report table.
    var queryDateInBeijingTime =  new Date(currentTime.add('h', -hourMinus).format('yyyy-MM-dd hh')+':00:00').add('h', -config.currentTimeZoneDiff);

    var registeredUserCount = 0;
    var orderCount = 0;
    var paidOrderCount = 0;
    var paidAmount = 0;
    var completedOrderCount = 0;
    var signedUserCount = 0;
    var newPotentialCustomerCount = 0;
    var potentialCustomerRegisteredCount = 0;

    var promises = [
        new Promise(function (resolve, reject) {
            getUserRegisteredCount(startTime, endTime, function (err, count) {
                if (err) {
                    reject(err);
                    return;
                }

                registeredUserCount = count;
                resolve();
            })
        })
        , new Promise(function (resolve, reject) {
            getOrderCreatedCount(startTime, endTime, function (err, count) {
                if (err) {
                    reject(err);
                    return;
                }

                orderCount = count;
                resolve();
            })
        })
        , new Promise(function (resolve, reject) {
            getOrderPaidCount(startTime, endTime, function (err, count) {
                if (err) {
                    reject(err);
                    return;
                }

                paidOrderCount = count;
                resolve();
            })
        })
        , new Promise(function (resolve, reject) {
            getOrderPaidAmount(startTime, endTime, function (err, amount) {
                if (err) {
                    reject(err);
                    return;
                }

                paidAmount = amount;
                resolve();
            })
        })
        , new Promise(function (resolve, reject) {
            getCompletedOrderCount(startTime, endTime, function (err, count) {
                if (err) {
                    reject(err);
                    return;
                }

                completedOrderCount = count;
                resolve();
            })
        })
        , new Promise(function (resolve, reject) {
            getSignedUserCount(startTime, endTime, function (err, count) {
                if (err) {
                    reject(err);
                    return;
                }

                signedUserCount = count;
                resolve();
            })
        })
        , new Promise(function (resolve, reject) {
            getNewPotentialCustomerCount(startTime, endTime, function (err, count) {
                if (err) {
                    reject(err);
                    return;
                }

                newPotentialCustomerCount = count;
                resolve();
            })
        })
        , new Promise(function (resolve, reject) {
            getPotentialCustomerRegisteredCount(startTime, endTime, function (err, count) {
                if (err) {
                    reject(err);
                    return;
                }

                potentialCustomerRegisteredCount = count;
                resolve();
            })
        })
    ];

    Promise.all(promises)
        .then(function () {
            var dayOfWeek = queryDateInBeijingTime.getDay();
            if(dayOfWeek == 0){
                // getDay will return 0 if it is Sunday
                dayOfWeek = 7;
            }

            var hourInBeijingTime = queryDateInBeijingTime.format('yyyyMMddHH');
            var hourlyReport = {
                registeredUserCount: registeredUserCount,
                orderCount: orderCount,
                paidOrderCount: paidOrderCount,
                paidAmount: paidAmount,
                completedOrderCount: completedOrderCount,
                signedUserCount: signedUserCount,
                newPotentialCustomerCount: newPotentialCustomerCount,
                potentialCustomerRegisteredCount: potentialCustomerRegisteredCount,
                dateTime: new Date(),
                hourInBeijingTime: hourInBeijingTime,
                dayInBeijingTime: queryDateInBeijingTime.format('yyyyMMdd'),
                weekInBeijingTime: new Date(queryDateInBeijingTime.add('d', 1-dayOfWeek).format('yyyy-MM-dd')).add('h', -config.currentTimeZoneDiff).format('yyyyMMdd'),
                monthInBeijingTime: queryDateInBeijingTime.format('yyyyMM'),
                yearInBeijingTime: queryDateInBeijingTime.format('yyyy'),
                hourSequenceNo: getSequenceNo(queryDateInBeijingTime, 'hours'),
                daySequenceNo: getSequenceNo(queryDateInBeijingTime, 'days'),
                weekSequenceNo: getSequenceNo(queryDateInBeijingTime, 'weeks'),
                monthSequenceNo: getSequenceNo(queryDateInBeijingTime, 'months'),
                yearSequenceNo: getSequenceNo(queryDateInBeijingTime, 'years')
            };

            var hourlyReportModel = new HourlyReportModel(hourlyReport);

            hourlyReportModel.save(function(err){
                if(err){
                    if(11000 == err.code){
                        // already has record of this hour, need update
                        HourlyReportModel.findOneAndUpdate({hourInBeijingTime:hourInBeijingTime}, {$set:hourlyReport}, function(err){
                            if(err){
                                console.error(err);
                                callback(err);
                                return;
                            }

                            callback();
                        })
                    } else{
                        console.error(err);
                        callback(err);
                    }

                    return;
                }

                callback();
            })
        })
        .catch(function (err) {
            console.error(err);
            callback(err);
        })
};

DashboardService.prototype.lastUpdateTime = function(callback){
    ReportUpdateTimeModel.findOne({}, function(err, updateTime) {
        if(err){
            console.error(err);
            callback(err);
            return
        }

        callback(null, updateTime || new ReportUpdateTimeModel());
    });
};

/**
 * get statistic until yesterday
 * @param callback
 */
DashboardService.prototype.getStatistic = function(callback) {
    var today = new Date().format('yyyyMMdd');
    HourlyReportModel.aggregate({$match: {dayInBeijingTime: {$ne: today}}}
        , {
            $group: {
                _id:null,
                registeredUserCount: {$sum: '$registeredUserCount'},
                orderCount: {$sum: '$orderCount'},
                paidOrderCount: {$sum: '$paidOrderCount'},
                paidAmount: {$sum: '$paidAmount'},
                signedUserCount: {$sum: '$signedUserCount'},
                completedOrderCount:{$sum:'$completedOrderCount'},
                newPotentialCustomerCount: {$sum: '$newPotentialCustomerCount'},
                potentialCustomerRegisteredCount: {$sum: '$potentialCustomerRegisteredCount'}
            }
        })
        .exec(function(err, result){
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            if (tools.isArray(result) && result.length > 0) {
                callback(null, result[0])
            } else {
                callback('query statistic error');
            }
        })
};

/**
 * query daily report
 * @param dateStart : date start, will be included. String format as YYYYMMDD
 * @param dateEnd : date end, will be included. String format as YYYYMMDD
 * @param callback function
 */
DashboardService.prototype.queryDailyReport = function(dateStart, dateEnd, callback){
    var self = this;
    groupByDimension(self.Dimension.day, dateStart, dateEnd, callback);
};

/**
 * query weekly report
 * @param dateStart : date start, will be included. String format as YYYYMMDD
 * @param dateEnd : date end, will be included. String format as YYYYMMDD
 * @param callback function
 */
DashboardService.prototype.queryWeeklyReport = function(dateStart, dateEnd, callback){
    var self = this;
    groupByDimension(self.Dimension.week, dateStart, dateEnd, callback);
};

/**
 * generate agent report per agent per day
 * @param dateMinus
 * @param callback
 */
DashboardService.prototype.generateAgentReport = function(dateMinus, callback){
    if(typeof dateMinus === 'function'){
        callback = dateMinus;
        dateMinus = 1;
    }

    dateMinus = utils.parseInt(dateMinus, 1);
    if(dateMinus < 1){
        dateMinus = 1;
    }

    var currentTime = new Date();
    var startTime = new Date(currentTime.add('d', -dateMinus).format('yyyy-MM-dd hh')+':00:00').add('h', -config.currentTimeZoneDiff);
    var endTime = new Date(currentTime.add('d', -dateMinus + 1).format('yyyy-MM-dd hh')+':00:00').add('h', -config.currentTimeZoneDiff);

    // this time is used for recording into hourly report table.
    var queryDateInBeijingTime =  new Date(currentTime.add('d', -dateMinus).format('yyyy-MM-dd hh')+':00:00').add('h', -config.currentTimeZoneDiff);
    var dayOfWeek = queryDateInBeijingTime.getDay();
    if(dayOfWeek == 0){
        // getDay will return 0 if it is Sunday
        dayOfWeek = 7;
    }

    var dayInBeijingTime = queryDateInBeijingTime.format('yyyyMMdd');
    var weekInBeijingTime = new Date(queryDateInBeijingTime.add('d', 1-dayOfWeek).format('yyyy-MM-dd')).add('h', -config.currentTimeZoneDiff).format('yyyyMMdd');
    var monthInBeijingTime = queryDateInBeijingTime.format('yyyyMM');
    var yearInBeijingTime = queryDateInBeijingTime.format('yyyy');

    // first get all agents
    UserModel.find({typeVerified:config.XXNRAgentId}, function(err, XXNRAgents){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        var promiseOfAllAgents = XXNRAgents.map(function(agent){
            return new Promise(function(resolve, reject){
                var newInviteeCount = 0;
                var allInviteeCount = 0;
                var newPotentialCount = 0;
                var allPotentialCount = 0;
                var completedOrderCount = 0;
                var paidAmount = 0;

                var promises =  [
                    new Promise(function(resolve, reject){
                        getNewInviteeCountByAgent(startTime, endTime,agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            newInviteeCount = count;
                            resolve();
                        })
                    }),
                    new Promise(function(resolve, reject){
                        getNewInviteeCountByAgent(endTime, agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            allInviteeCount = count;
                            resolve();
                        })
                    }),
                    new Promise(function(resolve, reject){
                        getNewPotentialCountByAgent(startTime, endTime, agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            newPotentialCount = count;
                            resolve();
                        })
                    }),
                    new Promise(function(resolve, reject){
                        getNewPotentialCountByAgent(endTime, agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            allPotentialCount = count;
                            resolve();
                        })
                    }),
                    new Promise(function(resolve, reject){
                        getCompletedOrderCountByAgent(endTime, agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            completedOrderCount = count;
                            resolve();
                        })
                    }),
                    new Promise(function(resolve, reject){
                        getPaidAmountByAgent(endTime, agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            paidAmount = count;
                            resolve();
                        })
                    })
                ];

                Promise.all(promises)
                    .then(function() {
                        // create document for this agent
                        var agentDailyRecord = {
                            agent: agent,
                            name: agent.name,
                            phone: agent.account,
                            newInviteeCount: newInviteeCount,
                            newPotentialCustomerCount: newPotentialCount,
                            totalInviteeCount: allInviteeCount,
                            totalPotentialCustomerCount: allPotentialCount,
                            totalCompletedOrderCount: completedOrderCount,
                            totalPaidAmount: paidAmount,
                            dateTime:currentTime,
                            dayInBeijingTime: dayInBeijingTime,
                            weekInBeijingTime: weekInBeijingTime,
                            monthInBeijingTime: monthInBeijingTime,
                            yearInBeijingTime: yearInBeijingTime
                        };

                        var agentDailyRecordModel = new AgentReportModel(agentDailyRecord);
                        agentDailyRecordModel.save(function(err){
                            if(err){
                                if(11000 == err.code){
                                    // already has record of this hour, need update
                                    AgentReportModel.findOneAndUpdate({name:agent.name, dayInBeijingTime:dayInBeijingTime}, {$set:agentDailyRecord}, function(err){
                                        if(err){
                                            console.error(err);
                                            reject(err);
                                            return;
                                        }

                                        resolve();
                                    })
                                } else{
                                    console.error(err);
                                    reject(err);
                                }

                                return;
                            }

                            resolve();
                        })
                    })
                    .catch(function(err){
                        reject(err);
                    })
            })
        });

        Promise.all(promiseOfAllAgents)
            .then(function(){
                callback();
            })
            .catch(function(err){
                callback(err);
            })
    })
};

DashboardService.prototype.queryAgentReportYesterday = function(callback, sortBy, order, page, max){
    var yesterday = new Date().add('d', -1).format('yyyyMMdd');
    var sort = {totalPaidAmount:-1};
    var order = U.parseInt(order, -1);
    switch(sortBy){
        case 'NEWINVITEE':
            sort = {newInviteeCount:order};
            break;
        case 'TOTALINVITEE':
            sort = {totalInviteeCount:order};
            break;
        case 'NEWPOTENTIALCUSTOMER':
            sort = {newPotentialCustomerCount:order};
            break;
        case 'TOTALPOTENTIALCUSTOMER':
            sort = {totalPotentialCustomerCount:order};
            break;
        case 'TOTALCOMPLETEDORDER':
            sort = {totalCompletedOrderCount:order};
            break;
        default :
            sort = {totalPaidAmount:order};
            break;
    }

    page = U.parseInt(page) - 1;
    page = page < 0 ? 0 : page;
    max = U.parseInt(max, 20);
    var take = U.parseInt(max);
    var skip = U.parseInt(page * max);

    AgentReportModel.count({dayInBeijingTime: yesterday}).exec(function(err, count){
        if(err){
            console.error(err);
            return;
        }
        AgentReportModel.find({dayInBeijingTime: yesterday})
            .select('-_id agent name phone newInviteeCount totalInviteeCount newPotentialCustomerCount totalPotentialCustomerCount totalCompletedOrderCount totalPaidAmount')
            .sort(sort)
            .skip(skip)
            .limit(take)
            .lean()
            .exec(function(err, agentReports){
            if(err){
                console.error(err);
                return;
            }
            count = count || agentReports.length;
            var data = {};

            data.count = count;
            data.items = agentReports;

            // Gets page count
            data.pages = Math.floor(count / max) + (count % max ? 1 : 0);

            if (data.pages === 0)
                data.pages = 1;

            data.page = page + 1;
            callback(null, data);
        });
    });
};

var getUserRegisteredCount = function(dateStart, dateEnd, callback) {
    var querier = {};
    if(typeof(dateEnd) === 'function') {
        // query from the very beginning till dateEnd
        callback = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    querier.datecreated = {
        $lt: dateEnd
    };

    if(dateStart){
        querier.datecreated.$gte = dateStart;
    }

    UserModel.count(querier, function(err, count){
        if(err){
            console.error(err);
            callback('query user count fail');
            return;
        }

        callback(null, count);
    })
};

/**
 * get order created count by creation date, except test order
 * @param dateStart
 * @param dateEnd
 * @param callback
 */
var getOrderCreatedCount = function(dateStart, dateEnd, callback){
    UserService.getTestAccountList(function(err, testAccountList){
        if(err){
            callback(err);
            return;
        }

        var querier = {buyerId:{$nin:testAccountList}};
        if(typeof(dateEnd) === 'function') {
            // query from the very beginning till dateEnd
            callback = dateEnd;
            dateEnd = dateStart;
            dateStart = null;
        }

        querier.dateCreated = {
            $lt: dateEnd
        };

        if(dateStart){
            querier.dateCreated.$gte = dateStart;
        }

        OrderModel.count(querier, function(err, count){
            if(err){
                console.error(err);
                callback('query order count fail');
                return;
            }

            callback(null, count);
        })
    })
};

/**
 * get order paid count by creation date, part paid included, except test order
 * @param dateStart
 * @param dateEnd
 * @param callback
 */
var getOrderPaidCount = function(dateStart, dateEnd, callback){
    UserService.getTestAccountList(function(err, testAccountList) {
        if (err) {
            callback(err);
            return;
        }

        var querier = {payStatus: {$in: [PAYMENTSTATUS.PAID, PAYMENTSTATUS.PARTPAID]}, buyerId:{$nin:testAccountList}};
        if(typeof(dateEnd) === 'function') {
            // query from the very beginning till dateEnd
            callback = dateEnd;
            dateEnd = dateStart;
            dateStart = null;
        }

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

            callback(null, count);
        })
    });
};

/**
 * get order paid amount by creation date, except test order
 * @param dateStart
 * @param dateEnd
 * @param callback
 */
var getOrderPaidAmount = function(dateStart, dateEnd, callback) {
    UserService.getTestAccountList(function(err, testAccountList) {
        if (err) {
            callback(err);
            return;
        }

        var querier = {payStatus: {$in: [PAYMENTSTATUS.PAID, PAYMENTSTATUS.PARTPAID]}, buyerId:{$nin:testAccountList}};
        if(typeof(dateEnd) === 'function') {
            // query from the very beginning till dateEnd
            callback = dateEnd;
            dateEnd = dateStart;
            dateStart = null;
        }

        querier.dateCreated = {
            $lt: dateEnd
        };

        if(dateStart){
            querier.dateCreated.$gte = dateStart;
        }

        OrderModel.aggregate({$match: querier}
            , {
                $group: {
                    _id: null,
                    totalPrice: {
                        $sum: "$price"
                    },
                    totalDuePrice: {
                        $sum: "$duePrice"
                    }
                }
            })
            .exec(function (err, data) {
                if (err) {
                    console.error(err);
                    callback(err);
                    return;
                }

                if (utils.isArray(data) && data.length > 0) {
                    callback(null, parseFloat((data[0].totalPrice - data[0].totalDuePrice).toFixed(2)));
                } else{
                    callback(null, 0);
                }
            })
    });
};

/**
 * get completed order count by creation date, except test order
 * @param dateStart
 * @param dateEnd
 * @param callback
 */
var getCompletedOrderCount = function(dateStart, dateEnd, callback){
    UserService.getTestAccountList(function(err, testAccountList) {
        if (err) {
            callback(err);
            return;
        }

        var querier = {deliverStatus:DELIVERSTATUS.RECEIVED, buyerId:{$nin:testAccountList}};
        if(typeof(dateEnd) === 'function') {
            // query from the very beginning till dateEnd
            callback = dateEnd;
            dateEnd = dateStart;
            dateStart = null;
        }

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

            callback(null, count);
        })
    });
};

var getSignedUserCount = function(dateStart, dateEnd, callback){
    var querier = {};
    if(typeof(dateEnd) === 'function') {
        // query from the very beginning till dateEnd
        callback = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    querier.datetime = {
        $lt: dateEnd
    };

    if(dateStart){
        querier.datetime.$gte = dateStart;
    }

    UserSignModel.count(querier)
        .exec(function(err, count){
            if (err) {
                console.error(err);
                callback('query sign count fail');
                return;
            }

            callback(null, count);
        })
};

var getNewPotentialCustomerCount = function(dateStart, dateEnd, callback){
    var querier = {};
    if(typeof(dateEnd) === 'function') {
        // query from the very beginning till dateEnd
        callback = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    querier.dateTimeAdded = {
        $lt: dateEnd
    };

    if(dateStart){
        querier.dateTimeAdded.$gte = dateStart;
    }

    PotentialCustomerModel.count(querier)
        .exec(function(err, count){
            if (err) {
                console.error(err);
                callback('query potential customer count fail');
                return;
            }

            callback(null, count);
        })
};

var getPotentialCustomerRegisteredCount = function(dateStart, dateEnd, callback){
    var querier = {};
    if(typeof(dateEnd) === 'function') {
        // query from the very beginning till dateEnd
        callback = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    querier.dateTimeRegistered = {
        $lt: dateEnd
    };

    if(dateStart){
        querier.dateTimeRegistered.$gte = dateStart;
    }

    PotentialCustomerModel.count(querier)
        .exec(function(err, count){
            if (err) {
                console.error(err);
                callback('query potential customer count fail');
                return;
            }

            callback(null, count);
        })
};

function getNewInviteeCountByAgent(dateStart, dateEnd, agent, callback){
    if(typeof(agent) === 'function') {
        // query from the very beginning till dateEnd
        callback = agent;
        agent = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    var querier = {dateinvited:{$lt:dateEnd}, inviter:agent};

    if(dateStart){
        querier.dateinvited.$gte = dateStart;
    }

    UserModel.count(querier, function(err, count){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, count);
    })
}

function getNewPotentialCountByAgent(dateStart, dateEnd, agent, callback){
    if(typeof(agent) === 'function') {
        // query from the very beginning till dateEnd
        callback = agent;
        agent = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    var querier = {dateTimeAdded:{$lt:dateEnd}, user:agent};

    if(dateStart){
        querier.dateTimeAdded.$gte = dateStart;
    }

    PotentialCustomerModel.count(querier, function(err, count){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback(null, count);
    })
}

function getCompletedOrderCountByAgent(dateStart, dateEnd, agent, callback){
    if(typeof(agent) === 'function') {
        // query from the very beginning till dateEnd
        callback = agent;
        agent = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    UserModel.find({inviter:agent}, function(err, users){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        var userIds = [];
        users.forEach(function(user){
            userIds.push(user.id);
        });

        var querier = {dateCreated:{$lt:dateEnd}, buyerId:{$in:userIds}, deliverStatus:DELIVERSTATUS.RECEIVED};

        if(dateStart){
            querier.dateCreated.$gte = dateStart;
        }

        OrderModel.count(querier, function(err, count){
            if(err){
                console.error(err);
                callback(err);
                return;
            }

            callback(null, count);
        })
    })
}

function getPaidAmountByAgent(dateStart, dateEnd, agent, callback) {
    if (typeof(agent) === 'function') {
        // query from the very beginning till dateEnd
        callback = agent;
        agent = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    UserModel.find({inviter: agent}, function (err, users) {
        if (err) {
            console.error(err);
            callback(err);
            return;
        }

        var userIds = [];
        users.forEach(function (user) {
            userIds.push(user.id);
        });

        var querier = {dateCreated:{$lt:dateEnd}, buyerId:{$in:userIds}, payStatus: {$in: [PAYMENTSTATUS.PAID, PAYMENTSTATUS.PARTPAID]}};

        if(dateStart){
            querier.dateCreated.$gte = dateStart;
        }

        OrderModel.aggregate({$match: querier}
            , {
                $group: {
                    _id: null,
                    totalPrice: {
                        $sum: "$price"
                    },
                    totalDuePrice: {
                        $sum: "$duePrice"
                    }
                }
            })
            .exec(function (err, data) {
                if (err) {
                    console.error(err);
                    callback(err);
                    return;
                }

                if (utils.isArray(data) && data.length > 0) {
                    callback(null, parseFloat((data[0].totalPrice - data[0].totalDuePrice).toFixed(2)));
                } else{
                    callback(null, 0);
                }
            })
    });
}

function groupByDimension(dimension, dateStart, dateEnd, callback) {
    var key = dimension.key;
    var query = {$match: {}};
    if (dateStart) {
        query['$match'][key] = {$gte: dateStart};
    }

    if (dateEnd) {
        query['$match'][key] ? query['$match'][key]['$lte'] = dateEnd : query['$match'][key] = {$lte: dateEnd};
    }

    var project = {
        $project: {
            _id: 0,
            registeredUserCount: 1,
            orderCount: 1,
            paidOrderCount: 1,
            completedOrderCount: 1,
            paidAmount: 1,
            signedUserCount: 1,
            newPotentialCustomerCount: 1,
            potentialCustomerRegisteredCount: 1,
            sequenceNo:1
        }
    };
    project['$project'][dimension.name] = '$_id';

    var sort = {$sort: {}};
    sort['$sort'][dimension.name] = -1;
    HourlyReportModel.aggregate(query
        , {
            $group: {
                _id: '$' + key,
                registeredUserCount: {$sum: '$registeredUserCount'},
                orderCount: {$sum: '$orderCount'},
                paidOrderCount: {$sum: '$paidOrderCount'},
                paidAmount: {$sum: '$paidAmount'},
                signedUserCount: {$sum: '$signedUserCount'},
                completedOrderCount: {$sum: '$completedOrderCount'},
                newPotentialCustomerCount: {$sum: '$newPotentialCustomerCount'},
                potentialCustomerRegisteredCount: {$sum: '$potentialCustomerRegisteredCount'},
                sequenceNo: {$min: '$' + dimension.sequenceKey}
            }
        }
        , project
        , sort)
        .exec(function (err, result) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            if (tools.isArray(result) && result.length > 0) {
                callback(null, result);
            } else {
                callback('query ' + dimension + 'ly report error');
            }
        });
}

function getSequenceNo(date, format){
    var startTime = new Date(config.serviceStartTime).add('h', -config.currentTimeZoneDiff);
    switch(format){
        case 'weeks':
            var dayOfWeek = startTime.getDay();
            if(dayOfWeek == 0){
                // getDay will return 0 if it is Sunday
                dayOfWeek = 7;
            }

            startTime = startTime.add('d', 1-dayOfWeek);
            break;
        case 'months':
            var dayOfMonth = startTime.getDate();
            startTime = startTime.add('d', 1-dayOfMonth);
            break;
        case 'years':
            var start = new Date(startTime.getFullYear(), 0, 0);
            var diff = startTime - start;
            var oneDay = 1000 * 60 * 60 * 24;
            var dayOfYear = Math.floor(diff / oneDay);
            startTime = startTime.add('d', 1-dayOfYear);
            break;
    }

    return moment(date).diff(moment(startTime), format) + 1;
}

module.exports = new DashboardService();