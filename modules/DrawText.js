/**
 * Created by pepelu on 2016/6/28.
 */
module.exports = function(str, callback){
    var php_processor = require("../common/php_processor");
    var commandLine = '\"' + require('path').resolve(__filename + '/../../external/DrawText/' + 'DrawText.php') + '\"';
    commandLine += ` --str=${str}`;

    new php_processor(commandLine).execute(function(output, error) {
        if (error) {
            console.error('draw text fail with error:', error);
            callback();
        }

        var index = 0;
        const BOM = 65279; // include_once utf-8 php will invole BOM
        while (output.charCodeAt(index) == BOM) index++;
        var imgBase64 = output.substring(index);
        var imgBuffer = new Buffer(new Buffer(imgBase64, 'base64').toString('binary'), 'binary');
        callback(imgBuffer);
    })
};