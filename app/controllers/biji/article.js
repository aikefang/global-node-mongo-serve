// import global from "@/store/modules/global";

const articleModel = require('../../models/biji/article')
const articleHistoryModel = require('../../models/biji/article-history')
const articleDraftModel = require('../../models/biji/article-draft')
// const categoryModel = require('../../models/biji/category.server.model')
// const userModel = require('../../models/user.server.model')
const humb = require('../../../lib/hump')
const simplifyTime = require('../../../lib/simplifyTime')
const replaceContentImg = require('../../../lib/replaceContentImg')
const num2Str = require('../../../lib/num2Str')
const _ = require('lodash')

const {html2json, json2html} = require('html2json')

const common = require('../../../lib/common')

module.exports = {
  async list(ctx, next) {
    let pageSize = parseInt(ctx.request.query.pageSize, 10) || 10
    let pageNum = parseInt(ctx.request.query.pageNum, 10) || 1

    let findObj = {}

    if (!(ctx.session.logged === true && ctx.session.userInfo.account === 'madashi')) {
      findObj.levelSecond = {
        $ne: global.custom.mongoose.Types.ObjectId('5ef2cb2f071be112473163ca')
      }
    }

    const articleList = await articleModel.find(findObj, {
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
        seo: 1,
      })
      .populate('levelSecond', {
        id: 1,
        _id: 1,
        title: 1,
        isEnable: 1,
        parent: 1,
        parentId: 1,
        seo: 1,
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
  async search(ctx) {
    const pageSize = parseInt(ctx.request.query.pageSize, 10) || 20
    const pageNum = parseInt(ctx.request.query.pageNum, 10) || 1
    const {
      keyword,
      levelFirst,
      levelSecond,
    } = ctx.request.query

    const reg = new RegExp(keyword, 'i')
    const type = {}
    if (levelFirst || levelSecond) {
      if (levelFirst) {
        type.levelFirst = levelFirst
      }
      if (levelSecond) {
        type.levelSecond = levelSecond
      }
    }
    const params = {
      ...type
    }
    if (!(ctx.session.logged === true && ctx.session.userInfo.account === 'madashi')) {
      params.$and = [
        {
          levelSecond: {
            $ne: global.custom.mongoose.Types.ObjectId('5ef2cb2f071be112473163ca')
          }
        }
      ]
    }

    if (keyword) {
      params.title = {
        $regex: reg
      }
    }

    const res = await articleModel
      .find(params)
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
        seo: 1,
      })
      .populate('levelSecond', {
        id: 1,
        _id: 1,
        title: 1,
        isEnable: 1,
        parent: 1,
        parentId: 1,
        seo: 1,
      })
      .lean()

    const list = humb(res)
    list.forEach(data => {
      data.originTitle = data.title
      if (!!keyword) {
        data.title = data.title.replace(reg, (res, val, index) => {
          return `<span style="color: red">${res}</span>`
        })
      }
      if (data.articleImageView) {
        data.articleImageView2 = data.articleImageView + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80|imageView2/1/w/160/h/90'
        data.articleImageViewPc = data.articleImageView + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80|imageView2/1/w/160/h/90'
        data.articleImageViewMobile = data.articleImageView + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80|imageView2/1/w/80/h/45'
      } else {
        data.articleImageView2 = '//static.webascii.cn/webascii/files/default-view.png?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80|imageView2/1/w/160/h/90'
        data.articleImageViewPc = '//static.webascii.cn/webascii/files/default-view.png?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80|imageView2/1/w/160/h/90'
        data.articleImageViewMobile = '//static.webascii.cn/webascii/files/default-view.png?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80|imageView2/1/w/80/h/45'
      }
    })

    const total = await articleModel.countDocuments(params)

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        note: {
          list,
          keyword,
          pageSize,
          pageNum,
          total,
        }
      }
    }

  },
  async details(ctx) {
    const id = ctx.request.query.id
    const imageMogr2 = ctx.request.query.imageMogr2
    common.log('article-view', {
      id
    })
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

    /**
     * 推荐文章逻辑
     * @type {{$and: *[], is_enable: number}}
     * 1：取当前二级类目下文章补足20条（排除自己）
     * 2：不够20条取一级类目下文章补足20条（排除自己）
     * 3：仍然不够20条取最新文章补足20条（排除自己）
     */
    const findObj = {
      is_enable: 1,
      $and: [
        // 排除当前文章
        {
          _id: {
            $ne: details._id
          }
        },
        // 搜索推荐文章
        {
          levelFirst: details.levelFirst._id,
          levelSecond: details.levelSecond._id,
        }
      ]
    }
    if (!(ctx.session.logged === true && ctx.session.userInfo.account === 'madashi')) {
      // 搜索条件添加
      findObj.$and.push({
        levelSecond: {
          $ne: global.custom.mongoose.Types.ObjectId('5ef2cb2f071be112473163ca')
        }
      })
    }
    // 获取当前二级分类推荐
    const recommendList = await articleModel.find(
      findObj,
      {
        id: 1,
        title: 1,
        article_image_view: 1,
      })
      .limit(10)
      .sort({
        c_time: -1
      })
      .lean()

    // 当前类目下无其他文章
    if (recommendList.length === 0) {

      const findLevelFirstObj = {
        is_enable: 1,
        $and: [
          // 排除当前文章
          {
            _id: {
              $ne: details._id
            }
          },
          // 搜索推荐文章
          {
            levelFirst: details.levelFirst._id
          }
        ]
      }
      const findNewObj = {
        is_enable: 1,
        $and: [
          // 排除当前文章
          {
            _id: {
              $ne: details._id
            }
          }
        ]
      }
      if (!(ctx.session.logged === true && ctx.session.userInfo.account === 'madashi')) {
        // 搜索条件添加
        findLevelFirstObj.$and.push({
          levelSecond: {
            $ne: global.custom.mongoose.Types.ObjectId('5ef2cb2f071be112473163ca')
          }
        })
        // 搜索条件添加
        findNewObj.$and.push({
          levelSecond: {
            $ne: global.custom.mongoose.Types.ObjectId('5ef2cb2f071be112473163ca')
          }
        })
      }
      // 获取主分类推荐
      const recommendLevelFirstList = await articleModel.find(
        findLevelFirstObj,
        {
          id: 1,
          title: 1,
          article_image_view: 1,
        })
        .limit(10)
        .sort({
          c_time: -1
        })
        .lean()

      recommendList.push(...recommendLevelFirstList)

      if (recommendLevelFirstList.length < 10) {
        const recommendNewList = await articleModel.find(
          findNewObj,
          {
            id: 1,
            title: 1,
            article_image_view: 1,
          })
          .limit(10 - recommendLevelFirstList.length)
          .sort({
            c_time: -1
          })
          .lean()
        recommendList.push(...recommendNewList)
      }
    }


    const note = humb(details)
    note.author.headImg = note.author.headImg + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/40'
    note.simplifyCTime = simplifyTime(note.cTime, `发布`)
    note.simplifyMTime = simplifyTime(note.mTime, `更新`)
    note.zanStr = num2Str(note.zan)
    const anchorList = []
    if (imageMogr2 - 0 === 1) {

      note.content = replaceContentImg(note.content)

      const content = html2json(note.content)

      let anchorNum = 1


      const getText = (arr) => {
        let text = ''
        let fn = (arr) => {
          arr.forEach(data => {
            if (data.node === 'text') {
              text += data.text
            } else if (data.child) {
              fn(data.child)
            }
          })
        }
        fn(arr)
        return text
      }

      const dealNode = (arr) => {
        let fn = (arr) => {
          arr.forEach(data => {
            if (data.node === 'element' && (data.tag === 'h1' || data.tag === 'h2' || data.tag === 'h3' || data.tag === 'h4' || data.tag === 'h5' || data.tag === 'h6')) {
              const anchorId = 'anchor-' + anchorNum
              const text = getText(data.child) || '未识别标题'
              anchorList.push({
                tag: data.tag,
                id: anchorId,
                text
              })

              if (data.attr) {
                // data.attr.id = anchorId
                data.attr['anchor-id'] = anchorId
                if (!data.attr.class) {
                  data.attr.class = 'anchor-tag'
                } else if (data.attr.class && typeof data.attr.class === 'string') {
                  data.attr.class = [data.attr.class, 'anchor-tag']
                } else if (data.attr.class && typeof data.attr.class === 'object') {
                  data.attr.class = [...data.attr.class, 'anchor-tag']
                }
              } else {
                data.attr = {
                  // id: anchorId
                  'anchor-id': anchorId,
                  'class': 'anchor-tag'
                }
              }

              anchorNum++
            }
            if (data.child) {
              fn(data.child)
            }
          })
        }
        fn(arr)
        return arr
      }
      content.child = dealNode(content.child)
      note.content = json2html(content)
    }
    note.anchorList = anchorList

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        // content: html2json(note.content),
        note,
        isAuthor,
        allArticleNum,
        allViews: allViews.total,
        allViewsStr: num2Str(allViews.total),
        // newNoteList: humb(newList)
        recommendList: humb(recommendList)
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
    }, {
      title: 1,
      article_describe: 1,
      article_image_view: 1,
      c_time: 1,
    })
      .sort({
        c_time: -1
      })
      .lean()

    list.forEach(data => {
      data.cTimeSimplify = simplifyTime(data.c_time, '修改')
    })


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
  async historyDetails(ctx) {
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
    const details = await articleHistoryModel.findOneAndUpdate(
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
      .populate('origin', {
        _id: 1,
        title: 1,
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
    note.simplifyCTime = simplifyTime(note.cTime, `记录`)
    note.simplifyMTime = simplifyTime(note.mTime, `更新`)
    note.zanStr = num2Str(note.zan)

    note.content = replaceContentImg(note.content)

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
  async historyDelete(ctx) {
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

    const hisRes = await articleHistoryModel.findOne({
      _id: id
    }, {
      author: 1
    })
    if (!hisRes) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }
    if (hisRes.author.toString() !== ctx.session.userInfo._id) {
      return ctx.body = {
        status: 200005,
        message: '没有权限删除',
        data: {}
      }
    }


    const res = await articleHistoryModel.deleteOne({
      _id: global.custom.mongoose.Types.ObjectId(id)
    })

    if (res.deletedCount === 1) {
      return ctx.body = {
        status: 200,
        message: '删除成功',
        data: res
      }
    } else {
      return ctx.body = {
        status: 500001,
        message: '删除失败',
        data: res
      }
    }
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
  },
  // 编辑文章
  async edit(ctx) {
    const allContent = ctx.request.body.allContent

    const articleContent = await articleModel.findOne({
      _id: allContent.id
    })
      .populate('author', {
        _id: 1,
        account: 1
      })
      .lean()

    if (ctx.session.userInfo.account !== articleContent.author.account) {
      return ctx.body = {
        status: 200005,
        message: '无操作权限',
        data: {}
      }
    }
    if (!articleContent) {
      return ctx.body = {
        status: 200004,
        message: '暂无数据',
        data: {}
      }
    }


    const data = {}
    data.m_time = new Date()
    // allContent.title && (data.title = allContent.title);
    allContent.article_describe && (data.article_describe = allContent.article_describe);
    allContent.content && (data.content = allContent.content);

    allContent.levelFirst && (data.levelFirst = allContent.levelFirst);
    allContent.levelSecond && (data.levelSecond = allContent.levelSecond);

    allContent.article_image_view && (data.article_image_view = allContent.article_image_view)

    const changeBoolean = [false]

    if (allContent.title && articleContent.title !== allContent.title) {
      data.title = allContent.title
      changeBoolean.push(true)
    }
    if (allContent.article_describe && articleContent.article_describe !== allContent.article_describe) {
      data.article_describe = allContent.article_describe
      changeBoolean.push(true)
    }
    if (allContent.content && articleContent.content !== allContent.content) {
      data.content = allContent.content
      changeBoolean.push(true)
    }
    if (allContent.levelFirst && articleContent.levelFirst.toString() !== allContent.levelFirst.toString()) {
      data.levelFirst = global.custom.mongoose.Types.ObjectId(allContent.levelFirst)
      changeBoolean.push(true)
    }
    if (allContent.levelSecond && articleContent.levelSecond.toString() !== allContent.levelSecond.toString()) {
      data.levelSecond = global.custom.mongoose.Types.ObjectId(allContent.levelSecond)
      changeBoolean.push(true)
    }
    if (allContent.article_image_view && articleContent.article_image_view !== allContent.article_image_view) {
      data.article_image_view = global.custom.mongoose.Types.ObjectId(allContent.article_image_view)
      changeBoolean.push(true)
    }

    // 当前数据没有变更
    if (changeBoolean.every(data => data === false)) {
      return ctx.body = {
        status: 200,
        message: '数据相同，无需更新',
        data: {
          id: allContent.id
        }
      }
    }

    /** 保存旧数据 Start **/
    articleContent.origin = articleContent._id
    delete articleContent._id

    // 新增
    const articleHistoryEnity = await new articleHistoryModel({
      ...articleContent,
      views: 0,
      c_time: new Date()
    })

    // 创建历史记录
    await articleHistoryModel.create(articleHistoryEnity)
    /** 保存旧数据 End **/

    // 更新
    await articleModel.updateOne(
      {
        _id: global.custom.mongoose.Types.ObjectId(allContent.id)
      },
      {
        $set: data
      },
      {
        'upsert': false
      })

    ctx.body = {
      status: 200,
      message: '修改成功',
      data: {
        // res,
        ...data,
        id: allContent.id
      }
    }
  },
  async zan(ctx) {
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
          zan: 1
        }
      },
      {
        new: true,
        upsert: false
      }
    )
      .lean()

    if (!details) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }
    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        id,
        zanStr: num2Str(details.zan)
      }
    }
  },
  async draftList(ctx) {
    // console.log(ctx.session.userInfo._id)
    const res = await articleDraftModel.find({
      author: global.custom.mongoose.Types.ObjectId(ctx.session.userInfo._id)
    })
      .sort({
        c_time: -1
      })
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
        seo: 1,
      })
      .populate('levelSecond', {
        id: 1,
        _id: 1,
        title: 1,
        isEnable: 1,
        parent: 1,
        parentId: 1,
        seo: 1,
      })
      .lean()

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        list: humb(res)
      }
    }
  },
  async draftUpdate(ctx) {
    const id = ctx.request.body.id
    const data = ctx.request.body.data || {}
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

    const draftRes = await articleDraftModel.findOne({
      _id: id
    }, {
      author: 1
    })
    if (!draftRes) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }
    if (draftRes.author.toString() !== ctx.session.userInfo._id) {
      return ctx.body = {
        status: 200005,
        message: '没有权限修改',
        data: {}
      }
    }

    // 更新
    const res = await articleDraftModel.updateOne(
      {
        _id: global.custom.mongoose.Types.ObjectId(id)
      },
      {
        $set: {
          ...data,
          m_time: new Date()
        }
      },
      {
        'upsert': false
      })
      .lean()

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        ...res
      }
    }
  },
  async draftDetails(ctx) {
    const id = ctx.request.body.id
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

    const draftRes = await articleDraftModel.findOne({
      _id: id
    }, {
      author: 1
    })

    if (!draftRes) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }

    if (draftRes.author.toString() !== ctx.session.userInfo._id) {
      return ctx.body = {
        status: 200005,
        message: '没有权限查看',
        data: {}
      }
    }


    const res = await articleDraftModel.findOne({
      _id: id
    })
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
        seo: 1,
      })
      .populate('levelSecond', {
        id: 1,
        _id: 1,
        title: 1,
        isEnable: 1,
        parent: 1,
        parentId: 1,
        seo: 1,
      })
      .lean()

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        ...humb(res)
      }
    }
  },
  async draftCreate(ctx) {
    const articleDraftEnity = await new articleDraftModel({
      author: global.custom.mongoose.Types.ObjectId(ctx.session.userInfo._id)
    })
    // 创建历史记录
    const res = await articleDraftModel.create(articleDraftEnity)
    ctx.body = {
      status: 200,
      message: '成功',
      data: humb(res.toObject())
    }
  },
  async draftDelete(ctx) {
    const id = ctx.request.body.id
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

    const draftRes = await articleDraftModel.findOne({
      _id: id
    }, {
      author: 1
    })
    if (!draftRes) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }
    if (draftRes.author.toString() !== ctx.session.userInfo._id) {
      return ctx.body = {
        status: 200005,
        message: '没有权限删除',
        data: {}
      }
    }

    const res = await articleDraftModel.deleteOne({
      _id: global.custom.mongoose.Types.ObjectId(id)
    }).lean()

    ctx.body = {
      status: 200,
      message: '删除成功',
      data: {
        ...res
      }
    }
  },
  async draftPublish(ctx) {
    const id = ctx.request.body.id
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

    const draftRes = await articleDraftModel.findOne({
      _id: id
    })
    if (!draftRes) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }
    if (draftRes.author.toString() !== ctx.session.userInfo._id) {
      return ctx.body = {
        status: 200005,
        message: '没有权限',
        data: {}
      }
    }

    // 发布文章
    const articleEnity = await new articleModel({
      author: global.custom.mongoose.Types.ObjectId(ctx.session.userInfo._id),
      m_time: null,
      title: draftRes.title,
      article_describe: draftRes.article_describe,
      content: draftRes.content,
      article_image_view: draftRes.article_image_view,
      levelFirst: draftRes.levelFirst,
      levelSecond: draftRes.levelSecond,
    })
    // 发布文章
    const res = await articleModel.create(articleEnity)

    const articleData = humb(res.toObject())
    ctx.body = {
      status: 200,
      message: '成功',
      data: articleData
    }
    // 删除草稿
    if (articleData._id) {
      await articleDraftModel.deleteOne({
        _id: draftRes._id
      })
    }
  },
}
