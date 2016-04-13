/**
 * Created by pepelu on 2016/4/13.
 */
var path = require('path');
var fs = require('fs');
var directory = path.dirname(process.argv[1]);
var databases = {};
var databaseClass = require('./database');
var builtinDBClass = require('./built-in');
var framework_nosql = require('./nosql');
var utils = require('./utils');

var database = function(name, schema, type) {
    type = type || require('./database').BUILT_IN_DB;

    var key = name + ' ~ ' + type;

    var db = databases[key];
    if (db !== undefined)
        return db;

    switch(type){
        case databaseClass.BUILT_IN_DB:
        {
            var dir = utils.combine('/databases-online/');
            if (!fs.existsSync(dir))
                fs.mkdirSync(dir);
            db = framework_nosql.load(path.join(directory,  '/databases-online/', name), path.join(directory,  '/databases-online/', name + '-binary'), true);
            db = new builtinDBClass(name, db);
        }
            break;
        case databaseClass.MONGO_DB:
        {
            db = new mongoDBClass(name, schema);
        }
            break;
    }

    databases[key] = db;
    return db;
};

global.DB = global.DATABASE = function() {
    var self = this;
    return database.apply(self, arguments);
};

global.DB.BUILT_IN_DB = databaseClass.BUILT_IN_DB;
global.DB.MONGO_DB = databaseClass.MONGO_DB;