const qiniuTool = require('qiniu-tool')
const config = require('../config/config')
const uuid = require('node-uuid')
const fnv = require('fnv-plus')

module.exports = async (url, pathCDN = 'webascii/files/') => {

  await qiniuTool.config({
    ...config.server.qiniuConfig,
    pathCDN,
  })

  const v1 = uuid.v1()
  const hash = `${fnv.hash(v1, 64).str()}`

  return await qiniuTool.fetch(url, hash)
}
