/**
 * Created by pepelu on 2015/11/25.
 */
module.exports = {
    db: {
        production: "mongodb://123.57.251.173:27017/xxnr",
        test: "mongodb://101.200.194.203:27017/xxnr",
        dev: "mongodb://101.200.194.203:27017/xxnr",
        sandbox: "mongodb://127.0.0.1:27017/xxnr"
    },
    autoIndex: false,
    environment: require('../config').environment
};