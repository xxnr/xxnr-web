/**
 * Created by pepelu on 2016/6/21.
 */
console.log('pre-run');
var deasync = require('deasync');
var deployment = require('../../deployment');
deasync(deployment.deploy_database_basic)();
console.log('Deploy database basic success!!!!');