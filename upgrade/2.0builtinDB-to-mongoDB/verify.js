var totaljs = require("../../node_modules/total.js");
var DB = global.DB;
var F = global.F;
var GETSCHEMA = global.GETSCHEMA;

F.config['directory-databases'] = "../../databases";

var dbs = [
	{schema:'Province', db:"provinces"},
	{schema:"City", db:"cities"},
	{schema:"County", db:"counties"},
	{schema:"CartItem", db:"cart_items"},
	{schema:"Cart", db:"carts"},
	{schema:"Category", db:"categories"},
	{schema:"Contact", db:"contactforms"},
	{schema:"New", db:"news"},
	{schema:"Order", db:"orders"},
	{schema:"Page", db:"pages"},
	{schema:"Product", db:"products"},
	{schema:"Useraddress", db:"useraddresses"},
	{schema:"User", db:"users"},
	{schema:"UserLogs", db:"user-logs"},
	{schema:"VCode", db:"vcodes"},
	{schema:"Widget", db:"widgets"} ];

var modelsDirectory = "../../models/";

require('fs').readdirSync(modelsDirectory).forEach(function(filename) {
	console.log(`require("${modelsDirectory + filename}");`);
	require(modelsDirectory + filename);
});

var databaseClass = require("../../node_modules/total.js" + `/database/database`);
var source = databaseClass.BUILT_IN_DB, destination = databaseClass.MONGO_DB;

function toBool(obj){
	switch(obj){
		case "0":
		case "false":
			return false;
		case "1":
		case "true":
			return true;
	}

	return !!obj;
}
	
for(var i=0; i<dbs.length; i++){
	var r = function(index){
		var db = dbs[index];
		console.log(`processing ${JSON.stringify(db)}`);
		var schema = GETSCHEMA(db.schema);

		if(!schema){
			throw new Error(`Cannot get schema ${db.schema}`);
		}

		schema = schema.schemaDefinition;

		if(!schema){
			throw `Cannot get schema definition for schema ${db.schema}`;
		}
		
		var sourceDB = DB(db.db, schema, source), destinationDB = DB(db.db, schema, destination);
		
		sourceDB.all({}, function(err, sourceData){
			if(err){
				throw new Error(`Error occurred while getting source data from ${JSON.stringify(db)}, and error is ${err}`);
			}

			if(!sourceData || !sourceData.length){
				console.warn(`No data queried from source database while processing ${JSON.stringify(db)} ...`);
			}

			destinationDB.all({}, function(err, destinationData){
				if(err){
					throw new Error(`Error occurred while getting destination data from ${JSON.stringify(db)}, and error is ${err}`);
				}

				for(var i=0; i<sourceData.length; i++){
					var srcObj = sourceData[i];
					var migrated = false;
					var srcId = srcObj.id;
					
					for(var j=0; j<destinationData.length; j++){
						var destObj = destinationData[j];
						
						if(function match(srcObj, destObj){
							for(var i in srcObj){
								if(srcObj.hasOwnProperty(i)){
									if(i === 'v1.0-data' && db.db === "users"){
										if(destObj['v1.0-data']){
											continue;
										}
									}

									// if(destObj.hasOwnProperty(i)){
										if(srcObj[i] === destObj[i]){
											continue;
										}

										if(srcObj[i] instanceof Date || destObj[i] instanceof Date){
											try{
												if((String(new Date(srcObj[i])) === String(new Date(destObj[i]))) ){
													continue;
												}
											}
											catch(err){
											}
										}

										if(typeof srcObj[i] === 'boolean' || typeof destObj[i] === 'boolean' ){
											try{
											    if( toBool(srcObj[i]) === toBool(destObj[i]) ){
													continue;
												}
											}
											catch(err){
											}
										}

										if(typeof srcObj[i] === 'string' || typeof destObj[i] === 'string' ){
											try{
												if( String(srcObj[i]) === String(destObj[i]) ){
													continue;
												}
											}
											catch(err){
											}
										}

										if(srcObj[i] instanceof Array && destObj[i] instanceof Array){
											if(srcObj[i].length === destObj[i].length){
												var matchArray = true;

												for(var j = 0; j<srcObj[i].length; j++){
													if(!match(srcObj[i][j], destObj[i][j])){
														matchArray = false;
														break;
													}
												}

												if(matchArray){
													continue;
												}
											}
										}

										if(typeof srcObj[i] === 'object' && typeof destObj[i] === 'object'){
											if(match(srcObj[i], destObj[i])){
												continue;
											}
										}

										if(srcObj.id && srcObj.id === destObj.id){
											console.log('mismatch ' + i + srcObj[i] + destObj[i]);
										}
									// }

									return false;
								}
							}

							return true;
						}(srcObj, destObj)){
							migrated = true;
							break;
						}
						else if(srcId && destObj.id && srcId === destObj.id){
							console.warn(`destination data chaged from ${JSON.stringify(srcObj)} to ${JSON.stringify(destObj)}`);
							migrated = true;
							break;
						}
					}
					
					if(!migrated){
						throw new Error(`object ${JSON.stringify(srcObj)} in db ${db.db} is not migrated!`);
					}
				}
				
				console.log(`sucessfully migrated ${JSON.stringify(db)}`);
			});
		});
	}(i);
}

console.log('done!!!!');
// process.exit(812);