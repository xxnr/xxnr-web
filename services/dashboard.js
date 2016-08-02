/**
 * Created by pepelu on 2016/4/26.
 */
var mongoose = require('mongoose');
var UserModel = require('../models').user;
var OrderModel = require('../models').order;
var UserSignModel = require('../models').userSign;
var HourlyReportModel = require('../models').hourlyReport;
var AgentReportModel = require('../models').agentReport;
var PotentialCustomerModel = require('../models').potential_customer;
var ReportUpdateTimeModel = require('../models').reportUpdateTime;
var DailyAgentReportModel = require('../models').dailyAgentReport;
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
    var startTime = new Date(currentTime.add('h', -hourMinus).format('yyyy-MM-dd hh')+':00:00');
    var endTime = new Date(currentTime.add('h', -hourMinus + 1).format('yyyy-MM-dd hh')+':00:00');

    // this time is used for recording into hourly report table.
    var queryDateInBeijingTime =  startTime;

    var registeredUserCount = 0;
    var orderCount = 0;
    var paidOrderCount = 0;
    var paidAmount = 0;
    var completedOrderCount = 0;
    var completedOrderPaidAmount = 0;
    var signedUserCount = 0;
    var newPotentialCustomerCount = 0;
    var potentialCustomerRegisteredCount = 0;
    var agentVerifiedCount = 0;
    var RSCVerifiedCount = 0;

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
        // , new Promise(function (resolve, reject) {
        //     getOrderCreatedCount(startTime, endTime, function (err, count) {
        //         if (err) {
        //             reject(err);
        //             return;
        //         }

        //         orderCount = count;
        //         resolve();
        //     })
        // })
        // , new Promise(function (resolve, reject) {
        //     getOrderPaidCount(startTime, endTime, function (err, count) {
        //         if (err) {
        //             reject(err);
        //             return;
        //         }

        //         paidOrderCount = count;
        //         resolve();
        //     })
        // })
        // , new Promise(function (resolve, reject) {
        //     getOrderPaidAmount(startTime, endTime, function (err, amount) {
        //         if (err) {
        //             reject(err);
        //             return;
        //         }

        //         paidAmount = amount;
        //         resolve();
        //     })
        // })
        // , new Promise(function (resolve, reject) {
        //     getCompletedOrderCount(startTime, endTime, function (err, count) {
        //         if (err) {
        //             reject(err);
        //             return;
        //         }

        //         completedOrderCount = count;
        //         resolve();
        //     })
        // })
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
        , new Promise(function (resolve, reject) {
            getAgentVerifiedCount(startTime, endTime, function (err, count) {
                if (err) {
                    reject(err);
                    return;
                }

                agentVerifiedCount = count;
                resolve();
            })
        })
        , new Promise(function (resolve, reject) {
            getRSCVerifiedCount(startTime, endTime, function (err, count) {
                if (err) {
                    reject(err);
                    return;
                }

                RSCVerifiedCount = count;
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
                completedOrderPaidAmount: completedOrderPaidAmount,
                signedUserCount: signedUserCount,
                newPotentialCustomerCount: newPotentialCustomerCount,
                potentialCustomerRegisteredCount: potentialCustomerRegisteredCount,
                agentVerifiedCount: agentVerifiedCount,
                RSCVerifiedCount: RSCVerifiedCount,
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

DashboardService.prototype.updateHourlyReportByOrder = function(hourInBeijingTime, hourlyReport, callback) {
    HourlyReportModel.findOneAndUpdate({hourInBeijingTime:hourInBeijingTime}, {$set:hourlyReport}, function(err){
        if(err){
            console.error(err);
            callback(err);
            return;
        }

        callback();
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
                completedOrderPaidAmount:{$sum:'$completedOrderPaidAmount'},
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
    var startTime = new Date(currentTime.add('d', -dateMinus).format('yyyy-MM-dd')).add('h', -config.currentTimeZoneDiff);
    var endTime = new Date(currentTime.add('d', -dateMinus + 1).format('yyyy-MM-dd')).add('h', -config.currentTimeZoneDiff);

    // this time is used for recording into hourly report table.
    var queryDateInBeijingTime =  startTime;
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
                var completedOrderPaidAmount = 0;
                var paidAmount = 0;
                var newAgentCount = 0;
                var newRSCCount = 0;

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
                        getCompletedOrderCountByAgent(endTime, agent._id, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            completedOrderCount = count;
                            resolve();
                        })
                    }),
                    new Promise(function(resolve, reject){
                        getOrderPaidAmountByAgent(endTime, agent._id, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            paidAmount = count;
                            resolve();
                        })
                    })
                    , new Promise(function(resolve, reject){
                        getCompletedOrderPaidAmountByAgent(endTime, agent._id, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            completedOrderPaidAmount = count;
                            resolve();
                        })
                    })
                    , new Promise(function(resolve, reject){
                        getNewAgentCountByAgent(endTime, agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            newAgentCount = count;
                            resolve();
                        })
                    })
                    , new Promise(function(resolve, reject){
                        getNewRSCCountByAgent(endTime, agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            newRSCCount = count;
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
                            totalCompletedOrderPaidAmount: completedOrderPaidAmount,
                            totalPaidAmount: paidAmount,
                            newAgentCount: newAgentCount,
                            newRSCCount: newRSCCount,
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
                                    AgentReportModel.findOneAndUpdate({agent:agent._id, dayInBeijingTime:dayInBeijingTime}, {$set:agentDailyRecord}, function(err){
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

DashboardService.prototype.updateAgentReportByOrder = function(agentId, dayInBeijingTime, agentRecord, callback) {
    AgentReportModel.findOneAndUpdate({agent:agentId, dayInBeijingTime:dayInBeijingTime}, {$set:agentRecord}, function(err){
        if(err){
            console.error('DashboardService updateAgentReportByOrder err:', err);
            callback(err, agentId, dayInBeijingTime, agentRecord);
            return;
        }
        callback();
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
        case 'NEWAGENT':
            sort = {newAgentCount:order};
            break;
        case 'TOTALPAIDAMOUT':
            sort = {totalPaidAmount:order};
            break;
        case 'TOTALCOMPLETEDPAIDAMOUT':
        default:
            sort = {totalCompletedOrderPaidAmount:order};
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
            .select('-_id agent name phone newInviteeCount totalInviteeCount newPotentialCustomerCount totalPotentialCustomerCount totalCompletedOrderCount totalCompletedOrderPaidAmount totalPaidAmount newAgentCount')
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

/**
 * generate daily agent report per agent per day
 * @param dateMinus
 * @param callback
 */
DashboardService.prototype.generateDailyAgentReport = function(dateMinus, callback) {
    if(typeof dateMinus === 'function'){
        callback = dateMinus;
        dateMinus = 1;
    }

    dateMinus = utils.parseInt(dateMinus, 1);
    if(dateMinus < 1){
        dateMinus = 1;
    }

    var currentTime = new Date();
    var startTime = new Date(currentTime.add('d', -dateMinus).format('yyyy-MM-dd')).add('h', -config.currentTimeZoneDiff);
    var endTime = new Date(currentTime.add('d', -dateMinus + 1).format('yyyy-MM-dd')).add('h', -config.currentTimeZoneDiff);

    // this time is used for recording into hourly report table.
    var queryDateInBeijingTime = startTime;
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
                var newPotentialCustomerCount = 0;
                var newAgentCount = 0;
                var newRSCCount = 0;
                var newOrderCount = 0;
                var newOrderCompletedCount = 0;
                var newOrderPaidCount = 0;
                var newOrderPaidAmount = 0;
                var completedOrderCount = 0;
                var completedOrderPaidAmount = 0;

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
                    })
                    , new Promise(function(resolve, reject){
                        getNewPotentialCountByAgent(startTime, endTime, agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            newPotentialCustomerCount = count;
                            resolve();
                        })
                    })
                    , new Promise(function(resolve, reject){
                        getNewAgentCountByAgent(startTime, endTime, agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            newAgentCount = count;
                            resolve();
                        })
                    })
                    , new Promise(function(resolve, reject){
                        getNewRSCCountByAgent(startTime, endTime, agent, function(err, count){
                            if(err){
                                reject(err);
                                return;
                            }

                            newRSCCount = count;
                            resolve();
                        })
                    })
                    // , new Promise(function(resolve, reject){
                    //     getOrderCreatedCountByAgent(startTime, endTime, agent, function(err, count){
                    //         if(err){
                    //             reject(err);
                    //             return;
                    //         }

                    //         newOrderCount = count;
                    //         resolve();
                    //     })
                    // })
                    // , new Promise(function(resolve, reject){
                    //     getOrderCompletedCountByAgent(startTime, endTime, agent, function(err, count){
                    //         if(err){
                    //             reject(err);
                    //             return;
                    //         }

                    //         newOrderCompletedCount = count;
                    //         resolve();
                    //     })
                    // })
                    // , new Promise(function(resolve, reject){
                    //     getOrderPaidCountByAgent(startTime, endTime, agent, function(err, count){
                    //         if(err){
                    //             reject(err);
                    //             return;
                    //         }

                    //         newOrderPaidCount = count;
                    //         resolve();
                    //     })
                    // })
                    // , new Promise(function(resolve, reject){
                    //     getOrderPaidAmountByAgent(startTime, endTime, agent, function(err, count){
                    //         if(err){
                    //             reject(err);
                    //             return;
                    //         }

                    //         newOrderPaidAmount = count;
                    //         resolve();
                    //     })
                    // })
                    // , new Promise(function(resolve, reject){
                    //     getCompletedOrderCountByAgent(startTime, endTime, agent, function(err, count){
                    //         if(err){
                    //             reject(err);
                    //             return;
                    //         }

                    //         completedOrderCount = count;
                    //         resolve();
                    //     })
                    // })
                    // , new Promise(function(resolve, reject){
                    //     getCompletedOrderPaidAmountByAgent(startTime, endTime, agent, function(err, count){
                    //         if(err){
                    //             reject(err);
                    //             return;
                    //         }

                    //         completedOrderPaidAmount = count;
                    //         resolve();
                    //     })
                    // })
                ];

                Promise.all(promises)
                    .then(function() {
                        // create document for this agent
                        var agentDailyRecord = {
                            agent: agent,
                            name: agent.name,
                            phone: agent.account,
                            newInviteeCount: newInviteeCount,
                            newPotentialCustomerCount: newPotentialCustomerCount,
                            newAgentCount: newAgentCount,
                            newRSCCount: newRSCCount,
                            newOrderCount: newOrderCount,
                            completedOrderCount: completedOrderCount,
                            completedOrderPaidAmount: completedOrderPaidAmount,
                            dateTime: currentTime,
                            dayInBeijingTime: dayInBeijingTime,
                            weekInBeijingTime: weekInBeijingTime,
                            monthInBeijingTime: monthInBeijingTime,
                            yearInBeijingTime: yearInBeijingTime,
                            daySequenceNo: getSequenceNo(queryDateInBeijingTime, 'days'),
                            weekSequenceNo: getSequenceNo(queryDateInBeijingTime, 'weeks'),
                            monthSequenceNo: getSequenceNo(queryDateInBeijingTime, 'months'),
                            yearSequenceNo: getSequenceNo(queryDateInBeijingTime, 'years')
                        };

                        var dailyAgentReportModel = new DailyAgentReportModel(agentDailyRecord);
                        dailyAgentReportModel.save(function(err){
                            if(err){
                                if(11000 == err.code){
                                    // already has record of this hour, need update
                                    DailyAgentReportModel.findOneAndUpdate({agent:agent._id, dayInBeijingTime:dayInBeijingTime}, {$set:agentDailyRecord}, function(err){
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
    });
};

DashboardService.prototype.updateDailyAgentReportByOrder = function(agentId, dayInBeijingTime, agentDailyRecord, callback) {
    DailyAgentReportModel.findOneAndUpdate({agent:agentId, dayInBeijingTime:dayInBeijingTime}, {$set:agentDailyRecord}, function(err){
        if(err){
            console.error('DashboardService updateDailyAgentReportByOrder err:', err);
            callback(err, agentId, dayInBeijingTime, agentDailyRecord);
            return;
        }
        callback();
    })
};

DashboardService.prototype.queryAgentReportByDates = function(callback, dateStart, dateEnd, agentIds, type, sortBy, order, page, max){
    var self = this;
    agentReportGroupByDimension(self.Dimension.day, dateStart, dateEnd, agentIds, type, sortBy, order, page, max, callback);
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
// var getOrderCreatedCount = function(dateStart, dateEnd, callback){
//     UserService.getTestAccountList(function(err, testAccountList){
//         if(err){
//             callback(err);
//             return;
//         }

//         var querier = {buyerId:{$nin:testAccountList}};
//         if(typeof(dateEnd) === 'function') {
//             // query from the very beginning till dateEnd
//             callback = dateEnd;
//             dateEnd = dateStart;
//             dateStart = null;
//         }

//         querier.dateCreated = {
//             $lt: dateEnd
//         };

//         if(dateStart){
//             querier.dateCreated.$gte = dateStart;
//         }

//         OrderModel.count(querier, function(err, count){
//             if(err){
//                 console.error(err);
//                 callback('query order count fail');
//                 return;
//             }

//             callback(null, count);
//         })
//     })
// };

/**
 * get order paid count by creation date, part paid included, except test order
 * @param dateStart
 * @param dateEnd
 * @param callback
 */
// var getOrderPaidCount = function(dateStart, dateEnd, callback){
//     UserService.getTestAccountList(function(err, testAccountList) {
//         if (err) {
//             callback(err);
//             return;
//         }

//         var querier = {payStatus: {$in: [PAYMENTSTATUS.PAID, PAYMENTSTATUS.PARTPAID]}, buyerId:{$nin:testAccountList}};
//         if(typeof(dateEnd) === 'function') {
//             // query from the very beginning till dateEnd
//             callback = dateEnd;
//             dateEnd = dateStart;
//             dateStart = null;
//         }

//         querier.dateCreated = {
//             $lt: dateEnd
//         };

//         if(dateStart){
//             querier.dateCreated.$gte = dateStart;
//         }

//         OrderModel.count(querier, function (err, count) {
//             if (err) {
//                 console.error('dashboard service getOrderPaidCount OrderModel count err:', err);
//                 callback('dashboard service getOrderPaidCount OrderModel count err');
//                 return;
//             }

//             callback(null, count);
//         })
//     });
// };

/**
 * get order paid amount by creation date, except test order
 * @param dateStart
 * @param dateEnd
 * @param callback
 */
// var getOrderPaidAmount = function(dateStart, dateEnd, callback) {
//     UserService.getTestAccountList(function(err, testAccountList) {
//         if (err) {
//             callback(err);
//             return;
//         }

//         var querier = {payStatus: {$in: [PAYMENTSTATUS.PAID, PAYMENTSTATUS.PARTPAID]}, buyerId:{$nin:testAccountList}};
//         if(typeof(dateEnd) === 'function') {
//             // query from the very beginning till dateEnd
//             callback = dateEnd;
//             dateEnd = dateStart;
//             dateStart = null;
//         }

//         querier.dateCreated = {
//             $lt: dateEnd
//         };

//         if(dateStart){
//             querier.dateCreated.$gte = dateStart;
//         }

//         OrderModel.aggregate({$match: querier}
//             , {
//                 $group: {
//                     _id: null,
//                     totalPrice: {
//                         $sum: "$price"
//                     },
//                     totalDuePrice: {
//                         $sum: "$duePrice"
//                     }
//                 }
//             })
//             .exec(function (err, data) {
//                 if (err) {
//                     console.error('dashboard service getOrderPaidAmount OrderModel aggregate err:', err);
//                     callback('dashboard service getOrderPaidAmount OrderModel aggregate err');
//                     return;
//                 }

//                 if (utils.isArray(data) && data.length > 0) {
//                     callback(null, parseFloat((data[0].totalPrice - data[0].totalDuePrice).toFixed(2)));
//                 } else{
//                     callback(null, 0);
//                 }
//             })
//     });
// };

/**
 * get completed order count by creation date, except test order
 * @param dateStart
 * @param dateEnd
 * @param callback
 */
// var getCompletedOrderCount = function(dateStart, dateEnd, callback){
//     UserService.getTestAccountList(function(err, testAccountList) {
//         if (err) {
//             callback(err);
//             return;
//         }

//         var querier = {deliverStatus:DELIVERSTATUS.RECEIVED, buyerId:{$nin:testAccountList}};
//         if(typeof(dateEnd) === 'function') {
//             // query from the very beginning till dateEnd
//             callback = dateEnd;
//             dateEnd = dateStart;
//             dateStart = null;
//         }

//         querier.dateCreated = {
//             $lt: dateEnd
//         };

//         if(dateStart){
//             querier.dateCreated.$gte = dateStart;
//         }

//         OrderModel.count(querier, function (err, count) {
//             if (err) {
//                 console.error('dashboard service getCompletedOrderCount OrderModel count err:', err);
//                 callback('dashboard service getCompletedOrderCount OrderModel count err');
//                 return;
//             }

//             callback(null, count);
//         })
//     });
// };

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
                console.error('dashboard service getSignedUserCount UserSignModel count err:', err);
                callback('dashboard service getSignedUserCount UserSignModel count err');
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
                console.error('dashboard service getNewPotentialCustomerCount PotentialCustomerModel count err:', err);
                callback('dashboard service getNewPotentialCustomerCount PotentialCustomerModel count err');
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
                console.error('dashboard service getPotentialCustomerRegisteredCount PotentialCustomerModel count err:', err);
                callback('dashboard service getPotentialCustomerRegisteredCount PotentialCustomerModel count err');
                return;
            }

            callback(null, count);
        })
};

var getAgentVerifiedCount = function(dateStart, dateEnd, callback){
    var querier = {};
    if(typeof(dateEnd) === 'function') {
        // query from the very beginning till dateEnd
        callback = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    querier.typeVerified = config.XXNRAgentId;
    querier['dateTypeVerified.dateFirstAgent'] = {
        $lt: dateEnd
    };

    if(dateStart){
        querier['dateTypeVerified.dateFirstAgent'].$gte = dateStart;
    }

    UserModel.count(querier, function(err, count){
        if(err){
            console.error('dashboard service getAgentVerifiedCount UserModel count err:', err);
            callback('dashboard service getAgentVerifiedCount UserModel count err');
            return;
        }

        callback(null, count);
    })
};

DashboardService.prototype.getAgentVerifiedCount = getAgentVerifiedCount;

var getRSCVerifiedCount = function(dateStart, dateEnd, callback){
    var querier = {};
    if(typeof(dateEnd) === 'function') {
        // query from the very beginning till dateEnd
        callback = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    querier.typeVerified = config.RSCId;
    querier['dateTypeVerified.dateFirstRSC'] = {
        $lt: dateEnd
    };

    if(dateStart){
        querier['dateTypeVerified.dateFirstRSC'].$gte = dateStart;
    }

    UserModel.count(querier, function(err, count){
        if(err){
            console.error('dashboard service getRSCVerifiedCount UserModel count err:', err);
            callback('dashboard service getRSCVerifiedCount UserModel count err');
            return;
        }

        callback(null, count);
    })
};

DashboardService.prototype.getRSCVerifiedCount = getRSCVerifiedCount;

function getNewInviteeCountByAgent(dateStart, dateEnd, agent, callback){
    if(typeof(agent) === 'function') {
        // query from the very beginning till dateEnd
        callback = agent;
        agent = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    var querier = {inviter:agent, dateinvited:{$lt:dateEnd}};

    if(dateStart){
        querier.dateinvited.$gte = dateStart;
    }

    UserModel.count(querier, function(err, count){
        if(err){
            console.error('dashboard service getNewInviteeCountByAgent UserModel count err:', err);
            callback('dashboard service getNewInviteeCountByAgent UserModel count err');
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
            console.error('dashboard service getNewPotentialCountByAgent PotentialCustomerModel count err:', err);
            callback('dashboard service getNewPotentialCountByAgent PotentialCustomerModel count err');
            return;
        }

        callback(null, count);
    })
}

// function getPaidAmountByAgent(dateStart, dateEnd, agent, callback) {
//     if (typeof(agent) === 'function') {
//         // query from the very beginning till dateEnd
//         callback = agent;
//         agent = dateEnd;
//         dateEnd = dateStart;
//         dateStart = null;
//     }

//     UserModel.find({inviter: agent}, function (err, users) {
//         if (err) {
//             console.error(err);
//             callback(err);
//             return;
//         }

//         var userIds = [];
//         users.forEach(function (user) {
//             userIds.push(user.id);
//         });

//         // var querier = {dateCreated:{$lt:dateEnd}, buyerId:{$in:userIds}, payStatus: {$in: [PAYMENTSTATUS.PAID, PAYMENTSTATUS.PARTPAID]}};
//         var querier = {deliverStatus: DELIVERSTATUS.RECEIVED, buyerId:{$in:userIds}, dateCreated:{$lt:dateEnd}};

//         if(dateStart){
//             querier.dateCreated.$gte = dateStart;
//         }

//         // OrderModel.aggregate({$match: querier}
//         //     , {
//         //         $group: {
//         //             _id: null,
//         //             totalPrice: {
//         //                 $sum: "$price"
//         //             },
//         //             totalDuePrice: {
//         //                 $sum: "$duePrice"
//         //             }
//         //         }
//         //     })
//         //     .exec(function (err, data) {
//         //         if (err) {
//         //             console.error(err);
//         //             callback(err);
//         //             return;
//         //         }

//         //         if (utils.isArray(data) && data.length > 0) {
//         //             callback(null, parseFloat((data[0].totalPrice - data[0].totalDuePrice).toFixed(2)));
//         //         } else{
//         //             callback(null, 0);
//         //         }
//         //     })
//         OrderModel.aggregate({$match: querier}
//             , {
//                 $group: {
//                     _id: null,
//                     totalPrice: {
//                         $sum: "$price"
//                     }
//                 }
//             })
//             .exec(function (err, data) {
//                 if (err) {
//                     console.error(err);
//                     callback(err);
//                     return;
//                 }

//                 if (utils.isArray(data) && data.length > 0) {
//                     callback(null, parseFloat((data[0].totalPrice).toFixed(2)));
//                 } else{
//                     callback(null, 0);
//                 }
//             })
//     });
// }

var getNewAgentCountByAgent = function(dateStart, dateEnd, agent, callback){
    if(typeof(agent) === 'function') {
        // query from the very beginning till dateEnd
        callback = agent;
        agent = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    var querier = {typeVerified: config.XXNRAgentId, inviter: agent};
    querier['dateTypeVerified.dateFirstAgent'] = {$lt:dateEnd};

    if(dateStart){
        querier['dateTypeVerified.dateFirstAgent'].$gte = dateStart;
    }

    UserModel.count(querier, function(err, count){
        if(err){
            console.error('dashboard service getNewAgentCountByAgent UserModel count err:', err);
            callback('dashboard service getNewAgentCountByAgent UserModel count err');
            return;
        }

        callback(null, count);
    })
}

DashboardService.prototype.getNewAgentCountByAgent = getNewAgentCountByAgent;

var getNewRSCCountByAgent = function(dateStart, dateEnd, agent, callback){
    if(typeof(agent) === 'function') {
        // query from the very beginning till dateEnd
        callback = agent;
        agent = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    var querier = {typeVerified: config.RSCId, inviter: agent};
    querier['dateTypeVerified.dateFirstRSC'] = {$lt:dateEnd};

    if(dateStart){
        querier['dateTypeVerified.dateFirstRSC'].$gte = dateStart;
    }

    UserModel.count(querier, function(err, count){
        if(err){
            console.error('dashboard service getNewRSCCountByAgent UserModel count err:', err);
            callback('dashboard service getNewRSCCountByAgent UserModel count err');
            return;
        }

        callback(null, count);
    })
}

DashboardService.prototype.getNewRSCCountByAgent = getNewRSCCountByAgent;

/**
 * get order created count by creation date
 * @param dateStart
 * @param dateEnd
 * @param agent
 * @param callback
 */
// var getOrderCreatedCountByAgent = function(dateStart, dateEnd, agent, callback){
//     if(typeof(agent) === 'function') {
//         // query from the very beginning till dateEnd
//         callback = agent;
//         agent = dateEnd;
//         dateEnd = dateStart;
//         dateStart = null;
//     }
//     UserModel.find({inviter:agent}, function(err, users){
//         if(err){
//             console.error('dashboard service getOrderCreatedCountByAgent UserModel find err:', err);
//             callback('dashboard service getOrderCreatedCountByAgent UserModel find err');
//             return;
//         }

//         var userIds = [];
//         users.forEach(function(user){
//             userIds.push(user.id);
//         });

//         var querier = {buyerId:{$in:userIds}};
//         querier.dateCreated = {
//             $lt: dateEnd
//         };

//         if(dateStart){
//             querier.dateCreated.$gte = dateStart;
//         }

//         OrderModel.count(querier, function(err, count){
//             if(err){
//                 console.error('dashboard service getOrderCreatedCountByAgent OrderModel count err:', err);
//                 callback('dashboard service getOrderCreatedCountByAgent OrderModel count err');
//                 return;
//             }

//             callback(null, count);
//         });
//     });
// };

/**
 * get new created order completed count by creation date
 * @param dateStart
 * @param dateEnd
 * @param agent
 * @param callback
 */
// var getOrderCompletedCountByAgent = function(dateStart, dateEnd, agent, callback){
//     if(typeof(agent) === 'function') {
//         // query from the very beginning till dateEnd
//         callback = agent;
//         agent = dateEnd;
//         dateEnd = dateStart;
//         dateStart = null;
//     }
//     UserModel.find({inviter:agent}, function(err, users){
//         if(err){
//             console.error('dashboard service getOrderCompletedCountByAgent UserModel find err:', err);
//             callback('dashboard service getOrderCompletedCountByAgent UserModel find err');
//             return;
//         }

//         var userIds = [];
//         users.forEach(function(user){
//             userIds.push(user.id);
//         });

//         var querier = {deliverStatus:DELIVERSTATUS.RECEIVED, buyerId:{$in: userIds}};
//         querier.dateCreated = {
//             $lt: dateEnd
//         };

//         if(dateStart){
//             querier.dateCreated.$gte = dateStart;
//         }

//         OrderModel.count(querier, function (err, count) {
//             if (err) {
//                 console.error('dashboard service getOrderCompletedCountByAgent OrderModel count err:', err);
//                 callback('dashboard service getOrderCompletedCountByAgent OrderModel count err');
//                 return;
//             }

//             callback(null, count);
//         });
//     });
// };

/**
 * get order paid count by creation date, part paid included
 * @param dateStart
 * @param dateEnd
 * @param agent
 * @param callback
 */
// var getOrderPaidCountByAgent = function(dateStart, dateEnd, agent, callback){
//     if(typeof(agent) === 'function') {
//         // query from the very beginning till dateEnd
//         callback = agent;
//         agent = dateEnd;
//         dateEnd = dateStart;
//         dateStart = null;
//     }
//     UserModel.find({inviter:agent}, function(err, users){
//         if(err){
//             console.error('dashboard service getOrderPaidCountByAgent UserModel find err:', err);
//             callback('dashboard service getOrderPaidCountByAgent UserModel find err');
//             return;
//         }

//         var userIds = [];
//         users.forEach(function(user){
//             userIds.push(user.id);
//         });

//         var querier = {payStatus: {$in: [PAYMENTSTATUS.PAID, PAYMENTSTATUS.PARTPAID] }, buyerId:{$in: userIds}};
//         querier.dateCreated = {
//             $lt: dateEnd
//         };

//         if(dateStart){
//             querier.dateCreated.$gte = dateStart;
//         }

//         OrderModel.count(querier, function (err, count) {
//             if (err) {
//                 console.error('dashboard service getOrderPaidCountByAgent OrderModel count err:', err);
//                 callback('dashboard service getOrderPaidCountByAgent OrderModel count err');
//                 return;
//             }

//             callback(null, count);
//         });
//     });
// };

/**
 * get order paid amount by creation date
 * @param dateStart
 * @param dateEnd
 * @param agent
 * @param callback
 */
var getOrderPaidAmountByAgent = function(dateStart, dateEnd, agent, callback) {
    if(typeof(agent) === 'function') {
        // query from the very beginning till dateEnd
        callback = agent;
        agent = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }
    var query = {$match: {agent: agent}};
    var key = 'dayInBeijingTime';
    if (dateStart) {
        query['$match'][key] = {$gte: dateStart};
    }

    if (dateEnd) {
        query['$match'][key] ? query['$match'][key]['$lte'] = dateEnd : query['$match'][key] = {$lte: dateEnd};
    }

    DailyAgentReportModel.aggregate(query
        , {
            $group: {
                _id: null,
                totalPaidAmount: {$sum: '$newOrderCompletedPaidAmount'}
            }
        })
        .exec(function (err, data) {
            if (err) {
                console.error('dashboard service getOrderPaidAmountByAgent DailyAgentReportModel aggregate err:', err);
                callback('dashboard service getOrderPaidAmountByAgent DailyAgentReportModel aggregate err');
                return;
            }

            if (utils.isArray(data) && data.length > 0) {
                callback(null, parseFloat((data[0].totalPaidAmount).toFixed(2)));
            } else{
                callback(null, 0);
            }
        });
    // UserModel.find({inviter:agent}, function(err, users){
    //     if(err){
    //         console.error('dashboard service getOrderPaidAmountByAgent UserModel find err:', err);
    //         callback('dashboard service getOrderPaidAmountByAgent UserModel find err');
    //         return;
    //     }

    //     var userIds = [];
    //     users.forEach(function(user){
    //         userIds.push(user.id);
    //     });

    //     var querier = {payStatus: {$in: [PAYMENTSTATUS.PAID, PAYMENTSTATUS.PARTPAID] }, buyerId:{$in: userIds}};
    //     querier.dateCreated = {
    //         $lt: dateEnd
    //     };

    //     if(dateStart){
    //         querier.dateCreated.$gte = dateStart;
    //     }

    //     OrderModel.aggregate({$match: querier}
    //         , {
    //             $group: {
    //                 _id: null,
    //                 totalPrice: {
    //                     $sum: "$price"
    //                 },
    //                 totalDuePrice: {
    //                     $sum: "$duePrice"
    //                 }
    //             }
    //         })
    //         .exec(function (err, data) {
    //             if (err) {
    //                 console.error('dashboard service getOrderPaidAmountByAgent OrderModel aggregate err:', err);
    //                 callback('dashboard service getOrderPaidAmountByAgent OrderModel aggregate err');
    //                 return;
    //             }

    //             if (utils.isArray(data) && data.length > 0) {
    //                 callback(null, parseFloat((data[0].totalPrice - data[0].totalDuePrice).toFixed(2)));
    //             } else{
    //                 callback(null, 0);
    //             }
    //         })
    // });
};
DashboardService.prototype.getOrderPaidAmountByAgent = getOrderPaidAmountByAgent;

/**
 * get completed order count by creation date
 * @param dateStart
 * @param dateEnd
 * @param agent
 * @param callback
 */
var getCompletedOrderCountByAgent = function(dateStart, dateEnd, agent, callback){
    if(typeof(agent) === 'function') {
        // query from the very beginning till dateEnd
        callback = agent;
        agent = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    var query = {$match: {agent: agent}};
    var key = 'dayInBeijingTime';
    if (dateStart) {
        query['$match'][key] = {$gte: dateStart};
    }

    if (dateEnd) {
        query['$match'][key] ? query['$match'][key]['$lte'] = dateEnd : query['$match'][key] = {$lte: dateEnd};
    }

    DailyAgentReportModel.aggregate(query
        , {
            $group: {
                _id: null,
                totalCompletedOrderCount: {$sum: '$completedOrderCount'}
            }
        })
        .exec(function (err, data) {
            if (err) {
                console.error('dashboard service getCompletedOrderCountByAgent DailyAgentReportModel aggregate err:', err);
                callback('dashboard service getCompletedOrderCountByAgent DailyAgentReportModel aggregate err');
                return;
            }

            if (utils.isArray(data) && data.length > 0) {
                callback(null, parseFloat((data[0].totalCompletedOrderCount).toFixed(2)));
            } else{
                callback(null, 0);
            }
        });
    // UserModel.find({inviter:agent}, function(err, users){
    //     if(err){
    //         console.error('dashboard service getCompletedOrderCountByAgent UserModel find err:', err);
    //         callback('dashboard service getCompletedOrderCountByAgent UserModel find err');
    //         return;
    //     }

    //     var userIds = [];
    //     users.forEach(function(user){
    //         userIds.push(user.id);
    //     });

    //     var querier = {deliverStatus:DELIVERSTATUS.RECEIVED, buyerId:{$in: userIds}};
    //     querier.dateCompleted = {
    //         $lt: dateEnd
    //     };

    //     if(dateStart){
    //         querier.dateCompleted.$gte = dateStart;
    //     }

    //     OrderModel.count(querier, function (err, count) {
    //         if (err) {
    //             console.error('dashboard service getCompletedOrderCountByAgent OrderModel count err:', err);
    //             callback('dashboard service getCompletedOrderCountByAgent OrderModel count err');
    //             return;
    //         }

    //         callback(null, count);
    //     })
    // });
};
DashboardService.prototype.getCompletedOrderCountByAgent = getCompletedOrderCountByAgent;

/**
 * get completed order paid mount by creation date
 * @param dateStart
 * @param dateEnd
 * @param agent
 * @param callback
 */
var getCompletedOrderPaidAmountByAgent = function(dateStart, dateEnd, agent, callback){
    if(typeof(agent) === 'function') {
        // query from the very beginning till dateEnd
        callback = agent;
        agent = dateEnd;
        dateEnd = dateStart;
        dateStart = null;
    }

    var query = {$match: {agent: agent}};
    var key = 'dayInBeijingTime';
    if (dateStart) {
        query['$match'][key] = {$gte: dateStart};
    }

    if (dateEnd) {
        query['$match'][key] ? query['$match'][key]['$lte'] = dateEnd : query['$match'][key] = {$lte: dateEnd};
    }

    DailyAgentReportModel.aggregate(query
        , {
            $group: {
                _id: null,
                totalCompletedOrderPaidAmount: {$sum: '$completedOrderPaidAmount'}
            }
        })
        .exec(function (err, data) {
            if (err) {
                console.error('dashboard service getCompletedOrderPaidAmountByAgent DailyAgentReportModel aggregate err:', err);
                callback('dashboard service getCompletedOrderPaidAmountByAgent DailyAgentReportModel aggregate err');
                return;
            }

            if (utils.isArray(data) && data.length > 0) {
                callback(null, parseFloat((data[0].totalCompletedOrderPaidAmount).toFixed(2)));
            } else{
                callback(null, 0);
            }
        });
    // UserModel.find({inviter:agent}, function(err, users){
    //     if(err){
    //         console.error('dashboard service getCompletedOrderPaidAmountByAgent UserModel find err:', err);
    //         callback('dashboard service getCompletedOrderPaidAmountByAgent UserModel find err');
    //         return;
    //     }

    //     var userIds = [];
    //     users.forEach(function(user){
    //         userIds.push(user.id);
    //     });

    //     var querier = {deliverStatus:DELIVERSTATUS.RECEIVED, buyerId:{$in: userIds}};
    //     querier.dateCompleted = {
    //         $lt: dateEnd
    //     };

    //     if(dateStart){
    //         querier.dateCompleted.$gte = dateStart;
    //     }

    //     OrderModel.aggregate({$match: querier}
    //         , {
    //             $group: {
    //                 _id: null,
    //                 totalPrice: {
    //                     $sum: "$price"
    //                 }
    //             }
    //         })
    //         .exec(function (err, data) {
    //             if (err) {
    //                 console.error('dashboard service getCompletedOrderPaidAmountByAgent OrderModel aggregate err:', err);
    //                 callback('dashboard service getCompletedOrderPaidAmountByAgent OrderModel aggregate err');
    //                 return;
    //             }

    //             if (utils.isArray(data) && data.length > 0) {
    //                 callback(null, parseFloat((data[0].totalPrice).toFixed(2)));
    //             } else{
    //                 callback(null, 0);
    //             }
    //         });
    // });
};

DashboardService.prototype.getCompletedOrderPaidAmountByAgent = getCompletedOrderPaidAmountByAgent;

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
            agentVerifiedCount: 1,
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
                agentVerifiedCount: {$sum: '$agentVerifiedCount'},
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

function agentReportGroupByDimension(dimension, dateStart, dateEnd, agents, type, sortBy, order, page, max, callback) {
    order = U.parseInt(order, -1);
    var sort = {newOrderCompletedCount:order};
    var project = {
        $project: {
            newInviteeCount: 1,
            newPotentialCustomerCount: 1,
            newAgentCount: 1,
            newRSCCount: 1,
            newOrderCount: 1,
            newOrderCompletedCount: 1
        }
    };
    var group = {
        $group: {
            newInviteeCount: {$sum: '$newInviteeCount'},
            newPotentialCustomerCount: {$sum: '$newPotentialCustomerCount'},
            newAgentCount: {$sum: '$newAgentCount'},
            newRSCCount: {$sum: '$newRSCCount'},
            newOrderCount: {$sum: '$newOrderCount'},
            newOrderCompletedCount: {$sum: '$newOrderCompletedCount'}
        }
    };
    
    if (type == 2) {
        sort = {completedOrderPaidAmount:order};
        project = {
            $project: {
                completedOrderCount: 1,
                completedOrderPaidAmount: 1
            }
        };
        group = {
            $group: {
                completedOrderCount: {$sum: '$completedOrderCount'},
                completedOrderPaidAmount: {$sum: '$completedOrderPaidAmount'}
            }
        };
    }
    project['$project']['_id'] = 0;
    project['$project']['sequenceNo'] = 1;
    project['$project'][dimension.name] = '$' + key;
    project['$project']['name'] = 1;
    project['$project']['phone'] = 1;
    group['$group']['_id'] = '$agent';
    group['$group']['sequenceNo'] = {$min: '$' + dimension.sequenceKey};
    group['$group']['name'] = {$last: '$name'};
    group['$group']['phone'] = {$last: '$phone'};
    switch(sortBy){
        case 'NEWINVITEE':
            sort = {newInviteeCount:order};
            break;
        case 'NEWPOTENTIALCUSTOMER':
            sort = {newPotentialCustomerCount:order};
            break;
        case 'NEWAGENT':
            sort = {newAgentCount:order};
            break;
        case 'NEWORDER':
            sort = {newOrderCount:order};
            break;
        case 'NEWORDERCOMPLETED':
            sort = {newOrderCompletedCount:order};
            break;
        case 'COMPLETEDORDER':
            sort = {completedOrderCount:order};
            break;
        case 'COMPLETEDORDERPAIDAMOUT':
            sort = {completedOrderPaidAmount:order};
            break;
    }

    page = U.parseInt(page) - 1;
    page = page < 0 ? 0 : page;
    max = U.parseInt(max, 20) 
    max = max > 50 ? 50 : max;
    var take = U.parseInt(max);
    var skip = U.parseInt(page * max);
    var key = dimension.key;
    var query = {$match: {}};
    if (agents) {
        query['$match']['agent'] = {$in: agents};
    }
    if (dateStart) {
        query['$match'][key] = {$gte: dateStart};
    }

    if (dateEnd) {
        query['$match'][key] ? query['$match'][key]['$lte'] = dateEnd : query['$match'][key] = {$lte: dateEnd};
    }

    var sortInfo = {$sort: sort};
    // var limitInfo = {$limit: take};
    // var skipInfo = {$skip: skip};
    DailyAgentReportModel.aggregate(query
        , group
        , project
        , sortInfo
        // , skipInfo
        // , limitInfo
        )
        .exec(function (err, items) {
            if (err) {
                console.error(err);
                callback(err);
                return;
            }

            if (tools.isArray(items) && items.length > 0) {
                var result = {};
                result.count = items.length;
                result.items = items.slice(skip,skip+take);

                // Gets page count
                result.pageCount = Math.floor(result.count / max) + (result.count % max ? 1 : 0);
                if (result.pageCount === 0)
                    result.pageCount = 1;
                result.page = page + 1;
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

/**
 * get agent count
 * @param callback
 */
DashboardService.prototype.getAgentCount = function(callback){
    // first get all agents count
    UserModel.count({typeVerified:config.XXNRAgentId}, function(err, count){
        if(err){
            console.error('DashboardService getAgentCount UserModel count err:', err);
            callback('query agent count fail');
            return;
        }

        callback(null, count);
    });
}

module.exports = new DashboardService();