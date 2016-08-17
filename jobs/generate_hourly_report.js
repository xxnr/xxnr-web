/**
 * Created by pepelu on 2016/4/27.
 */
var config = require('../config');
var services = require('../services');
var DashboardService = services.dashboard;
var ReportUpdateTimeModel = require('../models').reportUpdateTime;
var utils = require('../common/utils');
const millisecondsInHour = 60*60*1000;
const concurrency = 10000;

console.log('[', new Date(), '] Start generating hourly reports...');
ReportUpdateTimeModel.findOne({}, function(err, updateTime){
    var lastModifyTime = new Date(config.serviceStartTime).getTime();
    if(updateTime && updateTime.hourly) {
        lastModifyTime = new Date(updateTime.hourly).getTime();
    }

    var currentTime = new Date().getTime();
    var hourDiff = parseInt(currentTime/millisecondsInHour) - parseInt(lastModifyTime/millisecondsInHour);
    var recordedCount = hourDiff;
    var batchGenerateHourlyReport = function(i, max) {
        var promises = [];
        for (; i < max; i++) {
            promises.push(new Promise(function (resolve, reject) {
                DashboardService.generateHourlyReport(i + 1, function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                        resolve();
                    });
            }));
        }

        Promise.all(promises)
            .then(function () {
                if((hourDiff - max) > concurrency){
                    batchGenerateHourlyReport(max, max + concurrency);
                } else if ((hourDiff - max) > 0) {
                    batchGenerateHourlyReport(max, hourDiff);
                } else{
                    // all finished
                    ReportUpdateTimeModel.update({}, {$set: {hourly: new Date()}}, {upsert: true}, function (err, numAffected) {
                        if (err) {
                            console.error('[', new Date(), '] generate hourly reports ReportUpdateTime fail:', err);
                        } else {
                            console.log('[', new Date(), '] generate hourly report job success. ', recordedCount, 'hours recorded');
                        }
                        require('./update_hourly_report_values_by_orders.js');
                    });
                }
            })
            .catch(function (err) {
                console.log('[', new Date(), '] generate hourly report job fail:', err);
                process.exit(0);
            })
    };

    if(hourDiff > concurrency){
        batchGenerateHourlyReport(0, concurrency);
    } else{
        batchGenerateHourlyReport(0, hourDiff);
    }
});
