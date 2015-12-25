'use strict'



class process_processor{
	 constructor(commandLine){
	 	this.commandLine = commandLine;
	 }

	 execute(callback, sync){
	 	var child_process = require('child_process');

	 	if(sync){
		 	try{
		 		var result  = child_process.execSync(this.commandLine);
		 		callback(result, null);
		 	}
		 	catch(error){
		 		callback(null, error);
		 	}
	 	}
	 	else{
	 		child_process.exec(this.commandLine, function (error, stdout, stderr) {
	 			callback(stdout, stderr || error);
	 		});
	 	}
	 }
}

class simple_process_processor extends process_processor{
	constructor(commandLine){
		super(commandLine);
		var self = this;

		super.execute(function(result, error){
			self.result = result;
			self.error = error;
		}, true);
	}

	get result(){
		return (this)._result;
	} 

	set result(value) {
		this._result = value;
	}
}

module.exports = class php_processor extends process_processor{
	static  getPhpImagePath(phpRootPath){
		var os = require('os');

		if(os.platform() === 'linux'){
			return 'php';
		}

		return '\"' + require('path').resolve(phpRootPath + '/' + os.platform() + '/' + os.arch() + '/php') + '\"';
	}

	constructor(phpFilePath){
		var processImagePath = php_processor.getPhpImagePath(__filename + '/../../external/php'); // this is not available before super's construction
		var args = Array.prototype.slice.call(arguments);
		args = [processImagePath].concat(args);
		super(args.join(' '));
	}
}

