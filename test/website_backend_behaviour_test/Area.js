/**
 * Created by pepelu on 2016/6/21.
 */
var should = require('should');
var Components = require('./utilities/components');
var test_data = require('./test_data');
var Routing = require('./Routing');

describe('Area', function() {
    var test_address;
    before('prepare test address', function(done){
        Routing.Address.get_address_by_name(test_data.test_address.province, test_data.test_address.city, test_data.test_address.county, test_data.test_address.town, function(err, address){
            should.not.exist(err);
            test_address = address;
            done();
        })
    });

    describe('Province', function () {
        var validateResponse = function (res) {
            res.body.should.have.property('code', '1000');
            res.body.should.containDeep({
                datas: {
                    rows: [{
                        name: '河南',
                        shortName: 'H'
                    }]
                }
            });

            res.body.datas.rows.should.have.a.lengthOf(1);
        };

        Components.testGetAndPost('should return province list with only 河南')
            .call('/api/v2.0/area/getAreaList')
            .end(function (err, res) {
                validateResponse(res);
            });
    });

    describe('City', function(){
        var validateResponse = function(res){
            res.body.should.have.property('code', '1000');
            res.body.should.containDeep({
                code:'1000',
                datas:{
                    rows:[{
                        name:'郑州'
                    },{
                        name:'开封'
                    }]
                }
            });
        };

        Components.testGetAndPost('should return city list')
            .call('/api/v2.0/area/getAreaCity')
            .send(function(){return {provinceId:test_address.province.id}})
            .end(function (err, res) {
                validateResponse(res);
            });
    });

    describe('County', function(){
        var validateResponse = function(res){
            res.body.should.have.property('code', '1000');
            res.body.should.containDeep({
                code:'1000',
                datas:{
                    rows:[{
                        name:'中原'
                    },{
                        name:'金水'
                    }]
                }
            });
        };

        Components.testGetAndPost('should return county list')
            .call('/api/v2.0/area/getAreaCounty')
            .send(function(){return {provinceId:test_address.province.id, cityId:test_address.city.id}})
            .end(function (err, res) {
                validateResponse(res);
            });
    });

    describe('Town', function(){
        var validateResponse = function(res){
            res.body.should.have.property('code', '1000');
            res.body.should.containDeep({
                code:'1000',
                datas:{
                    rows:[{
                        name:'林山寨街道'
                    },{
                        name:'双桥办事处'
                    }]
                }
            });
        };

        Components.testGetAndPost('should return town list')
            .call('/api/v2.0/area/getAreaTown')
            .send(function(){return {provinceId:test_address.province.id, cityId:test_address.city.id, countyId:test_address.county.id}})
            .end(function (err, res) {
                validateResponse(res);
            });
    })
});
