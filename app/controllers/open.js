// const gitlabProjectData = require('../datas/gitlabProject')
const testModel = require('../models/test')
module.exports = {
  demo: async (ctx, next) => {
    // ctx.body = {
    //   info: '测试pm2重启'
    // }
    // testModel.create()
    // let testEnity = new testModel({
    //   id: 1,
    //   name: 'test',
    //   count: 1.221
    // })
    //
    // // 创建用户
    // testModel.create(testEnity, (err, data) => {
    //   if (err) return console.log(err)
    // })
    ctx.response.redirect('/about')
    // ctx.body = {
    //   status: 200,
    //   message: '成功2',
    //   data: {
    //
    //   }
    // }
  },
}
