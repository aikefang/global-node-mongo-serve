const common = require('../../../lib/common')
const docModel = require('../../models/doc/doc')

module.exports = {
  async create(ctx) {
    const {
      parent,
      title,
      seo,
      content,
      tags
    } = ctx.request.body

    const checked = common.checkRequired({
      parent,
      title,
      seo,
      content,
    }, ctx)
    if (!checked) {
      return
    }

    // 检查标签ID是否为合法的ID
    const checkTags = tags.every(data =>  common.ObjectId(data) !== false)
    if (!checkTags) {
      return ctx.body = {
        status: 500003,
        message: '参数错误',
      }
    }





    if (parent === 1) { // 父级

      // 验证父级分类的seo是否存在
      const findSeo = await docModel.findOne({
        seo,

      })




      const docEnity = new docModel({
        title,
        seo,
        content,
        author: ctx.session.userInfo._id,
        tags: [
          '5f16c6e80e7ebb2e5463c5c5',
          '5f16c6fd98b1e12e5c107ab2'
        ],
      })
    } else { // 子集

    }

    const recordEnity = new docModel({
      title: '文档',
      author: ctx.session.userInfo._id,
      // tags: [
      //   common.ObjectId('5f16c6e80e7ebb2e5463c5c5'),
      //   common.ObjectId('5f16c6fd98b1e12e5c107ab2')
      // ]
      tags: [
        '5f16c6e80e7ebb2e5463c5c5',
        '5f16c6fd98b1e12e5c107ab2'
      ],
      tags2: [
        {
          id: '5f16c6e80e7ebb2e5463c5c5'
        },
        {
          id: '5f16c6fd98b1e12e5c107ab2'
        }
      ]
    })
    const res = await docModel.create(recordEnity).catch(e => console.log(e))

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
  },
  async list(ctx) {
    const res = await docModel.find().populate('tags').populate('tags2.id')
    ctx.body = res
  }
}
