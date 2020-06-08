// 定时任务自动删除缓存文件
let fs = require('fs')
let deleteCacheFile = file => {
  setTimeout(() => {
    fs.unlink(file, () => {})
  }, 5000)
}
module.exports = deleteCacheFile
