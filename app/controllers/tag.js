const tagModel = require('../models/tag')
// const common = require('../../lib/common')
// const moment = require('moment')
module.exports = {
  async create(ctx) {
    const recordEnity = new tagModel({
      title: 'test004',
      author: ctx.session.userInfo._id
    })
    const res = await tagModel.create(recordEnity).catch(e => console.log(e))

    if (res) {
      ctx.body = {
        status: 200,
        message: '成功',
        data: {
          ...res.toObject()
        }
      }
    } else {
      ctx.body = {
        status: 500000,
        message: '系统错误',
        data: {}
      }
    }
  }
}
