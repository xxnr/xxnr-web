/**
 * Created by pepelu on 2016/2/5.
 */
module.exports = {
    max_hits:{
        /*
         max_hits_per_user: max hits per front end user during a interval
         max_hits_per_ip: max hits per ip during a interval
         max_hits: max hits in total during a interval
         interval: in seconds
         */
        '/api/v2.1/order/addOrder':{
            'get':{
                max_hits_per_user:10,
                max_hits:1000,
                interval:60
            },
            'post':{
                max_hits_per_user:10,
                max_hits:1000,
                interval:60
            }
        },
        '/api/v2.0/order/addOrder':{
            'get':{
                max_hits_per_user:10,
                max_hits:1000,
                interval:60
            },
            'post':{
                max_hits_per_user:10,
                max_hits:1000,
                interval:60
            }
        },
        '/alipay':{
            'get':{
                max_hits_per_user:10,
                max_hits:10000,
                interval:60
            },
            'post':{
                max_hits_per_user:10,
                max_hits:10000,
                interval:60
            }
        },
        '/unionpay':{
            'get':{
                max_hits_per_user:10,
                max_hits:10000,
                interval:60
            },
            'post':{
                max_hits_per_user:10,
                max_hits:10000,
                interval:60
            }
        },
        '/api/v2.2/RSC/order/selfDelivery':{
            'post':{
                max_hits_per_user:3,
                interval:60
            }
        },
        '/api/v2.0/sms':{
            'get':{
                max_hits_per_ip : 3,
                interval:60 * 60
            },
            'post':{
                max_hits_per_ip : 3,
                interval:60 * 60
            }
        },
        '/api/v2.3/RSC/rewardshop/order/selfDelivery':{
            'post':{
                max_hits_per_user:3,
                interval:60
            }
        },
    }
};