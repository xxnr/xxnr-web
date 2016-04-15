var services = require('../services');
var tools = require('../common/tools');
var NewsService = services.news;

exports.install = function() {
    // NEWS
    //F.route('/api/v2.0/news/',                           json_news_query);
    //F.route('/api/v2.0/news/{id}/',                      json_news_read);
    //F.route('/api/v2.0/news/categories/',                json_news_categories);

    // NEWS detail view
    F.route('/news/{id}/',                               view_news_detail);
    // NEWS detail share view
    F.route('/sharenews/{id}/',                          view_newsshare_detail);
};

// Gets all news
exports.json_news_query = function(req, res, next) {
    req.data.status = '2';
    NewsService.query(req.data, function (err, result) {
        if (err) {
            res.respond({'code': '1001', 'message': '查询资讯失败'});
            return;
        }

        if (result && result.count && result.count > 0) {
            var hosturl = req.hostname;
            if (hosturl) {
                hosturl = tools.getXXNRHost(hosturl);
            } else {
                hosturl = 'www.xinxinnongren.com';
            }
            var prevurl = 'http://' + hosturl + '/news/';
            var prevshareurl = 'http://' + hosturl + '/sharenews/';
            var previmg = 'http://' + hosturl + '/images/original/';
            var imgtype = '.jpg';
            var items = result.items || [];
            var length = items.length || 0;
            var arr = [];
            for (var i = 0; i < length; i++) {
                var item = items[i];
                arr[i] = {
                    'image': item.picture && item.picture !== '' ? previmg + item.picture + imgtype : '',
                    'category': item.category,
                    'title': item.title,
                    'datecreated': item.datecreated,
                    'url': prevurl + item.id,
                    'shareurl': prevshareurl + item.id,
                    'id': item.id,
                    'newsabstract': item.abstract || ''
                };
            }
            result.items = arr;
        }
        res.respond({'code': '1000', 'message': 'success', 'datas': result});
    });
};

// Reads all news categories
exports.json_news_categories = function(req, res, next) {
    var status = '2';
    NewsService.queryCategory({'status':status}, function (err, result) {
        if (err) {
            res.respond({'code': '1001', 'message': '查询资讯类目失败'});
            return;
        }

        if (result && result.length > 0) {
            var categories = [];
            for (var i = 0; i < result.length; i++) {
                var category = result[i];
                for (var j = 0; j < category['status'].length; j++) {
                    var categorystatus = category['status'][j];
                    if (categorystatus['type'] === status && categorystatus['count'] > 0) {
                        categories.push({name: category.name, linker: category.name, total: categorystatus['count']});
                    }
                }
            }
            res.respond({'code': '1000', 'message': 'success', 'datas': categories});
        } else {
            res.respond({'code': '1000', 'message': 'success', 'datas': []});
        }
    });
};

// Reads a specific new by ID
exports.json_news_read = function(req, res, next) {
    var id = req.params.id;
    var options = {};
    options.id = id;
    // only get online news
    options.status = '2';
    NewsService.get(options, function (err, result) {
        if (err) {
            res.respond({'code': '1001', 'message': '查询资讯失败'});
            return;
        }
        res.respond({'code': '1000', 'message': 'success', 'datas': result});
    });
};

// Gets news detail page for app
function view_news_detail(id) {
    var self = this;
    var options = {};
    options.id = id;
    // only get online news
    options.status = '2';
    NewsService.get(options, function (err, result) {
        if (err || !result) {
            self.throw404();
            return;
        }
        self.view('newsAppDetailTemplate', result);
    });
}

// Gets news detail share page for app
function view_newsshare_detail(id) {
    var self = this;
    var options = {};
    options.id = id;
    // only get online news
    options.status = '2';
    NewsService.get(options, function (err, result) {
        if (err || !result) {
            self.throw404();
            return;
        }
        result['shareurl'] = 'http://' + self.req.uri.host + '/newsshare/' + id;
        self.view('newsAppDetailTemplate', result);
    });
}