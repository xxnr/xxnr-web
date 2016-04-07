/**
 * Created by pepelu on 2016/3/25.
 */
var EPOSConfig = require('../configuration/EPOS_config').EPOSConfig;
var crypto = require('crypto');

var EPOSNotify = function(){};

EPOSNotify.prototype.decryptParams = function(params){
    var key = EPOSConfig.DES3Secret;
    if(key.length == 32){
        key += key.substr(0, 16);
    }

    var decipher = crypto.createDecipheriv("des-ede3", new Buffer(key, 'hex'), new Buffer(0));
    decipher.setAutoPadding(true);
    var decryptedParams = decipher.update(params, "hex", "utf8");
    decryptedParams += decipher.final("utf8");
    return decryptedParams;
};

EPOSNotify.prototype.verifySignature = function(params, signature){
    var verify = crypto.createVerify('RSA-SHA1');
    return verify.update(params).verify(EPOSConfig.RSAPublicKey, signature, 'hex');
};

module.exports = new EPOSNotify();