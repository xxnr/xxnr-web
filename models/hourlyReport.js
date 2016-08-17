/**
 * Created by pepelu on 2016/4/27.
 */
var mongoose = require('mongoose');
var config = require('../config');

var schema = new mongoose.Schema({
    registeredUserCount:Number,         // registered user count in this hour
    orderCount:Number,              // created order count in this hour
    paidOrderCount:Number,          // paid order count in this hour
    paidAmount:Number,              // paid amount in this hour
    completedOrderCount:Number,     // completed order count in this hour
    completedOrderPaidAmount:Number,    // completed order paid amount in this hour
    signedUserCount:Number,         // signed user count in this hour
    newPotentialCustomerCount:Number,           // new potential customer count in this hour
    potentialCustomerRegisteredCount:Number,    // potential customer registered count in this hour
    agentVerifiedCount:Number,    // agent verified count in this hour
    RSCVerifiedCount:Number,    // agent verified count in this hour
    dateTime:{type:Date, default:Date.now},    // date time that this record generated in this hour
    hourInBeijingTime:{type:String, unique:true},            // current hour in Beijing time zone, format: YYYYMMDDHH
    dayInBeijingTime:{type:String, index:true},             // current day in Beijing time zone, format: YYYYMMDD
    weekInBeijingTime:{type:String, index:true},            // current week in Beijing time zone, format: YYYYMMDD
    monthInBeijingTime:{type:String, index:true},           // current month in Beijing time zone, format:YYYYMM
    yearInBeijingTime:{type:String, index:true},            // current year in Beijing time zone, format: YYYY
    hourSequenceNo:Number,
    daySequenceNo:Number,
    weekSequenceNo:Number,
    monthSequenceNo:Number,
    yearSequenceNo:Number
});

var reportUpdateTimeSchema = new mongoose.Schema({
    hourly:{type:Date, default:function(){return new Date(config.serviceStartTime)}},
    agentReport:{type:Date, default:function(){return new Date(config.serviceStartTime)}},
    dailyAgentReport:{type:Date, default:function(){return new Date(config.serviceStartTime)}}
});

var agentReportSchema = new mongoose.Schema({
    agent:{type:mongoose.Schema.ObjectId, ref:"user"},
    name:String,
    phone:String,
    newInviteeCount:Number,                         // new invitee count per day
    newPotentialCustomerCount:Number,               // new potential customer count per day
    totalInviteeCount:Number,                       // total invitee count until this day
    totalPotentialCustomerCount:Number,             // total potential customer count until this day
    totalCompletedOrderCount:Number,                // total completed order count until this day
    totalCompletedOrderPaidAmount:Number,           // total completed order paid amount until this day
    totalPaidAmount:Number,                         // total paid amount until this day
    newAgentCount:Number,                           // new agent count per day
    newRSCCount:Number,                             // new RSC count per day
    dateTime:{type:Date, default:Date.now},
    dayInBeijingTime:{type:String},
    weekInBeijingTime:{type:String},
    monthInBeijingTime:{type:String},
    yearInBeijingTime:{type:String}
});

agentReportSchema.index({agent:1, dayInBeijingTime:1}, {unique:true});

var dailyAgentReportSchema = new mongoose.Schema({
    agent:{type:mongoose.Schema.ObjectId, ref:"user"},
    name:String,
    phone:String,
    newInviteeCount:Number,                         // new invitee count per day
    newPotentialCustomerCount:Number,               // new potential customer count per day
    newAgentCount:Number,                           // new agent count per day
    newRSCCount:Number,                             // new RSC count per day
    newOrderCount:Number,                           // new created order count per day
    completedOrderCount:Number,                     // completed order count per day
    completedOrderPaidAmount:Number,                // completed order paid amount per day
    newOrderCompletedCount:Number,                  // new created order completed count per day
    newOrderCompletedPaidAmount:Number,             // new created order completed paid amount per day
    newOrderPaidCount:Number,                       // new created order paid count per day
    newOrderPaidAmount:Number,                      // new created order paid amount per day
    dateTime:{type:Date, default:Date.now},
    dayInBeijingTime:{type:String},
    weekInBeijingTime:{type:String},
    monthInBeijingTime:{type:String},
    yearInBeijingTime:{type:String},
    daySequenceNo:Number,
    weekSequenceNo:Number,
    monthSequenceNo:Number,
    yearSequenceNo:Number
});
dailyAgentReportSchema.index({agent:1, dayInBeijingTime:-1}, {unique:true});
dailyAgentReportSchema.index({dayInBeijingTime:-1});

mongoose.model('hourlyReport', schema);
mongoose.model('reportUpdateTime', reportUpdateTimeSchema);
mongoose.model('agentReport', agentReportSchema);
mongoose.model('dailyAgentReport', dailyAgentReportSchema);