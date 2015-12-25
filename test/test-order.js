/*
要解决的2个问题：1、修改支付金额与修改订单状态不能原子完成；2、如果订单与子订单分开存放，可能子订单已经插入，程序意外导致父订单与子订单尚未关联，从而产生ghost订单

MongoDB的limitation：数组类型的field只有第一层可以建立有效索引，数组成员的子成员再是数组，则不能建立有效索引

解决方案：1、支付状态不在数据库中存储，改由根据支付金额计算。对于非基于支付状态的查询，查询得到订单后，再计算支付状态；对基于支付状态的查询，例如查询已付定金的订单，等价于查询支付定金总额大于等于应付定金，可以通过nested array field的aggregation或mapreduce实现。2、订单中存放2个数组类型的Field，一个是所有子订单，另一个是所有分期付款，每个分期付款用属性记录隶属于哪个子订单，是属于定金还尾款，是支付的第几期。这样保证只出现一级数组类型的域，对于子订单和分期付款，均能够建立索引。本来自然的做法，分期付款应作为子订单的域，但为了walk around这个mongodb不能支持多级子数组索引的问题，用2个相关联的一级子数组存放。
*/
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/xxnr',{user:'xxnr',pass:'xxnr001'});

var orderSchemaDefinition = {
	id : {type:String, index: true, required: true },
	payments: [{
		id: {type:String, index: true, required: true },
		type: String,
        stage: Number,
        price: Number,
        orderId: { type: String, index: true, required: true },
		}],
	subOrders: [{
	    id: { type: String, index: true, required: true },
	    totalPrice: Number,
	    depositPrice: Number,
	}]
};

var orderSchema = new mongoose.Schema(orderSchemaDefinition);
var orderDB = mongoose.model('testOrder', orderSchema);

var testArray = [
    {
        id: "orderId1",
        payments: [{
            id: "paymentId1",
            type: "deposit",
            stage: 1,
            price: 1,
            orderId: "suborder1",
        },
        {
            id: "paymentId2",
            type: "deposit",
            stage: 2,
            price: 2,
            orderId: "suborder1",
        }],
        subOrders: [{
            id: "suborder1",
            totalPrice: 8,
            depositPrice: 3,
        }]
    }
    ,
    {
        id: "orderId2",
        payments: [{
            id: "paymentId2",
            type: "deposit",
            stage: 1,
            price: 1,
            orderId: "suborder2",
        }],
        subOrders: [{
            id: "suborder2",
            totalPrice: 8,
            depositPrice: 3,
        }]
    }
];

orderDB.find({}).remove(function (err) {
    if (err) {
        throw new Error(err);
    }

    orderDB.collection.insert(testArray, function (err, docs) {
        if (err) {
            throw new Error(err);
        }

        console.log("test data is built successfully!");

        // https://docs.mongodb.org/manual/core/map-reduce/
        // mapReduce can't be called the same way in Mongoose as it is in the shell.
        // http://mongoosejs.com/docs/api.html#model_Model.mapReduce
		// map/reduce由mongo db在server端完成，mongoose把用来做map/reduce的函数序列化传递给mongo db server，mongo db server反序列化出函数，在server端完成map/reduce，因此不会有将整张表载入内存的问题
        orderDB.mapReduce(
           {
               map: function () {
                   var subOrders = {};

                   for (var i = 0; i < this.payments.length; i++) {
                       var payment = this.payments[i];

                       if (!subOrders.hasOwnProperty(payment.orderId)) {
                           subOrders[payment.orderId] = [];
                       }

                       subOrders[payment.orderId].push(payment);
                   }

                   for (var i = 0; i < this.subOrders.length; i++) {
                       var subOrder = this.subOrders[i];
                       var payments = subOrders[subOrder.id];
                       var totalDeposit = 0;

                       for (var j = 0; j < payments.length; j++) {
                           var payment = payments[j];

                           if (payment.type === "deposit") {
                               totalDeposit += payment.price;
                           }
                       }

                       if (totalDeposit >= subOrder.depositPrice) {
                           emit('depositPaid', { order: subOrder, payments: payments });
                       }
                   }
               },
               reduce: function (key, values) {
                   if (key === 'depositPaid') {
                       var result = [];
                       values.forEach(function (value) {
                           result.push(value);
                       });
                       return result;
                   }
               },
               query:{},
               out: {inline:1}
           }, function (err, results) {
               if(err){
                   throw new Error(err);
               }

               console.log(`deposit paid orders are ${results ? JSON.stringify(results) : results}`);
           });
    });
});