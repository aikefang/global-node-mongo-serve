const cacheDataModel = require('../app/models/cache-data')
let once = 1
module.exports = {
  async cacheData({fn = Function, fnData = {}, cacheType = String, updateMillisecond = 5 * 60 * 1000}) {
    // 获取缓存数据
    let cache = await cacheDataModel.findOne({
      cacheType,
    })
    // 没有此数据，首次创建
    if (!cache) {
      let data = await fn(fnData)
      cacheDataModel.updateOne({
        cacheType,
        data,
      })
      return data
    }
    // 规定时间内数据更新
    if (new Date(cache.updateTime).getTime() + updateMillisecond < new Date().getTime()) {
      if (once === 1) {
        once = 2
        setTimeout(async () => {
          let data = await fn(fnData)
          cacheDataModel.updateOne({
            cacheType,
            data
          })
        })
        setTimeout(() => {
          once = 1
        }, 5000)
      }
      return cache.data
    }
    return cache.data
  }
}
