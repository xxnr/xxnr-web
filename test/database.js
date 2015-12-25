var totaljs = require("../node_modules/total.js");
var DB = global.DB;
var F = global.F;

F.config['directory-databases'] = "../databases";


var databaseClass = require("../node_modules/total.js" + `/database/database`);
var databaseType = databaseClass.MONGO_DB;

var schema = {
	"id": {type:String, required: true},
	"field1": String,
	"field2": Number
};

var db = DB('test-xxnt', schema, databaseType);

function match(obj, dbObj){
	for(var i in obj){
		if(obj.hasOwnProperty(i)){
			if(obj[i] != dbObj[i]){
				return false;
			}
		}
	}

	return true;
}

function Clear(callback){
	db.clear(function(err){
   		console.log("clear result is " + err);
		callback();
	});
}

function testInsertUpdate(callback){
// test insert and query
var obj2Insert = {"id": "id1", "field1": "value1", "field2":2};
	db.insert(obj2Insert,function(err){
		if(!err){
			db.one(function(doc){
				return doc;
			}, function(err, data){
				if(match(obj2Insert, data)){
					console.log("Insert passed successfully!");

					db.update(function(doc){
						doc.field2 = 8;
						return doc;
					},
					function(err, data){
						if(err){
							console.error('update failed with error' + err);
							return;
						}

						db.one(function(doc){
							return doc;
						}, function(err, data){
							if(err){
								 console.log("Update failed with err " + err);
							}
							else if(data.id == "id1" && data.field2 == 8){
								console.log("Update passed successfully!");
								callback();
							}
							else{
								console.log("Update failed! - data is " + JSON.stringify(data));
							}
						});
					});
				}
				else {
					console.log("insert failed, queried data " + JSON.stringify(data) + " doesn't match " + JSON.stringify(obj2Insert));
				}
			});
		}
		else{
			console.log("insert failed with error " + err);
		}
	});
}

var testCases = [Clear, testInsertUpdate, Clear, testInsertUpdate, Clear];
testCases .push(function(err){ console.log("done"); });
var i = 0;

function run(){
	if(i < testCases.length){
		testCases[i].call(db, function(err){
			if(err){
				console.log('test case ' + i + ' failed with error ' + err);
			}else{
				i++;
				run();
			}
		});
	}
}

run();