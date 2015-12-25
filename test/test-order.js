/*
Ҫ�����2�����⣺1���޸�֧��������޸Ķ���״̬����ԭ����ɣ�2������������Ӷ����ֿ���ţ������Ӷ����Ѿ����룬�������⵼�¸��������Ӷ�����δ�������Ӷ�����ghost����

MongoDB��limitation���������͵�fieldֻ�е�һ����Խ�����Ч�����������Ա���ӳ�Ա�������飬���ܽ�����Ч����

���������1��֧��״̬�������ݿ��д洢�����ɸ���֧�������㡣���ڷǻ���֧��״̬�Ĳ�ѯ����ѯ�õ��������ټ���֧��״̬���Ի���֧��״̬�Ĳ�ѯ�������ѯ�Ѹ�����Ķ������ȼ��ڲ�ѯ֧�������ܶ���ڵ���Ӧ�����𣬿���ͨ��nested array field��aggregation��mapreduceʵ�֡�2�������д��2���������͵�Field��һ���������Ӷ�������һ�������з��ڸ��ÿ�����ڸ��������Լ�¼�������ĸ��Ӷ����������ڶ���β���֧���ĵڼ��ڡ�������ֻ֤����һ���������͵��򣬶����Ӷ����ͷ��ڸ�����ܹ�����������������Ȼ�����������ڸ���Ӧ��Ϊ�Ӷ������򣬵�Ϊ��walk around���mongodb����֧�ֶ༶���������������⣬��2���������һ���������š�
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
		// map/reduce��mongo db��server����ɣ�mongoose��������map/reduce�ĺ������л����ݸ�mongo db server��mongo db server�����л�����������server�����map/reduce����˲����н����ű������ڴ������
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