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
    start_time:{type:Date},
    end_time:{type:Date},
    url:{type:String, required:true},
    image:{type:String, required:true},
    reward_times:{type:Number, default:0},
    shareable:{type:Boolean, default:false},
    share_points_add: {type:Boolean},
    share_button:{type:Boolean, default:false},
    share_title:{type:String},
    share_url:{type:String},
    share_abstract:{type:String},
    share_image:{type:String}
});

var QA_campaign_schema = new mongoose.Schema({
    campaign:{type:mongoose.Schema.ObjectId, ref:"campaign", required:true},
    QA:[{
        question:{type:String, required:true},
        type:{type:Number, required:true},
        options:[{
            value:{type:String, required:true},
            is_right_answer:{type:Boolean, default:false},
            order_key:{type:Number, required:true}
        }],
        order_key:{type:Number, required:true}
    }]
}, {_id: false});

var quiz_campaign_schema = new mongoose.Schema({
    campaign:{type:mongoose.Schema.ObjectId, ref:"campaign", required:true},
    QA:[{
        question:{type:String, required:true},
        type:{type:Number, required:true},
        options:[{
            value:{type:String, required:true},
            is_right_answer:{type:Boolean, default:false},
            order_key:{type:Number, required:true}
        }],
        order_key:{type:Number, required:true}
    }],
    right_answer_published:{type:Boolean, default:false}
}, {_id: false});

var reward_control_schema = new mongoose.Schema({
    user:{type:mongoose.Schema.ObjectId, ref:'user', required:true},
    campaign:{type:mongoose.Schema.ObjectId, ref:'campaign', required:true},
    reward_times:{type:Number, default:0}
}, {_id: false});

