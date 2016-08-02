/**
 * Created by pepelu on 2016/8/2.
 */
var child_process = require('child_process');
var windowsCommand = "powershell.exe " + __dirname + "/restore_address.ps1";
var linuxCommand = "sh restore_address.sh";
var os = require('os');

exports.restore_address = function(cb) {
    if (os.platform() === 'win32') {
        var result = child_process.execSync(windowsCommand);
        console.log(result.toString());
        cb();
    } else if (os.platform() === 'linux') {
        var result = child_process.execSync(linuxCommand);
        console.log(result.toString());
        cb();
    }
};