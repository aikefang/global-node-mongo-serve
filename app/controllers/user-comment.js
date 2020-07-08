const userCommentModel = require('../models/user-comment')
const humb = require('../../lib/hump')
const replaceContentImg = require('../../lib/replaceContentImg')
const _ = require('lodash')
module.exports = {
  async list(ctx) {
    const id = ctx.request.query.id
    let pageSize = parseInt(ctx.request.query.pageSize, 10) || 10
    let pageNum = parseInt(ctx.request.query.pageNum, 10) || 1

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

    const res = await userCommentModel.find({
      article: id,
      parent: null
    })
      .sort({
        _id: -1
      })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate('author', {
        id: 1,
        _id: 1,
        nickname: 1,
        head_img: 1,
      })
      .lean()

    const parentIds = []
    res.forEach(data => {
      data.content = replaceContentImg(data.content)
      parentIds.push(data._id)
    })

    const resChild = await userCommentModel.find({
      article: id,
      parent: {
        $in: parentIds
      }
    })
      .populate('author', {
        id: 1,
        _id: 1,
        nickname: 1,
        head_img: 1,
      })
      .populate('replyAuthor', {
        id: 1,
        _id: 1,
        nickname: 1,
        head_img: 1,
      })
      .populate('quote', {
        content: 1,
        author: 1
      })
      .lean()
    resChild.forEach(data => {

      if (data.quote) {
        data.quote.content = replaceContentImg(data.quote.content)
      }
      data.content = replaceContentImg(data.content)
    })
    const childGroup = _.groupBy(resChild, 'parent')

    res.forEach(data => {
      if (childGroup[data._id.toString()]) {
        data.children = [...childGroup[data._id.toString()]]
      } else {
        data.children = []
      }
    })

    const userCommentNum = await userCommentModel.countDocuments({
      article: id,
      parent: null
    })

    const userCommentAllNum = await userCommentModel.countDocuments({
      article: id
    })

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        list: humb(res),
        total: userCommentNum,
        pageNum,
        pageSize,
        allTotal: userCommentAllNum
        // childGroup
      }
    }
  },
  async create(ctx) {
    const {
      article,
      // author,
      replyAuthor,
      parent,
      content,
      quote,
    } = ctx.request.body
    // ctx.session.userInfo = {
    //   _id: userInfo._id,
    //   id: userInfo.id,
    //   account: userInfo.account,
    // }

    const params = {
      article,
      author: global.custom.mongoose.Types.ObjectId(ctx.session.userInfo._id),
      content,
    }
    if (replyAuthor) {
      params.replyAuthor = replyAuthor
    }
    if (parent) {
      params.parent = parent
    }
    if (quote) {
      params.quote = quote
    }
    const userCommentEnity = await new userCommentModel(params)

    // 创建历史记录
    const res = await userCommentModel.create(userCommentEnity)
    const resObj = res.toObject()

    let data = null
    let type = ''
    let searchParent = null

    // 新增加的一级评论数据
    if (!resObj.parent) {
      type = 'new'
      searchParent = resObj._id
    } else { // 非一级评论数据
      type = 'old'
      searchParent = resObj.parent
    }

    const parentRes = await userCommentModel.findOne({
      _id: searchParent
    })
      .populate('author', {
        id: 1,
        _id: 1,
        nickname: 1,
        head_img: 1,
      })
      .lean()

    const resChild = await userCommentModel.find({
      parent: parentRes._id
    })
      .populate('author', {
        id: 1,
        _id: 1,
        nickname: 1,
        head_img: 1,
      })
      .populate('replyAuthor', {
        id: 1,
        _id: 1,
        nickname: 1,
        head_img: 1,
      })
      .populate('quote', {
        content: 1,
        author: 1
      })
      .lean()

    parentRes.children = resChild || []

    data = parentRes

    ctx.body = {
      status: 200,
      message: '评论成功',
      data: {
        data: humb(data),
        type
      }
    }
  },
  async delete(ctx) {

  }
}
