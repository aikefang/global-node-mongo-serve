const bookModel = require('../../models/book/book')
// const humb = require('../../../lib/hump')
module.exports = {
  // 书籍列表
  async list(ctx, next) {
    const search = ctx.request.query.search
    const params = {
      isEnable: 1
    }
    if (search) {
      const reg = new RegExp(search, 'i')
      params.bookName = {
        $regex: reg
      }
    }
    const res = await bookModel
      .find(params)
      .sort({
        cTime: -1
      })
      .lean()

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        list: res
      }
    }
  },
  // 创建书籍
  async create(ctx) {
    const {
      bookName,
      baiduCloudDiskUrl,
      bookImg,
      contributorName,
    } = ctx.request.body

    if (!bookName) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => bookName',
        data: {}
      }
    }
    if (!baiduCloudDiskUrl) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => baiduCloudDiskUrl',
        data: {}
      }
    }
    if (!bookImg) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => bookImg',
        data: {}
      }
    }
    const params = {
      bookName,
      baiduCloudDiskUrl,
      bookImg,
    }

    if (contributorName) {
      params.contributorName = contributorName
    }

    const bookModelEnity = await new bookModel(params)

    const res = await bookModel.create(bookModelEnity)

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        ...res.toObject()
      }
    }
  },
  // 旧数据重定向
  async redirect(ctx) {
    const id = ctx.request.query.id
    if (!id) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => id',
        data: {}
      }
    }

    const book = await bookModel.findOne({
      id: id
    })
      .lean()

    if (!book) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }
    ctx.body = {
      status: 200,
      massage: 'success',
      data: {
        needRedirect: book._id.toString() !== id.toString(),
        redirect: book._id
      }
    }
  },
  async details(ctx) {
    const {
      id
    } = ctx.request.query

    if (!id) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => id',
        data: {}
      }
    }
    if (!global.custom.mongoose.Types.ObjectId.isValid(id)) {
      return ctx.body = {
        status: 500001,
        message: '未知错误',
        data: {
          id
        }
      }
    }


    const res = await bookModel.findOne({
      _id: id
    })
      .lean()

    if (!res) {
      return ctx.body = {
        status: 200004,
        message: '暂无数据',
        data: {}
      }
    }

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        ...res
      }
    }

  }
}
