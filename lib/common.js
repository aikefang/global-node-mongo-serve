const logModel = require('../app/models/log')
const cacheDataModel = require('../app/models/cache-data')

class Common {
  constructor() {
    this.once = 1
  }
  // 检查是否为合法ObjectId
  ObjectId(id) {
    if (!global.custom.mongoose.Types.ObjectId.isValid(id)) {
      return false
    }
    return global.custom.mongoose.Types.ObjectId(id)
  }
  // 记录日志
  async log(type, data) {
    setTimeout(() => {
      const logEnity = new logModel({
        type,
        data,
      })
      // 创建用户
      logModel.create(logEnity, (err, data) => {
        if (err) return console.log(err)
      })
    }, 0)
  }

  /**
   * @getClientIP
   * @desc 获取用户 ip 地址
   * @param {Object} req - 请求
   */
  getClientIP(req) {
    return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
      req.connection.remoteAddress || // 判断 connection 的远程 IP
      req.socket.remoteAddress || // 判断后端的 socket 的 IP
      req.connection.socket.remoteAddress;
  }

  /**
   * 缓存数据
   * @param fn {Function} 回调函数
   * @param fnData {Object} fn参数
   * @param cacheType {String} 缓存名称
   * @param updateMillisecond {Number} 缓存时间，默认5分钟
   * @returns {Promise<*>}
   */
  async cacheData({fn = Function, fnData = {}, cacheType = String, updateMillisecond = 5 * 60 * 1000}) {
    // 获取缓存数据
    let cache = await cacheDataModel.findOne({
      cacheType,
    })
    // 没有此数据，首次创建
    if (!cache) {
      let data = await fn(fnData)
      setTimeout(async () => {
        await cacheDataModel.updateOne(
          {
            cacheType
          }, {
            $set: {
              data,
              updateTime: new Date()
            }
          }, {
            upsert: true
          }
        )
      }, 0)

      return data
    }
    // 规定时间内数据更新
    if (new Date(cache.updateTime).getTime() + updateMillisecond < new Date().getTime()) {
      if (this.once === 1) {
        this.once = 2
        setTimeout(async () => {
          let data = await fn(fnData)
          setTimeout(async () => {
            await cacheDataModel.updateOne(
              {
                cacheType
              },
              {
                $set: {
                  data,
                  updateTime: new Date()
                }
              }
            )
          }, 0)
        })
        setTimeout(() => {
          this.once = 1
        }, 5000)
      }
      return cache.data
    }
    return cache.data
  }

  /**
   * 检查必填项
   * @param data {Object}
   * @param ctx {Object}
   * @returns {boolean}
   * return true 检查通过
   * return false 检查不通过
   */
  checkRequired(data, ctx) {
    for (let item in data) {
      if (!data[item]) {
        ctx.body = {
          status: 500002,
          message: `缺少参数 => ${item}`,
          data: {}
        }
        return false
      }
    }
    return true
  }
}

module.exports = new Common()
