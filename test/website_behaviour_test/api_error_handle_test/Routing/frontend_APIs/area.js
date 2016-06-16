/**
 * Created by pepelu on 2016/5/23.
 */
var should = require('should');
var common = require('../common');
var request = common.request;
var config = require('../config');

describe('Area', function() {
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

        common.testGetAndPost('should return province list with only 河南')
            .call('/api/v2.0/area/getAreaList')
            .end(function (err, res) {
                validateResponse(res);
            });
    })
});

