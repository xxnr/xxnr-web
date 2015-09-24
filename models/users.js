var User = NEWSCHEMA('User');
User.define('id', String);				// 用户ID
User.define('account', String, true);	// 用户账户（手机号）
User.define('password', String, true);	// 用户密码
User.define('datecreated', Date);		// 注册时间
User.define('nickname', String);		// 用户昵称
User.define('name', String);			// 用户名称
User.define('type', String);			// 用户类型 1：注册用户 3：认证用户
User.define('sex', Boolean);			// 性别 0：男 1：女
User.define('photo', String);			// 用户头像
User.define('regmethod', Boolean);		// 注册方式 0：手机 1：web
User.define('score', Number);			// 用户积分


// Sets default values
User.setDefault(function(name) {
	switch (name) {
		case 'datecreated':
			return new Date().format('yyyy-MM-dd hh:mm:ss');
		case 'nickname':
			return '';
		case 'name':
			return '';
		case 'type':
			return '1';
		case 'sex':
			return 0;
		case 'photo':
			return '';
		case 'regmethod':
			return 1;
		case 'score':
			return 0;
	}
});

// Creates user
User.addWorkflow('create', function(error, model, options, callback) {
	// Filter for reading
	var filter = function(doc) {
		if (options.account && doc.account === options.account)
			return doc;
		return;
	};

	// Gets a specific document from DB
	DB('users').one(filter, function(err, doc) {
		if (doc) {
			error.add('account-in');
			callback({'code':'1001','message':'用户已存在'});
			return;
		} else {
			var user = GETSCHEMA('User').create();
			user.id = U.GUID(10);
			user.account = options.account;
			user.password = options.password;
			if (options.name)
				user.name = options.name;
			if (options.regMethod)
				user.regmethod = options.regMethod;
			if (options.nickname)
				user.nickname = options.nickname;
			if (options.userType)
				user.type = options.userType;
			if (options.sex)
				user.sex = options.sex;
			if (options.photo)
				user.photo = options.photo;

			// Inserts user into the database
			DB('users').insert(user);

			// Returns response
			callback(user);
		}
	});

});

// Updates user
User.addWorkflow('update', function(error, model, options, callback) {

	var count = 0;
	// Filter for update
	var updater = function(doc) {
		if (options.account && doc.account === options.account) {
			if (options.password)
				doc.password = options.password;
			if (options.name)
				doc.name = options.name;
			if (options.regMethod)
				doc.regmethod = options.regMethod;
			if (options.nickname)
				doc.nickname = options.nickname;
			if (options.userType)
				doc.type = options.userType;
			if (options.sex)
				doc.sex = options.sex;
			if (options.photo)
				doc.photo = options.photo;
			
			count++;
			return doc;
		}
		return doc;
	};

	// Updates user into the database
	DB('users').update(updater, function(err, user) {
		// Record not exists
		if (count === 0) {
			error.add('account-notin');
			callback({'code':'1001','message':'用户不存在'});
			return;
		} else {
			callback(user);
			return;
		}
	});

});

// Login
User.addWorkflow('login', function(error, model, options, callback) {
	// options.account {String} options.password {String}

	// Filter for reading
	var filter = function(doc) {
		if (options.account && options.password && doc.account === options.account && doc.password === options.password)
			return doc;
		return;
	};

	// Gets a specific document from DB
	DB('users').one(filter, function(err, user) {
		if (user === null) {
			error.add('error-login');
			callback({'code':'1001','message':'账号或者密码输入错误'});
			return;
		}

		// Returns response
		callback(user);
		
		// Save login log
		DB('users-logs').insert({id: user.id, account: user.account, ip: options.ip, date: new Date().format('yyyy-MM-dd hh:mm:ss')});
	});
});

// Gets a specific user
User.setGet(function(error, model, options, callback) {
	// options.userid {String} or options.account {String}

	// Filter for reading
	var filter = function(doc) {
		if (options.userid && doc.id === options.userid)
			return doc;
		if (options.account && doc.account === options.account)
			return doc;
		return;
	};

	// Gets a specific document from DB
	DB('users').one(filter, function(err, user) {
		if (!user || err) {
			error.add('user-notfind');
			return callback({'code':'1001','message':'未查询到用户'});
		} else {
			// Returns response
			return callback(user);
		}
	});
});