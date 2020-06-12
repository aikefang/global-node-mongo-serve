// const gitlabProjectData = require('../datas/gitlabProject')
const userModel = require('../models/user')
const webasciiBijiArticleModel = require('../models/biji/article')
const webasciiBijiArticleDraftModel = require('../models/biji/article-draft')
const webasciiBijiArticleHistoryModel = require('../models/biji/article-history')
const webasciiBijiCategoryModel = require('../models/biji/category')
const bannerModel = require('../models/biji/banner')
const navModel = require('../models/biji/nav')

const bookModel = require('../models/book/book')


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

      let level1 = await webasciiBijiCategoryModel.findOne({
        id: data.article_classify_level_first
      })
      let level2 = await webasciiBijiCategoryModel.findOne({
        id: data.article_classify_level_second
      })


      if (article.length == 0) {
        // 新增
        let webasciiBijiArticleEnity = new webasciiBijiArticleModel({
          ...data,
          c_time: new Date(data.c_time),
          m_time: data.m_time ? new Date(data.m_time) : null,
          author: author._id,
          levelFirst: level1._id,
          levelSecond: level2._id,
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
              author: author._id,
              levelFirst: level1,
              levelSecond: level2,
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
      let originObj = {}
      if (origin && origin._id) {
        originObj.origin = origin._id
      }
      let level1 = await webasciiBijiCategoryModel.findOne({
        id: data.article_classify_level_first
      })
      let level2 = await webasciiBijiCategoryModel.findOne({
        id: data.article_classify_level_second
      })
      // console.log(origin)
      if (article.length == 0) {
        // 新增
        let webasciiBijiArticleHistoryEnity = new webasciiBijiArticleHistoryModel({
          ...data,
          c_time: new Date(data.c_time),
          m_time: data.m_time ? new Date(data.m_time) : null,
          author: author._id,
          // origin: origin._id,
          ...originObj,
          levelFirst: level1._id,
          levelSecond: level2._id,
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
              // origin: origin._id,
              ...originObj,
              levelFirst: level1._id,
              levelSecond: level2._id,
            }
          },
          {
            'upsert': false
          })
      }
    }
    let article = await webasciiBijiArticleHistoryModel.find({
      origin_id: 437
    })
      .populate('origin')
      .populate('author')
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
      let level1 = await webasciiBijiCategoryModel.findOne({
        id: data.article_classify_level_first
      })
      let level2 = await webasciiBijiCategoryModel.findOne({
        id: data.article_classify_level_second
      })
      if (article.length == 0) {
        let obj = {
          ...data,
          c_time: new Date(data.c_time),
          m_time: data.m_time ? new Date(data.m_time) : null,
          author: author._id,
          // levelFirst: level1._id,
          // levelSecond: level2._id,
        }
        if (level1 && level1._id) {
          obj.levelFirst = level1._id
        }
        if (level2 && level2._id) {
          obj.levelFirst = level2._id
        }
        // 新增
        let webasciiBijiArticleDraftEnity = new webasciiBijiArticleDraftModel(obj)

        // 创建用户
        webasciiBijiArticleDraftModel.create(webasciiBijiArticleDraftEnity, (err, data) => {
          if (err) return console.log(err)
        })
      } else {
        let obj = {
          ...data,
          c_time: new Date(data.c_time),
          m_time: data.m_time ? new Date(data.m_time) : null,
          author: author._id,
          // levelFirst: level1._id,
          // levelSecond: level2._id,
        }
        if (level1 && level1._id) {
          obj.levelFirst = level1._id
        }
        if (level2 && level2._id) {
          obj.levelFirst = level2._id
        }
        // 更新
        await webasciiBijiArticleDraftModel.updateOne(
          {
            id: data.id
          },
          {
            $set: obj
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

      const ca = [
        {
          "title": "前端",
          seo: 'web'
        },
        {
          "title": "后端",
          seo: 'dev'
        },
        {
          "title": "数据库",
          seo: 'database'
        },
        {
          "title": "服务器配置",
          seo: 'server'
        },
        {
          "title": "MAC 教程",
          seo: 'mac'
        },
        {
          "title": "开发工具",
          seo: 'dev_tools'
        },
        {
          "title": "原生JavaScript",
          seo: 'javascript'
        },
        {
          "title": "Vue",
          seo: 'vue'
        },
        {
          "title": "jQuery",
          seo: 'jquery'
        },
        {
          "title": "AngularJS",
          seo: 'angular'
        },
        {
          "title": "Node.js",
          seo: 'nodejs'
        },
        {
          "title": "java",
          seo: 'java'
        },
        {
          "title": "PHP",
          seo: 'php'
        },
        {
          "title": "Python",
          seo: 'python'
        },
        {
          "title": "正则表达式",
          seo: 'regular'
        },
        {
          "title": "Mysql",
          seo: 'mysql'
        },
        {
          "title": "centOS",
          seo: 'centos'
        },
        {
          "title": "linux",
          seo: 'linux'
        },
        {
          "title": "终端使用",
          seo: 'terminal'
        },
        {
          "title": "MAC工作环境安装",
          seo: 'mac_environment'
        },
        {
          "title": "HTML/CSS",
          seo: 'html_css'
        },
        {
          "title": "AppCan",
          seo: 'appcan'
        },
        {
          "title": "Sql Server",
          seo: 'sql_server'
        },
        {
          "title": "sublime",
          seo: 'sublime'
        },
        {
          "title": "Git",
          seo: 'git'
        },
        {
          "title": "WebStorm",
          seo: 'webstorm'
        },
        {
          "title": "其他",
          seo: 'other'
        },
        {
          "title": "apache",
          seo: 'apache'
        },
        {
          "title": "Nginx",
          seo: 'nginx'
        },
        {
          "title": "MongoDB",
          seo: 'mongodb'
        },
        {
          "title": "Nuxt.js",
          seo: 'nuxtjs'
        },
        {
          "title": "前端架构",
          seo: 'web_advanced'
        },
        {
          "title": "webpack3",
          seo: 'webpack3'
        },
        {
          "title": "webpack4",
          seo: 'webpack4'
        },
        {
          "title": "electron客户端",
          seo: 'electron'
        },
        {
          "title": "Jenkins",
          seo: 'jenkins'
        },
        {
          "title": "小程序",
          seo: 'mini_programs'
        },
        {
          "title": "Charles",
          seo: 'charles'
        },
        {
          "title": "Flutter",
          seo: 'flutter'
        },
        {
          "title": "Service Worker",
          seo: 'service_worker'
        },
        {
          "title": "Dart",
          seo: 'dart'
        }

      ]



      // let author = await userModel.findOne({
      //   id: data.author_id
      // })
      if (category.length == 0) {
        // console.log(data.is_parent)
        // 如果当前是父级
        if (data.is_parent === 1) {
          // 新增
          let webasciiBijiCategoryEnity = new webasciiBijiCategoryModel({
            ...data,
            c_time: new Date(data.c_time),
            m_time: data.m_time ? new Date(data.m_time) : null,
            seo: ca.find(caData => caData.title === data.title).seo
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
            parent: categoryParent._id,
            seo: ca.find(caData => caData.title === data.title).seo
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
                seo: ca.find(caData => caData.title === data.title).seo
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
                parent: categoryParent._id.toString(),
                seo: ca.find(caData => caData.title === data.title).seo
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

  async book(ctx) {
    async function getContent() {
      return new Promise((resolve, reject) => {
        connection.query(`select * from book_list`, [], function (error, results, fields) {
          if (error) {
            throw error
          }
          resolve(results)
        })
      })
    }
    let res = await getContent()
    for (const data of res) {
      let book = await bookModel.find({
        id: data.id
      })
      if (book.length === 0) {
        let bookEnity = new bookModel({
          // ID
          id: data.id,
          // 书名
          bookName: data.book_name,
          // 百度云盘地址
          baiduCloudDiskUrl: data.baidu_cloud_disk_url,
          // 预览图
          bookImg: data.book_img,
          // 是否启用 默认1  0：不启用，1：启用
          isEnable: 1,
          // 创建时间
          cTime: new Date(data.c_time),
          // 更新时间
          // mTime: Date,
          // 下载量
          downloads: data.downloads,
          // 贡献者名称
          contributorName: data.contributor_name,
          // 浏览量
          views: data.book_view
          // data
        })
        // 创建
        bookModel.create(bookEnity, (err, data) => {
          if (err) return console.log(err)
        })
      }
    }
    ctx.body = {}
  }
}
