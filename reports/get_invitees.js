/**
 * Created by zhouxin on 2016/04/12.
 */

require('total.js');
var fs = require('fs');
// var csv = require('csv');
var UserModel = require('../models').user;
var PotentialCustomerModel = require('../models').potential_customer;
var moment = require('moment-timezone');
var result_users = [];
var result_customers = [];
var user_types = {"1":"普通用户", "5":"县级经销商", "6":"新农经纪人"};
var json2csv = require('json2csv');
var iconv = require('iconv-lite');

//UserModel.find({typeVerified:{ $elemMatch: {$eq:'6'} }})
UserModel.find({typeVerified:'6'})
	.populate({path: 'address.province', select: ' -__v'})
    .populate({path: 'address.city', select: ' -__v'})
    .populate({path: 'address.county', select: ' -__v'})
    .populate({path: 'address.town', select: ' -__v'})
    .populate({path: 'inviter', select: 'id account photo nickname name'})
	.exec(function (err, users) {
	var userIds = [];
	for (var i = 0; i < users.length; i++) {
		var user = users[i];
		var typeNameVerified = [];
		userIds.push(user._id);
		if (user['typeVerified'] && user['typeVerified'].length >0) {
			user['typeVerified'].sort().forEach(function(typeVerified){
				if (user_types[typeVerified]) {
					typeNameVerified.push(user_types[typeVerified]);
				}
			});
		}
		// result_users.push([user['account'], user['name']?user['name']:'', user['registerAgent']?user['registerAgent']:'', 
		// 	user['datecreated']?moment(user['datecreated']).format("YYYY-MM-DD HH:mm:ss"):'', 
		// 	user['inviter']?user['inviter'].name:'', user['inviter']?user['inviter'].account:'', typeNameVerified.join("|")]);
		result_users.push({'手机号':user['account'], '姓名':user['name']?user['name']:'', '注册来源':user['registerAgent']?user['registerAgent']:'', 
			'注册时间':user['datecreated']?moment(user['datecreated']).format("YYYY-MM-DD HH:mm:ss"):'', 
			'新农代表姓名':user['inviter']?user['inviter'].name:'', 
			'新农代表手机':user['inviter']?user['inviter'].account:'', 
			'认证用户':typeNameVerified.join("|")
		});
	}
	// PotentialCustomerModel.find({user:{$in:userIds}}).sort({dateTimeAdded:-1})
	PotentialCustomerModel.find({}).sort({dateTimeAdded:-1})
		.populate({path:'user', select:'-_id account name typeVerified'})
        .populate('address.province')
        .populate('address.city')
        .populate('address.county')
        .populate('address.town')
        .select('name phone remarks isRegistered sex address dateTimeAdded dateTimeRegistered user namePinyin nameInitial')
		.exec(function (err, customers) {
		console.log(customers.length);
		if (customers && customers.length > 0) {
			for (var i = 0; i < customers.length; i++) {
				var customer = customers[i];
				var address = customer.address.province.name||'' + customer.address.city.name||'' + (customer.address.county.name || '') + (customer.address.town.name || '');
				// result_customers.push([customer['name'], customer['phone'], customer['sex']?'女':'男', address, 
				// 	customer['dateTimeAdded']?moment(customer['dateTimeAdded']).format("YYYY-MM-DD HH:mm:ss"):'', customer.user['account']+'|'+customer.user['name'], 
				// 	customer['dateTimeRegistered']?moment(customer['dateTimeRegistered']).format("YYYY-MM-DD HH:mm:ss"):'', customer['isRegistered']?'已注册':'未注册']);
				result_customers.push({'姓名':customer['name'], '手机号':customer['phone'], '性别':customer['sex']?'女':'男', '地区':address, 
					'登记日期':customer['dateTimeAdded']?moment(customer['dateTimeAdded']).format("YYYY-MM-DD HH:mm:ss"):'', 
					'经纪人':customer.user['account']+'|'+customer.user['name'], 
					'注册时间':customer['dateTimeRegistered']?moment(customer['dateTimeRegistered']).format("YYYY-MM-DD HH:mm:ss"):'',
					'是否注册':customer['isRegistered']?'已注册':'未注册'
				});
			}
		}
		
		// var xlsPath1 = "../../经纪人_"+moment().format("YYYY-MM-DD")+".csv";
		// json2csv({data: result_users, fields: Object.keys(result_users[0] || {})}, function(err, csv) {
		// 	//将json转为csv格式的buf
		// 	//在写文件之前，转一下编码
		// 	var buf = iconv.encode(csv, 'GBK');
		// 	//然后保存到文件中，在win7 office 2010 打开没问题
		// 	fs.writeFile(xlsPath1, buf, function (err) {
		// 				if (err)
		// 					console.log(err);
		// 				else 
		// 					console.log('result_users saved!');
		// 		});
		// });
		// var xlsPath2 = "../../潜在客户_"+moment().format("YYYY-MM-DD")+".csv";
		// json2csv({data: result_customers, fields: Object.keys(result_customers[0] || {})}, function(err, csv) {
		// 	//将json转为csv格式的buf
		// 	//在写文件之前，转一下编码
		// 	var buf = iconv.encode(csv, 'GBK');
		// 	//然后保存到文件中，在win7 office 2010 打开没问题
		// 	fs.writeFile(xlsPath2, buf, function (err) {
		// 				if (err)
		// 					console.log(err);
		// 				else 
		// 					console.log('result_customers saved!');
		// 		});
		// });
	});
});

