/**
 * Created by pepelu on 2016/7/11.
 */
var mongoose = require('mongoose');
var campaign_schema = new mongoose.Schema({
    type:{type:Number, required:true},
    title:{type:String, required:true},
    date_created:{type:Date, default:Date.now},
    online_time:{type:Date, required:true},
    offline_time:{type:Date},
    start_time:{type:Date, required:true},
    end_time:{type:Date},
    campaign_url_name:{type:String, required:true},
    url:{type:String, required:true, unique:true},
    image:{type:String, required:true},
    comment:{type:String},
    reward_times:{type:Number, default:0},
    shareable:{type:Boolean, default:false},
    share_points_add: {type:Number},
    share_button:{type:Boolean, default:false},
    share_title:{type:String},
    share_url_name:{type:String},
    share_url:{type:String, unique:true},
    share_abstract:{type:String},
    share_image:{type:String}
});

var reward_control_schema = new mongoose.Schema({
    user:{type:mongoose.Schema.ObjectId, ref:'user', required:true},
    campaign:{type:mongoose.Schema.ObjectId, ref:'campaign', required:true},
    reward_times:{type:Number, default:1}
}, {_id: false});

reward_control_schema.index({user:1, campaign:1}, {unique:true});

var QA_campaign_schema = new mongoose.Schema({
    campaign:{type:mongoose.Schema.ObjectId, ref:"campaign", required:true},
    QA:[{
        question:{type:String, required:true},
        type:{type:Number, required:true},
        points:{type:Number, default:0},
        options:[{
            value:{type:String, required:true},
            is_right_answer:{type:Boolean, default:false},
            order_key:{type:Number, required:true}
        }],
        order_key:{type:Number, required:true}
    }],
    date_created:{type:Date, default:Date.now},
    date_last_modified:{type:Date, required:true}
}, {_id: false});

var quiz_campaign_schema = new mongoose.Schema({
    campaign:{type:mongoose.Schema.ObjectId, ref:"campaign", required:true},
    QA:[{
        question:{type:String, required:true},
        type:{type:Number, required:true},
        points:{type:Number, default:0},
        options:[{
            value:{type:String, required:true},
            is_right_answer:{type:Boolean, default:false},
            order_key:{type:Number, required:true}
        }],
        right_answer_set:{type:Boolean, default:false},
        order_key:{type:Number, required:true}
    }],
    right_answer_published:{type:Boolean, default:false},
    date_created:{type:Date, default:Date.now},
    date_last_modified:{type:Date, required:true}
}, {_id: false});

quiz_campaign_schema.index({campaign:1, 'QA.right_answer_set':1});

var quiz_answer_schema = new mongoose.Schema({
    user:{type:mongoose.Schema.ObjectId, ref:'user', required:true},
    campaign:{type:mongoose.Schema.ObjectId, ref:'campaign', required:true},
    answer:[{
        order_key:{type:Number, required:true},
        choices:[{type:Number, required:true}]
    }],
    result:{
        has_result:{type:Boolean, default:false},
        points:{type:Number, default:0},
        right_answer_count:{type:Number, default:0},
        date_time:{type:Date}
    },
    date_created:{type:Date, default:Date.now},
    date_last_submit:{type:Date, required:true}
});

quiz_answer_schema.index({user:1, campaign:1}, {unique:true});

var CampaignModel = mongoose.model('campaign', campaign_schema);
mongoose.model('QA_campaign', QA_campaign_schema);
mongoose.model('quiz_campaign', quiz_campaign_schema);
mongoose.model('reward_control', reward_control_schema);
mongoose.model('quiz_answer', quiz_answer_schema);
