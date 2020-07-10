const logModel = require('../app/models/log')

class Common {
  async log(type, data) {
    const logEnity = new logModel({
      type,
      data,
    })
    // 创建用户
    logModel.create(logEnity, (err, data) => {
      if (err) return console.log(err)
    })
    return true
  }
}

module.exports = new Common()
