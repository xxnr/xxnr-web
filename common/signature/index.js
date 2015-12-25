module.exports = {
sha1: function (input){
	var crypto = require('crypto'), 
		shasum = crypto.createHash('sha1');
	shasum.update(input);
	return shasum.digest('hex');
},
covertToString: function (obj) {
	var str = '';
	
	for(var i in obj){
		if(obj.hasOwnProperty(i)){
			if(i === 'signature'){
				continue;
			}
			
			str += i + "=" + obj[i] + "&";
		}
	}

	return str.substring(0, str.length - 1);
},
getPrivateKey: function (certificatePath, certificatePwd){
	var php_processor = require("../php_processor");
	var privateKey = null;
	new php_processor('\"' + require('path').resolve(__filename + '/../get-private-key.php') + '\" \"' + require('path').resolve(certificatePath) + '\" \"' + certificatePwd + '\"')
	    .execute(function(result, error){privateKey = result}, true);
	return privateKey;
},
getCertId : function(certificatePath, certificatePwd){
	var php_processor = require("../php_processor");
	var certId = null;
	new php_processor('\"' + require('path').resolve(__filename + '/../get-certificate-id.php') + '\" \"' + require('path').resolve(certificatePath) + '\" \"' + certificatePwd + '\"').
	    execute(function(result, error){certId = result}, true);
	return certId;
},
sign: function (obj, key) {
	var self = this;
	var str = this.covertToString ( obj );
	var obj_sha1x16 = this.sha1 (str, false );
	var crypto = require('crypto'), $signature = crypto.createSign('RSA-SHA1').update(obj_sha1x16).sign(key, 'hex');
	var $signature_base64 = new Buffer($signature).toString('base64');
	console.log('$signature = ' + $signature + ', and $signature_base64=' + $signature_base64);
	obj['signature'] = $signature_base64;
}
};