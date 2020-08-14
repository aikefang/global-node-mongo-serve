const common = require('../../../lib/common')
const docModel = require('../../models/doc/doc')
const docCategoryModel = require('../../models/doc/doc-category')

module.exports = {
  // 搜索
  async search(ctx) {
    const keyword = ctx.request.query.keyword
    const pageNum = Number(ctx.request.query.pageNum || 1)
    const pageSize = Number(ctx.request.query.pageSize || 10)
    // 检查非必填
    const checked = common.checkRequired({
      keyword
    }, ctx)
    if (!checked) return

    // 分析关键词 去重 去空 处理为数组
    const kArr = [...new Set(keyword.split(' '))].filter((str) => {
      return str !== ''
    })
    const or = []
    kArr.forEach(data => {
      // 置为小写
      let name = data.toLocaleLowerCase()
      // 矫正关键词
      if (data === 'node.js' || data === 'node') {
        name = 'nodejs'
      } else if (data === 'js') {
        name = 'javascript'
      } else if (data === 'ts') {
        name = 'typescript'
      }
      or.push({
        path: {
          $regex: new RegExp(name, 'i')
        }
      })
    })

    const searchParams = {}

    if (or.length > 0) {
      // 添加and筛选 取交集
      searchParams.$and = or
    }
    const res = await docModel.find(
      searchParams,
      {
        views: 1,
        path: 1,
        category: 1,
        icon: 1,
        title: 1,
      }
    )
      .populate(
        'icon',
        {
          title: 1,
          icon: 1,
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

    const total = await docModel.countDocuments(searchParams)

    ctx.body = {
      status: 200,
      message: 'ok',
      data: {
        keyword,
        keywordList: kArr,
        list: res,
        hasMore: !(pageNum * pageSize >= total),
        pageNum,
        pageSize,
        total: total
      }
    }
  },

  // 获取内容
  async content(ctx) {
    const path = ctx.request.query.path

    const checked = common.checkRequired({
      path
    }, ctx)
    if (!checked) return

    const res = await docModel.findOneAndUpdate(
      {
        path,
      },
      {
        $inc: {
          views: 1
        }
      },
      {
        new: true,
        upsert: false
      }
    )

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
  },

  // 添加分类
  async addCategory(ctx) {
    const title = ctx.request.body.title
    const icon = ctx.request.body.icon
    // 检查非必填
    const checked = common.checkRequired({
      title,
      icon,
    }, ctx)
    if (!checked) return
    // 更新或者新增分类
    const res = await docCategoryModel.updateOne(
      {
        title
      },
      {
        $set: {
          title,
          icon,
          cTime: new Date()
        }
      },
      {
        upsert: true,
        new: true
      }
    ).lean()

    let type = 'update'
    if (Array.isArray(res.upserted) && res.upserted.length > 0) {
      type = 'new'
    } else if (res.nModified === 1) {
      type = 'update'
    }

    ctx.body = {
      status: 200,
      message: type + ' ok',
      data: {
        ...res
      }
    }
  }
}
