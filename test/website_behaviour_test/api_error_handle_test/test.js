/**
 * Created by pepelu on 2016/5/20.
 */
var assert = require('chai').assert;
require('./Routing/frontend_APIs/area');
require('./Routing/frontend_APIs/user');
describe('Array', function() {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));
        });
    });
});