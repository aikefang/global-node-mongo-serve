const qiniuTool = require('qiniu-tool')
const config = require('../config/config')
const deleteCacheFile = require('../lib/deleteCacheFile')
module.exports = async (file, pathCDN, option = {}) => {
  const uploadConfig = config.server.qiniuConfig
  if (pathCDN) {
    uploadConfig.pathCDN = pathCDN
  }

  let fileName = file.filename

  if (option.size === true) {
    const sizeOf = require('image-size')
    const dimensions = sizeOf(file.path)
    if (['png', 'jpg', 'jpeg', 'gif'].indexOf(dimensions.type) >= 0) {

      let b = new Buffer.from('[' + dimensions.width + ',' + dimensions.height + ']');
      let s = b.toString('base64')

      fileName = file.filename.replace('.' + dimensions.type,  '-' + s + '.' + dimensions.type)
    }
  }

  await qiniuTool.config({
    ...config.server.qiniuConfig,
    pathLocal: file.path, // 上传到CDN的文件路径
    onlyPath: fileName
  })
  let qiniuFile = await qiniuTool.uploadOnly()
  if (!qiniuFile) {
    deleteCacheFile(file.path)
    return false
  } else {
    deleteCacheFile(file.path)
    const website = config.server.qiniuConfig.website
    return {
      size: file.size,
      hash: qiniuFile.hash,
      originalname: file.originalname,
      filename: file.filename,
      path: `${website}${qiniuFile.key}`,
      info: qiniuFile
    }
  }
}
