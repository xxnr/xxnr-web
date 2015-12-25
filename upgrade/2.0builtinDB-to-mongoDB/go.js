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
					var obj = sourceData[i];

					// console.log('    processing ' + JSON.stringify(obj));

					var id = obj['id'];

					if(!id){
						if(schema["id"] && schema["id"].required){
							obj.id = U.GUID(10);
						}

						var existed = false;

						for(var j=0; j<destinationData.length; j++){
							destinationObj = destinationData[j];

							if(function objectMatch(l, r){
								for(var i in l){
									if(l.hasOwnProperty(i)){
										if(!r.hasOwnProperty(i)){
											return false;
										}

										if(l[i] !== r[i]){
											if(typeof l[i] !== 'object' || !objectMatch(l[i], r[i])){
												return false;
											}
										}
									}
								}
							}(obj, destinationObj)){
								existed = true;
								break;
							}
						}

						if(!existed){
							destinationDB.insert(obj);
						}
					}
					else{
						var destinationObj = null;
						var proccessed = false;

						for(var j=0; j<destinationData.length; j++){
							destinationObj = destinationData[j];

							if(obj.id == destinationObj.id){
								proccessed = true;

								destinationObj = function merge(destinationObj, obj){
									for(var i in obj){
										if(obj.hasOwnProperty(i)){
											if(!destinationObj.hasOwnProperty(i)){
												destinationObj[i] = obj[i];
											}
											else if(typeof obj[i] ==='object'){
												merge(destinationObj[i], obj[i]);
											}
											else if(obj[i] instanceof Array){
												
											}
										}
									}

									return destinationObj;
								}(destinationObj, obj);

								destinationDB.update({id: obj.id}, destinationObj, function(err){
									if(err){
										throw new Error(err);
									}
								});
							}
						}

						if(!proccessed){
							destinationDB.insert(obj);
						}
					}
				}

				console.log(`${JSON.stringify(db)} is done`);
			});
		});
	}(i);
}

console.log('done!!!!');
// process.exit(812);