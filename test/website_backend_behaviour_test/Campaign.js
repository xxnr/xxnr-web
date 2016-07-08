/**
 * Created by pepelu on 2016/7/5.
 */
var should = require('should');
var Components = require('./utilities/components');
var test_data = require('./test_data');
var Routing = require('./Routing');

describe('campaign', function(){
    before('deploy campaign category', function(){});
    before('prepare campaign banner image', function(){});

    describe('framework', function(){
        describe('apis', function(){
            it('create campaign api');
            it('frontend query campaign api');
            it('get campaign page api');
            it('check campaign status api');
            it('backend query campaign api');
        });

        describe('create new campaign', function(){
            beforeEach('prepare default campaign page', function(){});
            afterEach('delete all campaigns', function(){});
            it('propagate campaign');// create propagate campaign -> query backend, got exact campaign with right property -> query frontend, verify property -> get campaign page, verify property
            it('Q/A campaign');// create Q/A campaign with Q/A -> query backend, got exact campaign with right property -> query frontend, verify property -> get campaign page, verify property -> query Q/A, verify
            it('quiz campaign');// create quiz campaign with questions -> query backend, got exact campaign with right property -> query frontend, verify property -> get campaign page, verify property -> query questions, verify
        });

        describe('online/offline and query', function(){
            before('create campaign A, w/ #datetime now# < online time < start time < end time < offline time',function(){});
            before('create campaign B, w/ online time < #datetime now# < start time < end time < offline time',function(){});
            before('create campaign C, w/ online time < start time < #datetime now# < end time < offline time',function(){});
            before('create campaign D, w/ online time < start time < end time < #datetime now# < offline time',function(){});
            before('create campaign E, w/ online time < start time < end time < offline time < #datetime now# ',function(){});
            after('delete all campaigns', function(){});
            it('backend query campaign -> got A, B, C, D, E w/ right status');
            it('frontend query campaign -> got B, C, D');
            it('check campaign A status -> got not online');
            it('check campaign B status -> got not started');
            it('check campaign C status -> got started');
            it('check campaign D status -> got already ended');
            it('check campaign E status -> got already offline');
            describe('offline campaign api', function(){
                it('offline campaign A, fail -> check campaign A status -> got not online');
                it('offline campaign B -> check campaign B status -> got already offline');
                it('offline campaign C -> check campaign C status -> got already offline');
                it('offline campaign D -> check campaign D status -> got already offline');
                it('offline campaign E, fail -> check campaign E status -> got already offline');
            })
        });

        describe('reward times and query', function(){
            before('create Q/A campaign, w/ reward times 1', function(){});
            after('delete all campaigns', function(){});
            it('request reward -> check campaign status, got times up -> check points, got added -> request reward, got times up -> check points, got not added');
        });
    });

    describe('campaign type', function(){
        describe('Q/A campaign', function(){
            before('create Q/A campaign', function(){});
            after('delete all campaigns', function(){});
            describe('apis', function(){
                it('query Q/A api');
                it('require reward api');
            });

            it('play Q/A campaign');// query Q/A -> require reward with answers, got result -> query user points, got points added -> query user points log, got log points to right campaign
        });

        describe('quiz campaign', function(){
            before('create Quiz campaign', function(){});
            after('delete all campaigns', function(){});
            describe('apis', function(){
                it('query questions api');
                it('user answer api');
                it('backend modify right answer api');
                it('trigger reward job api');
                it('query result api');
            });

            it('play quiz campaign');// query question -> answer -> backend modify right answer -> trigger reward job -> query result, got results -> query user points, got points added -> query user points log, got log points to right campaign
        });
    })
});