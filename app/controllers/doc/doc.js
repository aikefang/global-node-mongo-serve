const common = require('../../../lib/common')
const docModel = require('../../models/doc/doc')

module.exports = {
  async search(ctx) {
    const keyword = ctx.request.query.keyword
    const pageNum = ctx.request.query.pageNum || 1
    const pageSize = ctx.request.query.pageSize || 10
    // 检查非必填
    const checked = common.checkRequired({
      keyword
    }, ctx)
    if (!checked) return

    // 分析关键词
    const kArr = [...new Set(keyword.split(' '))].filter((str) => {
      return str !== ''
    })
    const or = []
    kArr.forEach(data => {
      or.push({
        path: {
          $regex: new RegExp(data, 'i')
        }
      })
    })

    const searchParams = {}

    if (or.length > 0) {
      // searchParams.$or = or
      searchParams.$and = or
    }
    const res = await docModel.find(
      searchParams,
      {
        views: 1,
        path: 1,
        title: 1,
      }
    )
      .sort({
        views: -1
      })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)


    /**
     *  搜索优先级排序规则
     *  1、每一个浏览量 +1 权重
     // *  2、每次搜索 长度>2的搜索词都会被记录一次，计算总数量 与当前path能匹配几个 则 n*搜索词记录次数
     // *    例如：搜索了 linux pwd, 那么搜索结果的有两个（）
     // * 命中率排序（当前path命中了几次）
     // * 匹配度排序（）
     *
     */

    ctx.body = {
      status: 200,
      message: 'ok',
      data: {
        keyword,
        keywordList: kArr,
        list: res,
        pageNum,
        pageSize,
      }
    }
  },

  async content(ctx) {
    const path = ctx.request.query.path

    const checked = common.checkRequired({
      path
    }, ctx)
    if (!checked) return

    const res = await docModel.findOne({
      path,
    }, {
      commit: 0
    })

    if (res) {
      return ctx.body = {
        status: 200,
        message: 'ok',
        data: res
      }
    }

    ctx.body = {
      status: 200004,
      message: '数据不存在',
      data: {}
    }
  }
}
