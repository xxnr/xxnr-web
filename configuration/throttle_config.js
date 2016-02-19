/**
 * Created by pepelu on 2016/2/5.
 */
module.exports = {
    expire_time_in_ms: 60,     // if we want to change this value, we need to re-created index for collection throttle.
    max_hits:{
        '/api/v2.1/order/addOrder':{
            'get':{
                max_hits_per_user:10,
                max_hits:1000
            },
            'post':{
                max_hits_per_user:10,
                max_hits:1000
            }
        },
        '/api/v2.0/order/addOrder':{
            'get':{
                max_hits_per_user:10,
                max_hits:1000
            },
            'post':{
                max_hits_per_user:10,
                max_hits:1000
            }
        }
    }
};