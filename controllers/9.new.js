var services = require('../services');
var NewsService = services.news;

exports.install = function() {
    // NEWS
    F.route('/api/v2.0/news/',                           json_news_query);
    F.route('/api/v2.0/news/{id}/',                      json_news_read);
    F.route('/api/v2.0/news/categories/',                json_news_categories);

    // NEWS detail view
    F.route('/news/{id}/',                               view_news_detail);
    // NEWS detail share view
    F.route('/newsshare/{id}/',                          view_newsshare_detail);
};

// Gets all news
function json_news_query() {
    var self = this;
    self.query.status = '2';
    NewsService.query(self.query, function (err, result) {
        if (err) {
            self.respond({'code': '1001', 'message': '查询资讯失败'});
            return;
        }

        if (result && result.count && result.count > 0) {
            var prevurl = 'http://' + self.req.uri.host + '/news/';
            var prevshareurl = 'http://' + self.req.uri.host + '/news/';
            var previmg = 'http://' + self.req.uri.host + '/images/original/';
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
        self.respond({'code': '1000', 'message': 'success', 'datas': result});
    });
}

// Reads all news categories
function json_news_categories() {
    var self = this;

    // if (!F.global.newscategories) {
    //     F.global.newscategories = [];
    // }

    // var length = F.global.newscategories.length;
    // var status = '2';
    // var categories = [];
    // for (var i = 0; i < length; i++) {
    //     var category = F.global.newscategories[i];
    //     if (category[status] && category[status] > 0) {
    //         categories.push({ name: category.name, linker: category.name, total: category[status] });
    //     }
    // }
    // self.respond({'code': '1000', 'message': 'success', 'datas': categories});
    var status = '2'; 
    NewsService.queryCategory({'status':status}, function (err, result) {
        if (err) {
            self.respond({'code': '1001', 'message': '查询资讯类目失败'});
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
            self.respond({'code': '1000', 'message': 'success', 'datas': categories});
        } else {
            self.respond({'code': '1000', 'message': 'success', 'datas': []});
        }
    });
}

// Reads a specific new by ID
function json_news_read(id) {
    var self = this;
    var options = {};
    options.id = id;
    // only get online news
    options.status = '2';
    NewsService.get(options, function (err, result) {
        if (err) {
            self.respond({'code': '1001', 'message': '查询资讯失败'});
            return;
        }
        self.respond({'code': '1000', 'message': 'success', 'datas': result});
    });
}


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
        self.view('newsAppDetailShareTemplate', result);
    });
}