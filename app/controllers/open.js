// const gitlabProjectData = require('../datas/gitlabProject')
const testModel = require('../models/test.server.model')
module.exports = {
  demo: async (ctx, next) => {

    testModel.create()
    let testEnity = new testModel({
      id: 1,
      name: 'test',
      count: 1.221
    })

    // 创建用户
    testModel.create(testEnity, (err, data) => {
      if (err) return console.log(err)
    })
    ctx.body = {
      status: 200,
      message: '成功',
      data: {

      }
    }
  },
}
