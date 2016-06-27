/**
 * Created by pepelu on 2016/2/5.
 */
module.exports = {
    expire_time_in_ms: 60 * 60,     // if we want to change this value, we need to re-created index for collection throttle.
    max_hits:{
        '/api/v2.1/order/addOrder':{
            'get':{
                max_hits_per_user:10 * 60,
                max_hits:1000 * 60
            },
            'post':{
                max_hits_per_user:10 * 60,
                max_hits:1000 * 60
            }
        },
        '/api/v2.0/order/addOrder':{
            'get':{
                max_hits_per_user:10 * 60,
                max_hits:1000 * 60
            },
            'post':{
                max_hits_per_user:10 * 60,
                max_hits:1000 * 60
            }
        },
        '/alipay':{
            'get':{
                max_hits_per_user:10 * 60,
                max_hits:10000 * 60
            },
            'post':{
                max_hits_per_user:10 * 60,
                max_hits:10000 * 60
            }
        },
        '/unionpay':{
            'get':{
                max_hits_per_user:10 * 60,
                max_hits:10000 * 60
            },
            'post':{
                max_hits_per_user:10 * 60,
                max_hits:10000 * 60
            }
        },
        '/api/v2.2/RSC/order/selfDelivery':{
            'post':{
                max_hits_per_user:3 * 60
            }
        },
        '/api/v2.0/sms':{
            'get':{
                max_hits_per_ip:5
            },
            'post':{
                max_hits_per_ip:5
            }
        }
    }
};