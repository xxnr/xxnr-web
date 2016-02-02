/**
 * Created by pepelu on 2015/12/28.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/test');
var schema = new mongoose.Schema({
    name:String,
    attributes:[
        {
            name:String,
            value:String
        }
    ]
},
    { collection: 'test' });

var model = mongoose.model('test', schema);
var attributes = [
    {name:'颜色', value:'天蓝'},
    {name:'排量', value:'2.0L'},
    {name:'变速箱', value:'自动'}
];
var names = [];
attributes.forEach(function(attribute) {
    names.push(attribute.name);
});

model.aggregate({$match:{attributes:{$all:attributes}}}
    , {$unwind:'$attributes'}
    , {
        $group: {
            _id: '$attributes.name',
            values: {$addToSet: '$attributes.value'},
            'pricemin': {$min: '$price.platform_price'},
            'pricemax': {$max: '$price.platform_price'}
        }
    })
    .exec(function(err, docs) {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        model.aggregate({$match:{attributes:{$all:attributes}}}
            , {$unwind:'$additions'}
            , {
              $group:{
                  _id:'$product',
                  additions:{$addToSet:'$additions'}
              }
            })
            .exec(function(err, additions){
                if (err) {
                    console.log(err);
                    process.exit(1);
                }

                var returns = [];
                var minPrice, maxPrice = 0;
                docs.forEach(function (doc) {
                    if (names.indexOf(doc._id) != -1) {
                        return;
                    }

                    minPrice = doc.pricemin;
                    maxPrice = doc.pricemax;
                    delete doc.pricemin;
                    delete doc.pricemax;
                    returns.push(doc);
                });

                console.log(returns);
                console.log(additions);
                //console.log(JSON.stringify({code:1000, message:'success', data:{price:{min:minPrice, max:maxPrice}, attributes:returns}}));
                process.exit(0);
            })
    });