// const gitlabProjectData = require('../datas/gitlabProject')
const userModel = require('../models/user.server.model')
const webasciiBijiArticleModel = require('../models/biji/article.server.model')
const webasciiBijiArticleDraftModel = require('../models/biji/article-draft.server.model')
const webasciiBijiArticleHistoryModel = require('../models/biji/article-history.server.model')
const webasciiBijiCategoryModel = require('../models/biji/category.server.model')
const bannerModel = require('../models/biji/banner.server.model')
const navModel = require('../models/biji/nav.server.model')
const {connection} = require('../../config/webascii-mysql')
// let dateFormat = require('dateformat')
module.exports = {
  // 处理文章
  async article(ctx, next) {
    async function getContent() {
      return new Promise((resolve, reject) => {
        connection.query(`select * from biji_content`, [], function (error, results, fields) {
          if (error) {
            throw error
          }
          resolve(results)
        })
      })
    }
    let res = await getContent()
    for (const data of res) {
      let article = await webasciiBijiArticleModel.find({
        id: data.id
      }).populate('user')
      // console.log(article)
      let author = await userModel.findOne({
        id: data.author_id
      })
      if (article.length == 0) {
        // 新增
        let webasciiBijiArticleEnity = new webasciiBijiArticleModel({
          ...data,
          c_time: new Date(data.c_time),
          m_time: data.m_time ? new Date(data.m_time) : null,
          author: author._id
        })

        // 创建用户
        webasciiBijiArticleModel.create(webasciiBijiArticleEnity, (err, data) => {
          if (err) return console.log(err)
        })
      } else {
        // 更新
        await webasciiBijiArticleModel.updateOne(
          {
            id: data.id
          },
          {
            $set: {
              ...data,
              c_time: new Date(data.c_time),
              m_time: data.m_time ? new Date(data.m_time) : null,
              author: author._id
            }
          },
          {
            'upsert': false
          })
      }
    }
    let article = await webasciiBijiArticleModel.find({
      id: 10
    }).populate(
      'author',
      {
        _id: 1,
        id: 1,
        nickname: 1,
        head_img: 1,
      })
    ctx.body = {
      article
    }
  },
  // 处理文章历史记录
  async articleHistory(ctx, next) {
    async function getContent() {
      return new Promise((resolve, reject) => {
        connection.query(`select * from biji_content_history`, [], function (error, results, fields) {
          if (error) {
            throw error
          }
          resolve(results)
        })
      })
    }
    let res = await getContent()
    for (const data of res) {
      let article = await webasciiBijiArticleHistoryModel.find({
        id: data.id
      }).populate('user')
      // console.log(article)
      let author = await userModel.findOne({
        id: data.author_id
      })
      let origin = await webasciiBijiArticleModel.findOne({
        id: data.origin_id
      })
      console.log(origin)
      if (article.length == 0) {
        // 新增
        let webasciiBijiArticleHistoryEnity = new webasciiBijiArticleHistoryModel({
          ...data,
          c_time: new Date(data.c_time),
          m_time: data.m_time ? new Date(data.m_time) : null,
          author: author._id,
          origin: origin._id
        })

        // 创建用户
        webasciiBijiArticleHistoryModel.create(webasciiBijiArticleHistoryEnity, (err, data) => {
          if (err) return console.log(err)
        })
      } else {
        // 更新
        await webasciiBijiArticleHistoryModel.updateOne(
          {
            id: data.id
          },
          {
            $set: {
              ...data,
              c_time: new Date(data.c_time),
              m_time: data.m_time ? new Date(data.m_time) : null,
              author: author._id,
              origin: origin._id
            }
          },
          {
            'upsert': false
          })
      }
    }
    let article = await webasciiBijiArticleHistoryModel.find({
      origin_id: 437
    }).populate('origin')
    ctx.body = {
      article
    }
  },
  // 处理文章草稿
  async articleDraft(ctx, next) {
    async function getContent() {
      return new Promise((resolve, reject) => {
        connection.query(`select * from biji_content_draft`, [], function (error, results, fields) {
          if (error) {
            throw error
          }
          resolve(results)
        })
      })
    }
    let res = await getContent()
    for (const data of res) {
      let article = await webasciiBijiArticleDraftModel.find({
        id: data.id
      }).populate('user')
      // console.log(article)
      let author = await userModel.findOne({
        id: data.author_id
      })
      if (article.length == 0) {
        // 新增
        let webasciiBijiArticleDraftEnity = new webasciiBijiArticleDraftModel({
          ...data,
          c_time: new Date(data.c_time),
          m_time: data.m_time ? new Date(data.m_time) : null,
          author: author._id
        })

        // 创建用户
        webasciiBijiArticleDraftModel.create(webasciiBijiArticleDraftEnity, (err, data) => {
          if (err) return console.log(err)
        })
      } else {
        // 更新
        await webasciiBijiArticleDraftModel.updateOne(
          {
            id: data.id
          },
          {
            $set: {
              ...data,
              c_time: new Date(data.c_time),
              m_time: data.m_time ? new Date(data.m_time) : null,
              author: author._id
            }
          },
          {
            'upsert': false
          })
      }
    }
    let article = await webasciiBijiArticleDraftModel.find({
      id: 10
    }).populate(
      'author',
      {
        _id: 1,
        id: 1,
        nickname: 1,
        head_img: 1,
      })
    ctx.body = {
      article
    }
  },
  // 处理用户
  async user(ctx, next) {
    async function getUser() {
      return new Promise((resolve, reject) => {
        connection.query(`select * from user`, [], function (error, results, fields) {
          if (error) {
            throw error
          }
          resolve(results)
        })
      })
    }
    let res = await getUser()
    for (const data of res) {
      let userId = await userModel.find({
        id: data.id
      })
      if (userId.length == 0) {
        let userEnity = new userModel(data)

        // 创建用户
        userModel.create(userEnity, (err, data) => {
          if (err) return console.log(err)
        })
      }
    }
    ctx.body = {
      res
    }

  },

  // 分类
  async category(ctx, next) {
    async function getCategory() {
      return new Promise((resolve, reject) => {
        connection.query(`select * from biji_article_category`, [], function (error, results, fields) {
          if (error) {
            throw error
          }
          resolve(results)
        })
      })
    }
    let res = await getCategory()
    for (const data of res) {
      let category = await webasciiBijiCategoryModel.find({
        id: data.id
      })
      // let author = await userModel.findOne({
      //   id: data.author_id
      // })
      if (category.length == 0) {
        console.log(data.is_parent)
        // 如果当前是父级
        if (data.is_parent === 1) {
          // 新增
          let webasciiBijiCategoryEnity = new webasciiBijiCategoryModel({
            ...data,
            c_time: new Date(data.c_time),
            m_time: data.m_time ? new Date(data.m_time) : null,
          })

          // 创建用户
          await webasciiBijiCategoryModel.create(webasciiBijiCategoryEnity, (err, data) => {
            if (err) return console.log(err)
          })
        } else { // 不是父级
          let categoryParent = await webasciiBijiCategoryModel.findOne({
            id: data.parent_id
          })

          // 新增
          let webasciiBijiCategoryEnity = new webasciiBijiCategoryModel({
            ...data,
            c_time: new Date(data.c_time),
            m_time: data.m_time ? new Date(data.m_time) : null,
            parent: categoryParent._id
          })

          // 创建用户
          await webasciiBijiCategoryModel.create(webasciiBijiCategoryEnity, (err, data) => {
            if (err) return console.log(err)
          })
        }

      } else {
        if (data.is_parent === 1) { // 如果当前是父级
          // 更新
          await webasciiBijiCategoryModel.updateOne(
            {
              id: data.id
            },
            {
              $set: {
                ...data,
                c_time: new Date(data.c_time),
                m_time: data.m_time ? new Date(data.m_time) : null,
              }
            },
            {
              'upsert': false
            })
        } else { // 不是父级
          let categoryParent = await webasciiBijiCategoryModel.findOne({
            id: data.parent_id
          })
          // 更新
          await webasciiBijiCategoryModel.updateOne(
            {
              id: data.id
            },
            {
              $set: {
                ...data,
                c_time: new Date(data.c_time),
                m_time: data.m_time ? new Date(data.m_time) : null,
                parent: categoryParent._id
              }
            },
            {
              'upsert': false
            })
        }

      }
    }

    let cRes = await webasciiBijiCategoryModel.find({
      // id: 1
    })
    // console.log(cRes)
    let obj = {

    }
    for (const data of JSON.parse(JSON.stringify(cRes))) {
      if (data.is_parent === 1) {
        // console.log(data)
        obj[data._id.toString()] = {
          ...data,
          children: []
        }
      } else {
        obj[data.parent.toString()].children.push(data)
      }
    }
    let list = []
    for(let item in obj) {
      list.push(obj[item])
    }

    ctx.body = {
      list
    }
  },

  async banner(ctx, next) {
    async function getContent() {
      return new Promise((resolve, reject) => {
        connection.query(`select * from biji_banners`, [], function (error, results, fields) {
          if (error) {
            throw error
          }
          resolve(results)
        })
      })
    }
    let res = await getContent()
    for (const data of res) {
      let banner = await bannerModel.find({
        id: data.id
      })
      if (banner.length == 0) {
        let bannerEnity = new bannerModel(data)

        // 创建用户
        bannerModel.create(bannerEnity, (err, data) => {
          if (err) return console.log(err)
        })
      }
    }
    ctx.body = {}
  },
  async nav(ctx, next) {
    async function getContent() {
      return new Promise((resolve, reject) => {
        connection.query(`select * from biji_nav`, [], function (error, results, fields) {
          if (error) {
            throw error
          }
          resolve(results)
        })
      })
    }
    let res = await getContent()
    for (const data of res) {
      let nav = await navModel.find({
        id: data.id
      })
      if (nav.length == 0) {
        let navEnity = new navModel(data)

        // 创建用户
        navModel.create(navEnity, (err, data) => {
          if (err) return console.log(err)
        })
      }
    }
    ctx.body = {}
  },
}
