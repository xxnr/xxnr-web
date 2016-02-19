/**
 * Created by pepelu on 2016/2/17.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/xxnr',{user:'xxnr',pass:'xxnr001'});
var TownModel = require('../../models').town;
//var TownModel = mongoose.model('t_idxes', new mongoose.Schema({
    //advs:[{
    //    stgs:[{
    //        payer:String,
    //        tidxfd:String
    //    }],
    //    otherFiled1:String,
    //    advaceIndex:String
    //}],
    //otherFiled1:String
    //otherFiled2:String,
    //otherFiled3:String
//}));
try {
    var query = function (i) {
        //TownModel.find({name:'林山寨街道'}, function (err, town) {
        TownModel.find({id:'fce7f4f2b1'}, function (err, town) {
        //TownModel.find({otherFiled1:'otherFiled'}, function (err, town) {
            //console.log(1);
            //console.log(town);
                //console.log(i);
                query(i + 1);
            });
    };

    query(0);
}
catch(e){
    console.log(e);
}