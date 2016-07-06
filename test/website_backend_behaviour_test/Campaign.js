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

    describe('framework apis', function(){
        it('create campaign api');
        it('frontend query campaign api');
        it('get campaign page api');
        it('check campaign status api');
        it('backend query campaign api');
    });

    describe('create new campaign -> query backend -> query frontend -> get campaign page', function(){
        beforeEach('prepare default campaign page', function(){});
        afterEach('delete all campaigns', function(){});
        it('propagate campaign');
        it('Q/A campaign');
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

    describe('Q/A campaign apis', function(){
        before('create Q/A campaign', function(){});
        after('delete all campaigns', function(){});
        it('query Q/A api');
        it('require reward api');
    });

    describe('reward times and query', function(){
        before('create Q/A campaign, w/ reward times 1', function(){});
        after('delete all campaigns', function(){});
        it('request reward -> check campaign status, got times up -> check points, got added -> request reward, got times up -> check points, got not added');
    });
});