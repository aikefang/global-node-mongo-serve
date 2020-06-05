const articleModel = require('../../models/biji/article.server.model')
const articleHistoryModel = require('../../models/biji/article-history.server.model')
// const categoryModel = require('../../models/biji/category.server.model')
// const userModel = require('../../models/user.server.model')
const humb = require('../../../lib/hump')
const simplifyTime = require('../../../lib/simplifyTime')
const num2Str = require('../../../lib/num2Str')
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
      .populate('author', {
        id: 1,
        _id: 1,
        nickname: 1,
        head_img: 1,
      })
      .populate('levelFirst', {
        id: 1,
        _id: 1,
        title: 1,
        is_enable: 1,
        parent: 1,
        parent_id: 1,
      })
      .populate('levelSecond', {
        id: 1,
        _id: 1,
        title: 1,
        isEnable: 1,
        parent: 1,
        parentId: 1,
      })
      .lean()

    const list = humb(articleList)


    list.forEach(data => {
      // if (data.articleClassifyLevelFirst) {
      //   data.articleClassifyLevelFirstName = allClassify[data.articleClassifyLevelFirst]
      // } else {
      //   data.articleClassifyLevelFirstName = ''
      // }
      // if (data.articleClassifyLevelSecond) {
      //   data.articleClassifyLevelSecondName = allClassify[data.articleClassifyLevelSecond]
      // } else {
      //   data.articleClassifyLevelSecondName = ''
      // }
      if (data.articleImageView) {
        data.articleImageView2 = data.articleImageView + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80|imageView2/1/w/160/h/90'
        data.articleImageViewPc = data.articleImageView + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80|imageView2/1/w/160/h/90'
        data.articleImageViewMobile = data.articleImageView + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80|imageView2/1/w/80/h/45'
      } else {
        data.articleImageView = '//static.webascii.cn/webascii/files/default-view.png'
        data.articleImageView2 = '//static.webascii.cn/webascii/files/default-view.png?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80|imageView2/1/w/160/h/90'
        data.articleImageViewPc = '//static.webascii.cn/webascii/files/default-view.png?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80|imageView2/1/w/160/h/90'
        data.articleImageViewMobile = '//static.webascii.cn/webascii/files/default-view.png?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80|imageView2/1/w/80/h/45'
      }
      data.simplifyCTime = simplifyTime(data.cTime, `发布`)
      data.simplifyMTime = simplifyTime(data.mTime, `更新`)
      data.author.headImgCompress = data.author.headImg + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/40'
      // data.headImg = allUser[data.authorId].headImg + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/40'
      // data.nickname = allUser[data.authorId].nickname
    })

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        list
      }
    }
  },
  async details(ctx) {
    const id = ctx.request.query.id
    const imageMogr2 = ctx.request.query.imageMogr2
    if (!global.custom.mongoose.Types.ObjectId.isValid(id)) {
      return ctx.body = {
        status: 500001,
        message: '未知错误',
        data: {
          id
        }
      }
    }
    // 查询详情 && 更新浏览次数
    const details = await articleModel.findOneAndUpdate(
      {
        _id: id
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
      .populate('author', {
        id: 1,
        _id: 1,
        nickname: 1,
        head_img: 1,
      })
      .populate('levelFirst', {
        id: 1,
        _id: 1,
        title: 1,
        is_enable: 1,
        parent: 1,
        parent_id: 1,
      })
      .populate('levelSecond', {
        id: 1,
        _id: 1,
        title: 1,
        isEnable: 1,
        parent: 1,
        parentId: 1,
      })
      .lean()

    if (!details) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }

    // 当前用户信息
    const viewUserInfo = ctx.session

    let isAuthor = false
    // 当前用户已登录 && 是否为作者
    if (viewUserInfo.userInfo && viewUserInfo.userInfo._id.toString() === details.author._id.toString()) {
      isAuthor = true
    }

    // 获取总数量 estimatedDocumentCount 和 countDocuments 都可获取总数
    // const allArticleNum = await articleModel.estimatedDocumentCount()
    const allArticleNum = await articleModel.countDocuments()

    // 获取总浏览量
    const [allViews] = await articleModel.aggregate([
      {
        $match: {
          author: details.author._id
        }
      },
      {
        $group: {
          _id: '$author',
          total: {
            $sum: '$views'
          }
        }
      },
      {
        $project: {
          _id: 0,
        }
      }
    ])

    const newList = await articleModel.find({
      is_enable: 1
    }, {
      id: 1,
      title: 1,
      article_image_view: 1,
    })
      .limit(20)
      .sort({
        c_time: -1
      })
      .lean()

    const note = humb(details)
    note.author.headImg = note.author.headImg + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/40'
    note.simplifyCTime = simplifyTime(note.cTime, `发布`)
    note.simplifyMTime = simplifyTime(note.mTime, `更新`)
    note.zanStr = num2Str(note.zan)

    if (imageMogr2 - 0 === 1){
      // 替换旧图片
      note.content.replace(/(webascii\/old_pictures\/uploads\/)(.*?)(\.png|\.jpg)/g, (res, val1,val2,val3, index, content) => {
        if (res.indexOf('_s.png') >= 0) {
          note.content = note.content.replace(res, res.replace(val3, val3 + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80'))
        }
      })
      // 替换新图片
      note.content.replace(/(webascii\/files\/)(.*?)(\.png|\.jpg)/g, (res, val1,val2,val3, index, content) => {
        note.content = note.content.replace(res, res.replace(val3, val3 + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80'))
        // console.log(res)
      })
    }

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        note,
        isAuthor,
        allArticleNum,
        allViews: allViews.total,
        allViewsStr: num2Str(allViews.total),
        newNoteList: humb(newList)
      }
    }
  },
  // 获取历史记录
  async historyList(ctx) {
    const id = ctx.request.query.id
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

    let list = await articleHistoryModel.find({
      origin: global.custom.mongoose.Types.ObjectId(id)
    },{
      title: 1,
      article_describe: 1,
      article_image_view: 1,
      c_time: 1,
    }).lean()

    // list.forEach(data => {
    //
    // })


    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        list: humb(list)
      }
    }

    // if (!details) {
    //   return ctx.body = {
    //     status: 200004,
    //     message: '数据不存在',
    //     data: {}
    //   }
    // }

  },
  // 用户改版前的文章重定向
  async redirect(ctx) {
    let id = ctx.request.query.id
    const art = await articleModel.findOne({
      id: id
    })
      .lean()
    if (!art) {
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
        needRedirect: art._id.toString() !== id.toString(),
        redirect: art._id
      }
    }
  }
}
