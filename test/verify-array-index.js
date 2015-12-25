var mongoose = require('mongoose');
mongoose.connect('mongodb://101.200.194.203:27017/xxnr',{user:'xxnr',pass:'xxnr001'});

var paymentSchemaNoIndex = {
	advs:[
		{stgs : [  {payer:String, tidxfd:String }],
		otherFiled1: String}
		],
	otherFiled1: String,
	otherFiled2: String,
	otherFiled3: String,
};

var paymentSchemaWithIndex = {
	advs:[
		{stgs : [  {payer:String, tidxfd:{type:String, index: true, required: true} }],
		otherFiled1: String,
		advaceIndex : {type:String, index: true, required: true}}
		],
	otherFiled1: String,
	otherFiled2: String,
	otherFiled3: String,
};

paymentSchemaNoIndex = new mongoose.Schema(paymentSchemaNoIndex);
paymentSchemaWithIndex = new mongoose.Schema(paymentSchemaWithIndex);
paymentSchemaWithIndex.index({'advs.stgs.tidxfd':'text'});
paymentSchemaWithIndex.index({'advs.advaceIndex':'text'});

var dbNoIndex = mongoose.model('t_noidx', paymentSchemaNoIndex);
var dbWithIndex = mongoose.model('t_idx', paymentSchemaWithIndex);

var prepareData = true;

/*
var inventory = mongoose.model('test_array_inventory_2', new mongoose.Schema({
	item: String,
	stock: [{ size: String, color: String, quantity: Number, subarr:[{f1:String, f2:String}] }]
}));

var testInventoryArray = [{
  _id: 1,
  item: "abc",
  stock: [
    { size: "S", color: "red", quantity: 25},
    { size: "S", color: "blue", quantity: 10 },
    { size: "M", color: "blue", quantity: 50 }
  ]
},
{
  _id: 2,
  item: "def",
  stock: [
    { size: "S", color: "blue", quantity: 20 },
    { size: "M", color: "blue", quantity: 5, subarr: [{f1:"f11", f2:"f12"}, {f1:"f21", f2:"f22"}, {f1:"f31", f2:"f32"}] },
    { size: "M", color: "black", quantity: 10 },
    { size: "L", color: "red", quantity: 2 }
  ]
},
{
  _id: 3,
  item: "ijk",
  stock: [
    { size: "M", color: "blue", quantity: 15 },
    { size: "L", color: "blue", quantity: 100 },
    { size: "L", color: "red", quantity: 25 }
  ]
}];

inventory.find({}).remove(function(err){
	if(err){
		throw new Error(err);
	}
	
	inventory.collection.insert(testInventoryArray, function(err, docs){
		inventory.find( { "stock.size": "S", "stock.quantity": { $gt: 20 } }, { "stock.$": 1 }, function(err, docs2){
			console.log('found docs = ' + JSON.stringify(docs2));
			
			inventory.find( { "stock.subarr.f1": "f11" }, { "stock": { $elemMatch: { "subarr.f1": "f11" } } }, function(err, docs3){
				console.log('found docs3 = ' + JSON.stringify(docs3));
			});
		} );
	});
});
*/

function testPerformance(){
	/*
	// Using query builder
Person.
  find({ occupation: /host/ }).
  where('name.last').equals('Ghost').
  where('age').gt(17).lt(66).
  where('likes').in(['vaporizing', 'talking']).
  limit(10).
  sort('-occupation').
  select('name occupation').
  exec(callback);*/
  
  /*
  var LocationSchema = new Schema(
{
    events: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event'
        }
    ]
})
var EventSchema = new Schema(
{
    title  : String,

    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location'
    }
})
  */
  var timeStartNoIndex = new Date();
  
  dbNoIndex.find({'advs.stgs.tidxfd': 'tidxfd-999-127-7-7'}, function(err, data){
	   var timeEndNoIndex = new Date();
	   var timeCost = timeEndNoIndex - timeStartNoIndex;
	  console.log(`time cost no index = ${timeCost}, and error = ${err}, and data = ${JSON.stringify(data)}`);
	  
	   var timeStartWithIndex0 = new Date();
	   
	   dbWithIndex.find({'advs.stgs.tidxfd': 'tidxfd-999-127-7-7'}, function(err, data){
		   var timeEndWithIndex0 = new Date();
		   var timeCost = timeEndWithIndex0 - timeStartWithIndex0;
		  console.log(`time cost with index = ${timeCost}, and error = ${err}, and data = ${JSON.stringify(data)}`);
		  
		  var timeStartWithIndex = new Date();
		  
		  dbWithIndex.find({'advs.advaceIndex': 'advaceIndex-999-127-7'}, function(err, data){
			   var timeEndWithIndex = new Date();
			   var timeCost = timeEndWithIndex - timeStartWithIndex;
			  console.log(`time cost with index level 1 = ${timeCost}, and error = ${err}, and data = ${JSON.stringify(data)}`);
			  var timeStartWithIndex2 = new Date();
			  
			  dbNoIndex.find({'advs.advaceIndex': 'advaceIndex-999-127-7'}, function(err, data){
				   var timeEndWithIndex2 = new Date();
				   var timeCost = timeEndWithIndex2 - timeStartWithIndex2;
				  console.log(`time cost no index level 1 = ${timeCost}, and error = ${err}, and data = ${JSON.stringify(data)}`);
			   });
		   });
	   });
  });
}

