/**
 * Created by pepelu on 2016/4/13.
 */
'use strict';

const MONGO_DB = 1, BUILT_IN_DB = 2;

module.exports = class database{
    constructor(name, type){
        this.name = name;
        this.type = type;
    }

    insert(object, callback){ this.update(null, object, callback); };
    remove(options, callback){ this.update(options, null, callback); };
    update(options, object, callback){ throw "the derived class should override this function"; } // insert/update/delete
    one(options, callback){ throw "the derived class should override this function"; }
    all(options, orderby, callback, skip, take){ throw "the derived class should override this function"; }
    clear(callback, description){ throw "the derived class should override this function"; }
};

module.exports.MONGO_DB = MONGO_DB;
module.exports.BUILT_IN_DB = BUILT_IN_DB;