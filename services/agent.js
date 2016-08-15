/**
 * Created by zhouxin on 2016/5/19.
 */
var mongoose = require("mongoose");
var UserModel = require('../models').user;
var tools = require('../common/tools');

// Service
var AgentService = function(){};

AgentService.prototype.getAgent = function(_id, callback) {
    var query = null;
    if (_id) {
        query = {_id:_id};
    }
    if (query) {
        UserModel.findOne(query)
            .populate('address.province')
            .populate('address.city')
            .populate('address.county')
            .populate('address.town')
            .select('id name account sex datecreated address')
            .exec(function (err, agent) {
                if (err) {
                    console.error('AgentService getAgent findOne err:', err);
                    callback('error query agent:', err);
                    return;
                }

                callback(null, agent);
            });
    } else {
        callback('need query params', null);
    }
};

AgentService.prototype.getAgentList = function(province, city, county, town, page, max, search, options, callback, all) {
    var query = buildQuery(province, city, county, town, search, options);

    if(page<0 || !page){
        page = 0;
    }

    if(max<0 || !max){
        max = 20;
    }

    if(max>50){
        max = 50;
    }

    UserModel.count(query, function(err, count) {
        if (err) {
            console.error('AgentService getAgentList count err:', err);
            callback('error query agents:', err);
            return;
        }

        if (all) {
            max = count;
        }

        UserModel.find(query)
            .sort({datecreated: -1})
            .skip(page * max)
            .limit(max)
            .populate('address.province')
            .populate('address.city')
            .populate('address.county')
            .populate('address.town')
            .select('_id id name account datecreated address')
            .exec(function (err, agents) {
                if (err) {
                    console.error('AgentService getAgentList find err:', err);
                    callback('error query agents:', err);
                    return;
                }

                var pageCount = Math.floor(count / max) + (count % max ? 1 : 0);
                callback(null, agents, count, pageCount);
            });
    });
};

function buildQuery(province, city, county, town, search, options){
    var query = {typeVerified:{$all:[6]}};

    if(province){
        query['address.province'] = province;
    }

    if(city){
        query['address.city'] = city;
    }

    if(county){
        query['address.county'] = county;
    }

    if(town){
        query['address.town'] = town;
    }

    if(search){
        query.$or = [{'name':new RegExp(search)}
            , {'account':new RegExp(search)}];
    }

    return query;
}

AgentService.prototype.getInviteeList = function(inviter, page, max, callback){
    var queryOptions = {};
    if(inviter){
        queryOptions.inviter = mongoose.Types.ObjectId(inviter);
    }

    if(page<0 || !page){
        page = 0;
    }

    if(max<0 || !max){
        max = 20;
    }

    if(max>50){
        max = 50;
    }

    UserModel.count(queryOptions, function (err, count) {
        if (err) {
            console.error('AgentService getInviteeList count err:', err);
            callback(err);
            return;
        }
        UserModel.find(queryOptions)
            .sort({dateinvited:-1, datecreated:-1})
            .skip(page * max)
            .limit(max)
            .populate('address.province')
            .populate('address.city')
            .populate('address.county')
            .populate('address.town')
            .select('id name account sex address score registerAgent typeVerified datecreated dateinvited')
            .exec(function (err, invitees) {
                if (err) {
                    console.error('AgentService getInviteeList find err:', err);
                    callback(err);
                    return;
                }

                var pageCount = Math.floor(count / max) + (count % max ? 1 : 0);
                callback(null, invitees, count, pageCount);
            });
    });
}

module.exports = new AgentService();