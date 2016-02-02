var mongoose = require('mongoose');

// Schema
var AuditLogSchema = new mongoose.Schema({
    action: String,
    actionMethod: String,
    actorName: String,
    actorId: String,
    actorIp: String,
    dateCreated: {type: Date, default: Date.now},
    parameters: [{
        name: {type:String, index: true},
        value: String
    }],
    succeeded: {type:Boolean},
    resultCode: {type:String}
});

// Indexes
AuditLogSchema.index({actorName:1});
AuditLogSchema.index({dateCreated: -1});

// Model
mongoose.model('auditlog', AuditLogSchema);

//mongoose.set('debug', true);
//
//AuditLogModel.on('index', function(err){
//    if(err){
//        console.error(err);
//    }else{
//        console.info()
//    }
//})