if(!prepareData){
	testPerformance();
}
else{
	dbNoIndex.find({}).remove(function(err){
		if(err){
			throw new Error(err);
		}
		
		dbWithIndex.find({}).remove(function(err){
			if(err){
				throw new Error(err);
			}
			
			console.log('clear test databases sucessfully');
			
			var testArray = [];
			
			for(var i=0; i < 128 /* * 1204*/; i++){
				var testElement = {
					advs:[],
					otherFiled1: 'otherFiled1',
					otherFiled2: 'otherFiled2',
					otherFiled3: 'otherFiled3',
				};
				
				for(var j=0; j<8; j++){
					var advance = { stgs : [ ], otherFiled1: 'otherFiled1', advaceIndex : '' };
					
					for(var k=0; k<12; k++){
						advance.stgs.push({payer:`payer-${i}-${j}-${k}`, tidxfd:`tidxfd-${i}-${j}-${k}` });
					}
					
					testElement.advs.push(advance);
				}
				
				testArray.push(testElement);
			}
			
			console.log('test data is built sucessfully');
			
			var ret = function insertArray(index, insertedIds){
				if(index >= 1000){
					var bechmarkTimeStart = new Date();
					
					dbWithIndex.find({"_id": insertedIds[insertedIds.length -1]}, function(err, data){
						var bechmarkTimeEnd = new Date();
						console.log('bechmark cost = ' + (bechmarkTimeEnd - bechmarkTimeStart) + ', and data = ' + JSON.stringify(data));
						testPerformance();
					});
				}
				else{
					console.log('insert test array with index ' + index);
					
					for(var i=0; i < testArray.length /* * 1204*/; i++){
						delete testArray[i]._id;
						
						for(var j=0; j<testArray[i].advs.length; j++){
							delete testArray[i].advs[j]._id;
							testArray[i].advs[j].advaceIndex = `advaceIndex-${index}-${i}-${j}`;
							
							for(var k=0; k<testArray[i].advs[j].stgs.length; k++){
								delete testArray[i].advs[j].stgs[k]._id;
								
								testArray[i].advs[j].stgs[k].tidxfd = `tidxfd-${index}-${i}-${j}-${k}`;
							}
						}
					}
					
					dbNoIndex.collection.insert(testArray, function(err, docs){
						if(err){
							throw new Error(err);
						}
						
						if(docs.insertedIds.length != testArray.length){
							throw new Error(`not all data inserted into dbNoIndex, the total data length is ${testArray.length}, but the inserted length is ${docs.insertedIds.length}`);
						}
						
						console.log('inserted into dbNoIndex, and the length is ' + docs.insertedIds.length);
						
						dbWithIndex.collection.insert(testArray, function(err, docs){
							if(err){
								throw new Error(err);
							}
							
							if(docs.insertedIds.length != testArray.length){
								throw new Error(`not all data inserted into dbWithIndex, the total data length is ${testArray.length}, but the inserted length is ${docs.insertedIds.length}`);
							}
							
							console.log('inserted into dbWithIndex, and the length is ' + docs.insertedIds.length);
							
							insertArray(index + 1, docs.insertedIds);
						});
					});
				}
			}(0, []);
			
		});
	});
}