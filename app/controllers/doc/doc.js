const common = require('../../../lib/common')
const docModel = require('../../models/doc/doc')

module.exports = {
  async search(ctx) {
    const keyword = ctx.request.query.keyword
    const reg = new RegExp(keyword, 'i')

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
        res,
        kArr,
      }
    }
  }
  // async create(ctx) {
  //   const {
  //     parent,
  //     title,
  //     seo,
  //     content,
  //     tags
  //   } = ctx.request.body
  //
  //   const checked = common.checkRequired({
  //     parent,
  //     title,
  //     seo,
  //     content,
  //   }, ctx)
  //   if (!checked) {
  //     return
  //   }
  //
  //   // 检查标签ID是否为合法的ID
  //   const checkTags = tags.every(data =>  common.ObjectId(data) !== false)
  //   if (!checkTags) {
  //     return ctx.body = {
  //       status: 500003,
  //       message: '参数错误',
  //     }
  //   }
  //
  //
  //
  //
  //
  //   if (parent === 1) { // 父级
  //
  //     // 验证父级分类的seo是否存在
  //     const findSeo = await docModel.findOne({
  //       seo,
  //
  //     })
  //
  //
  //
  //
  //     const docEnity = new docModel({
  //       title,
  //       seo,
  //       content,
  //       author: ctx.session.userInfo._id,
  //       tags: [
  //         '5f16c6e80e7ebb2e5463c5c5',
  //         '5f16c6fd98b1e12e5c107ab2'
  //       ],
  //     })
  //   } else { // 子集
  //
  //   }
  //
  //   const recordEnity = new docModel({
  //     title: '文档',
  //     author: ctx.session.userInfo._id,
  //     // tags: [
  //     //   common.ObjectId('5f16c6e80e7ebb2e5463c5c5'),
  //     //   common.ObjectId('5f16c6fd98b1e12e5c107ab2')
  //     // ]
  //     tags: [
  //       '5f16c6e80e7ebb2e5463c5c5',
  //       '5f16c6fd98b1e12e5c107ab2'
  //     ],
  //     tags2: [
  //       {
  //         id: '5f16c6e80e7ebb2e5463c5c5'
  //       },
  //       {
  //         id: '5f16c6fd98b1e12e5c107ab2'
  //       }
  //     ]
  //   })
  //   const res = await docModel.create(recordEnity).catch(e => console.log(e))
  //
  //   if (res) {
  //     ctx.body = {
  //       status: 200,
  //       message: '成功',
  //       data: {
  //         ...res.toObject()
  //       }
  //     }
  //   } else {
  //     ctx.body = {
  //       status: 500000,
  //       message: '系统错误',
  //       data: {}
  //     }
  //   }
  // },
  // async list(ctx) {
  //   const res = await docModel.find().populate('tags').populate('tags2.id')
  //   ctx.body = res
  // }
}
