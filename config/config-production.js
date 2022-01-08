let config = require('/home/wwwroot/global-config/prod-config.js')
exports.serverOptions = config.mongoService.serverOptions
exports.mongo = config.mongoService.mongo

exports.sissionOption = config.mongoService.sissionOption
exports.mysql = {
  webascii: config.server.mysql
}
exports.server = config.server
exports.github = config.github
