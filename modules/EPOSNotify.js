/**
 * Created by pepelu on 2016/3/25.
 */
var EPOSConfig = require('../configuration/EPOS_config').EPOSConfig;

var EPOSNotify = function(){};

EPOSNotify.prototype.decryptParams = function(params){
    var des3_decipher = crypto.createDecipher("des3", EPOSConfig.DES3Secret);
    return des3_decipher.update(params, "utf8");
};

EPOSNotify.prototype.verifySignature = function(params, signature){
    var verify = crypto.createVerify('RSA-SHA1');
    return verify.update(decrypted_params).verify(EPOSConfig.RSAPublicKey, signature);
};

module.exports = new EPOSNotify();