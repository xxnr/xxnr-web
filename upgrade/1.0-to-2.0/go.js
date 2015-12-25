var totaljs = require("../../node_modules/total.js");
var DB = global.DB;
var F = global.F;
F.config['directory-databases'] = "../../databases";

var db = DB('users', null, require("../../node_modules/total.js/database/database").BUILT_IN_DB);

var php_processor = require("../../common/php_processor");
new php_processor('\"' + require("path").resolve(`${__filename}/../load-v1.0-users.php`) + '\"').execute(function(output, error){
	console.log('output = ' + output + ", and error = " + error);
	var users = JSON.parse(output);
	var convertedUsers = {};	
	var usersScores = getScores(php_processor);
	
	for(var i=0; i<users.length; i++){
		var user = convertUser(users[i]);
		user.score = usersScores[user.id];
		convertedUsers[user.id] = user;
	}

	
	// Updates database file
	db.update(function(doc){
		if(convertedUsers.hasOwnProperty(doc.id)) {
			var user = convertedUsers[doc.id];
			
			for(var j in user){
				if(user.hasOwnProperty(j) && (!doc.hasOwnProperty(j))){
					doc[j] = user[j];
				}
			}
			
			delete convertedUsers[doc.id];
		}
				
		return doc;
		}, function() {
			for(var user in convertedUsers) {
				if(convertedUsers.hasOwnProperty(user)){
					// Creates record if not exists
					db.insert(convertedUsers[user]);
				}
			}
		});
});

function getScores(php_processor){
	var callee = arguments.callee;
	
	new php_processor(`"${__filename}/../get-v1.0-user-score.php"`).execute(function(output, error){
		callee.usersScores = JSON.parse(output);
	}, true);
	
	return callee.usersScores;
}

function convertUser(user){
	const id=	1 -1;
		const company_id =2-1;
		const office_id = 3-1;		
		const login_name = 4-1;		
		const password = 5	-1;	
		const no = 6		-1;
		const name = 7	-1;
		const email = 8	-1;	
		const phone = 9	-1;
		const mobile = 10-1;	
		const user_type = 11	-1;
		const photo = 12-1;
		const login_ip = 13-1;
		const login_date = 14-1;
		const login_flag = 15-1;	
		const create_by = 16-1;
		const create_date = 17-1;
		const update_by = 18-1;
		const update_date = 19-1;
		const remarks = 20-1;
		const del_flag = 21-1;
		const take_meal_date = 22-1;
		const business_date = 23-1;
		const sex = 24-1;
		const birth_date = 25	-1;
		const age = 26-1;
		const user_address = 27	-1;
		const reg_method = 28	-1;
		
		// v2.0 is not online when do upgrade, so there should be no existing users for v1.0-users		
		var v10Fields = new Array(	"id" , //	1 -1;
		"company_id" , //2-1;
		"office_id" , // 3-1;		
		"login_name" , // 4-1;		
		"password" , // 5	-1;	
		"no" , // 6		-1;
		"name" , // 7	-1;
		"email" , // 8	-1;	
		"phone" , // 9	-1;
		"mobile" , // 10-1;	
		"user_type" , // 11	-1;
		"photo" , // 12-1;
		"login_ip" , // 13-1;
		"login_date" , // 14-1;
		"login_flag" , // 15-1;	
		"create_by" , // 16-1;
		"create_date" , // 17-1;
		"update_by" , // 18-1;
		"update_date" , // 19-1;
		"remarks" , // 20-1;
		"del_flag" , // 21-1;
		"take_meal_date" , // 22-1;
		"business_date" , // 23-1;
		"sex" , // 24-1;
		"birth_date" , // 25	-1;
		"age" , // 26-1;
		"user_address" , // 27	-1;
		"reg_method"  // 28	-1;
		);
		
		var v10UserData = {};
		
		for(var i=0; i<v10Fields.length; i++){
			v10UserData[v10Fields[i]] = user[i];
		}
		
		var v20user = {
			'id': user[id],				// 用户ID
			'account': user[phone],	// 用户账户（手机号）
			'password': user[password],	// 用户密码
			'datecreated': user[create_date],		// 注册时间
			'nickname': user[name],		// 用户昵称
			'name': user[login_name],			// 用户名称
			'type': user[user_type],			// 用户类型 1：注册用户 3：认证用户
			'sex': user[sex],			// 性别 0：男 1：女
			'photo': null,			// 用户头像
			'regmethod': user[reg_method],		// 注册方式 0：手机 1：web
			'v1.0-data': v10UserData };			// 用户积分}
		return v20user;
}