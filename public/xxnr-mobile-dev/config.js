// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')

module.exports = {
  build: {
    index: path.resolve(__dirname, '../xxnrMobilePro/index.html'),
    assetsRoot: path.resolve(__dirname, '../public/xxnrMobilePro'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: true
  },
  dev: {
    port: 8080,
    proxyTable: {}
  },
  API_ROOT: (process.env.NODE_ENV === 'production')
    ? '/'
    :'/'
}
