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
    signedUserCount:Number,         // signed user count in this hour
    newPotentialCustomerCount:Number,           // new potential customer count in this hour
    potentialCustomerRegisteredCount:Number,    // potential customer registered count in this hour
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
    agentReport:{type:Date, default:function(){return new Date(config.serviceStartTime)}}
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
    totalPaidAmount:Number,                         // total paid amount until this day
    dateTime:{type:Date, default:Date.now},
    dayInBeijingTime:{type:String},
    weekInBeijingTime:{type:String},
    monthInBeijingTime:{type:String},
    yearInBeijingTime:{type:String}
});

agentReportSchema.index({agent:1, dayInBeijingTime:1}, {unique:true});

mongoose.model('hourlyReport', schema);
mongoose.model('reportUpdateTime', reportUpdateTimeSchema);
mongoose.model('agentReport', agentReportSchema);