/**
 * Created by pepelu on 2016/4/13.
 */
'use strict';

var database = require("./database");

database.match = function(options, object){
    for(var i in options){
        if(options.hasOwnProperty(i)){
            var property = options[i];

            if(property === object[i]){
                continue;
            }

            if(property instanceof Array){
                property.in = property;
            }

            if(property.in instanceof Array){
                if(property.in.indexOf(object[i]) >= 0){
                    continue;
                }
            }

            if(typeof property === 'object'){
                if(match(property, object[i])){
                    continue;
                }
            }

            return false;
        }
    }

    return true;
};

module.exports = class BuiltInDB extends database{
    constructor(name, internalDB){
        super(name, database.BUILT_IN_DB);
        this.internalDB = internalDB; // new require("../nosql")(name);
        this.binary = internalDB.binary;
    }

    update(options, object, callback){  // insert/update/delete
        if(typeof options === 'function'){
            if(object && typeof object !== 'function'){
                throw new Error('Unexpected!');
            }

            var updater = options;
            if(!callback)
                callback = object;
            return this.internalDB.update(updater, callback);
        }else {

            if (!options) { // insert
                return this.internalDB.insert(object, callback);
            }else {

                var match = (typeof options === 'function') ? options : function (doc) {
                    if (database.match(options, doc)) {
                        return doc;
                    }
                };

                var updater = function (doc) {
                    if (!match(doc))
                        return doc;
                    return object;
                };

                // Updates database file
                return this.internalDB.update(updater, callback);
            }
        }
    }

    one(options, callback){
        // Filter for reading
        var filter = (typeof options === 'function') ? options : function(doc) {
            if(database.match(options, doc)){
                return doc;
            }
        };

        // Gets a specific document from DB
        return this.internalDB.one(filter, callback);
    }

    all(options, orderby, callback, skip, take){
        if(!callback || typeof callback !== 'function'){
            // no orderby
            callback = orderby;
            orderby = undefined;
        }

        if(typeof options === 'function'){
            if(orderby){
                return this.internalDB.sort(options, orderby, callback, skip, take);
            }else {
                return this.internalDB.all(options, function(err, docs){callback(err, docs, docs.length);}, skip, take);
            }
        }else {
            var filter = function (doc) {
                if (database.match(options, doc)) {
                    return doc;
                }
            };

            return this.internalDB.all(filter, function (err, array) {
                if (err) {
                    callback(err, array);
                }
                else {
                    if (orderby) {
                        if (typeof orderby === 'function') {
                            array.sort(orderby);
                        }
                        else {
                            array.sort(function (a, b) {
                                return a[orderby] < b[orderby];
                            });
                        }
                    }

                    callback(err, array, array ? array.length : 0);
                }
            }, skip, take);
        }
    }

    clear(callback, description){
        console.log('clear all');
        return this.internalDB.clear(callback, description);
    }
};