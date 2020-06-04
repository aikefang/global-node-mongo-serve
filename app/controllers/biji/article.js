const articleModel = require('../../models/biji/article.server.model')
// const categoryModel = require('../../models/biji/category.server.model')
// const userModel = require('../../models/user.server.model')
const humb = require('../../../lib/hump')
const simplifyTime = require('../../../lib/simplifyTime')
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
  }
}
