let config = require('/home/wwwroot/global-config.js')
exports.serverOptions = config.mongoService.serverOptions
exports.mongo = config.mongoService.mongo

exports.sissionOption = config.mongoService.sissionOption
