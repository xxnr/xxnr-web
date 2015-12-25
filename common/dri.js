/**
 * Created by pepelu on 2015/11/30.
 */
var tools = require('./tools');
exports.sendDRI = function (errMessage){
    var driList = JSON.parse(F.config['dri_config']).dri_list;
    for(var i=0; i<driList.length; i++) {
        tools.sendMessage(driList[i], errMessage);
    }
};
