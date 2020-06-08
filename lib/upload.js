const qiniuTool = require('qiniu-tool')
const config = require('../config/config')
const deleteCacheFile = require('../lib/deleteCacheFile')
module.exports = async (file, pathCDN) => {
  const uploadConfig = config.server.qiniuConfig
  if (pathCDN) {
    uploadConfig.pathCDN = pathCDN
  }
  await qiniuTool.config({
    ...config.server.qiniuConfig,
    pathLocal: file.path, // 上传到CDN的文件路径
    onlyPath: file.filename
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
    }
  }
}
