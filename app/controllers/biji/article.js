const articleModel = require('../../models/biji/article.server.model')
const categoryModel = require('../../models/biji/category.server.model')
const userModel = require('../../models/user.server.model')
const humb = require('../../../lib/hump')
const _ = require('lodash')
module.exports = {
  async list(ctx, next) {
    let pageSize = parseInt(ctx.request.query.pageSize, 10) || 10
    let pageNum = parseInt(ctx.request.query.pageNum, 10) || 1

    const articleList = await articleModel.find({}, {
      content: 0
    })
      .sort({
        c_time: -1
      })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean()

    const list = humb(articleList)


    const authors = []



    list.forEach(data => {

    })


    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        list
      }
    }
  }
}
