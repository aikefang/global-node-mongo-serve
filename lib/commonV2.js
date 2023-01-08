const path = require('path')
const autoLoadFile = require('./autoLoadFile')
const fileList = autoLoadFile(path.join(__dirname, './common-modules'), true)
const modules = {}

fileList.forEach(data => {
  modules[data.name] = require(data.path)
})
module.exports = modules
