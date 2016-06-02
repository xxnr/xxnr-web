var path = require('path')
var express = require('express')
var webpack = require('webpack')
var config = require('./public/xxnr-mobile-dev/config')
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var busboy = require('connect-busboy');
var fs = require("fs");
var https = require('https');
var http = require('http');
var proxyMiddleware = require('http-proxy-middleware')


process.chdir(__dirname+"/public/xxnr-mobile-dev");
var webpackConfig = process.env.NODE_ENV === 'testing'
  ? require('./public/xxnr-mobile-dev/build/webpack.prod.conf')
  : require('./public/xxnr-mobile-dev/build/webpack.dev.conf')

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express()
var compiler = webpack(webpackConfig)

var devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath,
  stats: {
    colors: true,
    chunks: false
  }
})

var hotMiddleware = require('webpack-hot-middleware')(compiler)
// force page reload when html-webpack-plugin template changes
compiler.plugin('compilation', function (compilation) {
  compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
    hotMiddleware.publish({ action: 'reload' })
    cb()
  })
})

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(context, options))
})

// handle fallback for HTML5 history API
app.use(require('connect-history-api-fallback')())

// serve webpack bundle output
app.use(devMiddleware)

// enable hot-reload and state-preserving
// compilation error display
app.use(hotMiddleware)

// serve pure static assets
var staticPath = path.posix.join(config.build.assetsPublicPath, config.build.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

require('./modules/database');
global.U = require('./common/utils');
global.F = {
  config:require('./config'),
  global:require('./global')
};
global.RELEASE = true;
global.isDebug = false;
global.framework_image = global.Image = require('./modules/image');

// bodyParser based on content type
app.use(bodyParser.json({
  'limit': '1mb'
}));
app.use(bodyParser.urlencoded({extended: false}));

// cookieParser
app.use(cookieParser());

// busboy
app.use(busboy({
  limits: {
    fileSize: F.config.file_size_limit,
    files: F.config.file_count_limit
  }
}));


// website common middleware
app.use(require('./middlewares/website'));

// routes
var routes = require('./routes');
app.use('/', routes.secureFrontendApis);
app.use('/', routes.frontendApis);
app.use('/', routes.frontendPages);
app.use('/', routes.appRelatedPages);
app.use('/', routes.backendApis);
app.use('/', routes.backendPages);

module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:' + port + '\n')
})
