const userModel = require('../models/user')
const articleModel = require('../models/biji/article')
const logModel = require('../models/log')
const oauthModel = require('../models/oauth-info-cache')
const mapOauthModel = require('../models/map-oauth-info-cache')
const unionidEncryptionModel = require('../models/unionid-encryption')
const common = require('../../lib/common')
const fetch = require('../../lib/fetch')
const humb = require('../../lib/hump')
const moment = require('moment')
const config = require('../../config/config')
const md5 = require('md5')
const WXBizDataCrypt = require('../../lib/WXBizDataCrypt')

module.exports = {
  // 登录
  async login(ctx, next) {
    const account = ctx.request.query.account
    const password = ctx.request.query.password

    if (!account) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => account',
        data: {}
      }
    }
    if (!password) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => password',
        data: {}
      }
    }

    let userInfo = await userModel.findOne({
      account,
    }, {
      _id: 1,
      id: 1,
      nickname: 1,
      account: 1,
      password: 1,
      head_img: 1,
      user_type: 1,
    }).lean()

    if (!userInfo) {
      return ctx.body = {
        status: 200000,
        message: '用户不存在',
        data: {}
      }
    }

    if (userInfo.account !== account || userInfo.password !== password) {
      return ctx.body = {
        status: 200002,
        message: '用户账号或密码错误',
        data: {}
      }
    }

    // 当前接口强制限制用户类型访问
    if (userInfo.user_type !== 2) {
      return ctx.body = {
        status: 200005,
        message: '无权访问',
        data: {}
      }
    }

    ctx.session.logged = true
    // session中存储ldap用户信息
    ctx.session.userInfo = {
      _id: userInfo._id,
      id: userInfo.id,
      account: userInfo.account,
      userType: userInfo.user_type
    }

    ctx.cookies.set('logged', 1, { // 用于前端判断登录状态
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: false
    })

    // console.log({
    //   userInfo: humb(userInfo, {
    //     deleteParam: ['password', 'account']
    //   })
    // })
    // }, 1000)
    ctx.body = {
      status: 200,
      message: '登录成功',
      data: {
        userInfo: humb(userInfo, {
          deleteParam: ['password', 'account']
        })
      }
    }
  },
  // 获取用户有效状态
  async info(ctx) {
    const userInfo = {}

    if (ctx.session.userInfo) {
      const userRes = await userModel.findOne({
        _id: ctx.session.userInfo._id
      })
        .lean()
      if (userRes) {
        userInfo.nickname = userRes.nickname
        userInfo.headImg = userRes.head_img
      }
    }

    ctx.body = {
      status: 200,
      message: ctx.session.logged ? '有效状态' : '无效状态',
      data: {
        userInfo: {
          ...(ctx.session.userInfo || {}),
          ...userInfo
        },
        userStatus: ctx.session.logged || false,
      }
    }
  },
  // 登出
  async logout(ctx) {
    // 重置登录状态
    ctx.session.logged = false
    // 清空登录信息
    ctx.session.userInfo = {}
    ctx.cookies.set('logged', 0, {
      maxAge: 86400 * 1000,
      httpOnly: false
    })
    ctx.body = {
      status: 200,
      message: '登出成功',
      data: {}
    }
  },
  // 注册
  async register(ctx) {
    const account = ctx.request.query.account
    const password = ctx.request.query.password
    const userType = ctx.request.query.userType

    if (!account) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => account',
        data: {}
      }
    }
    if (!password) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => password',
        data: {}
      }
    }
    if (!userType) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => userType',
        data: {}
      }
    }
    const userRes = await userModel.findOne({
      account: account
    })

    if (userRes) {
      return ctx.body = {
        status: 200003,
        message: '当前用户已存在',
        data: {}
      }
    }


    // account: "madashi1122"
    // c_time: "2020-06-03T03:49:25.649Z"
    // github_id: 0
    // password: "83cd7bbbe09efd4a47fbbd64d7c895e6"
    // __v: 0
    // _id: "5ed71dc520ce5658de1d0d47"

    // 新增
    const userEnity = new userModel({
      account: account,
      password: password,
      userType,
    })

    // 创建用户
    const userData = await userModel.create(userEnity)

    ctx.session.logged = true
    // session中存储ldap用户信息
    ctx.session.userInfo = {
      _id: userData._id,
      id: userData.id,
      account: userData.account,
    }

    ctx.cookies.set('logged', 1, { // 用于前端判断登录状态
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: false
    })

    ctx.body = {
      status: 200,
      message: '注册成功',
      data: {
        account: userData.account,
        _id: userData._id,
      }
    }
  },
  // 用户基本信息
  async baseInfo(ctx) {
    const userId = ctx.session.userInfo._id

    const res = await userModel
      .findOne({
        _id: userId
      }, {
        _id: 1,
        nickname: 1,
        head_img: 1,
        c_time: 1,
      })
      .populate('github')
      .populate('qq')
      .lean()

    const github = {
      login: res.github.info.login,
      avatar_url: res.github.info.avatar_url,
      html_url: res.github.info.html_url,
    }

    const qq = {
      nickname: res.qq.info.nickname,
      figureurl_qq: res.qq.info.figureurl_qq,
    }

    const yesterdayViews = await common.cacheData({
      async fn() {
        let beginTime = moment()
          .subtract(1, "days")
          .format("YYYY-MM-DD 00:00:00")
        let endTime = moment()
          .format("YYYY-MM-DD 00:00:00")
        // 昨日浏览量
        const [yesterdayViews] = await logModel.aggregate([
          {
            $match: {
              $and: [
                {
                  'data.articleAuthorId': common.ObjectId(userId),
                },
                {
                  created: {
                    $gte: new Date(beginTime)
                  }
                },
                {
                  created: {
                    $lte: new Date(endTime)
                  }
                }
              ]

            }
          },
          {
            $group: {
              _id: '$data.articleAuthorId',
              count: {
                $sum: 1
              }
            }
          }
        ])
        let count = 0

        if (yesterdayViews && yesterdayViews.count) {
          count = yesterdayViews.count
        }
        return count
      },
      cacheType: `yesterdayViews-${userId}`,
      updateMillisecond: 12 * 60 * 60 * 1000
    })

    const todayViews = await common.cacheData({
      async fn() {
        let beginTime = moment()
          .format("YYYY-MM-DD 00:00:00")
        let endTime = moment()
          .format("YYYY-MM-DD 23:59:59")
        // 昨日浏览量
        const [todayViews] = await logModel.aggregate([
          {
            $match: {
              $and: [
                {
                  'data.articleAuthorId': common.ObjectId(userId),
                },
                {
                  created: {
                    $gte: new Date(beginTime)
                  }
                },
                {
                  created: {
                    $lte: new Date(endTime)
                  }
                }
              ]

            }
          },
          {
            $group: {
              _id: '$data.articleAuthorId',
              count: {
                $sum: 1
              }
            }
          }
        ])

        let count = 0

        if (todayViews && todayViews.count) {
          count = todayViews.count
        }

        return count
      },
      cacheType: `todayView-${userId}`,
      updateMillisecond: 60 * 60 * 1000
    })

    const articleCount = await common.cacheData({
      async fn() {
        // 文章数量
        const articleCount = await articleModel.countDocuments({
          author: userId
        })
        return articleCount
      },
      cacheType: `articleCount-${userId}`,
      updateMillisecond: 60 * 60 * 1000
    })

    const allViews = await common.cacheData({
      async fn() {
        // 获取总浏览量
        const [allViews] = await articleModel.aggregate([
          {
            $match: {
              author: common.ObjectId(userId)
            }
          },
          {
            $group: {
              _id: '$author',
              count: {
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
        let count = 0

        if (allViews && allViews.count) {
          count = allViews.count
        }
        return count
      },
      cacheType: `allViews-${userId}`,
      updateMillisecond: 24 * 60 * 60 * 1000
    })


    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        info: humb({
          ...res,
          github,
          qq,
          head_img: res.head_img + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/100|imageView2/1/w/180/h/180',
          articleCount,
          yesterdayViews,
          todayViews,
          allViews,
        })
      }
    }
  },
  async weixinLogin(ctx) {
    const code = ctx.request.query.code
    const encryptedData = ctx.request.query.encryptedData
    const iv = ctx.request.query.iv
    // 检查非必填
    const checked = common.checkRequired({
      code,
      encryptedData,
      iv,
    }, ctx)
    if (!checked) return
    const {appid, secret} = config.server.xiaochengxu
    // 获取session_key
    const res = await common.request.get('https://api.weixin.qq.com/sns/jscode2session', {
      appid,
      secret,
      grant_type: 'authorization_code',
      js_code: code
    })
    // 获取session_key失败
    if (!res.session_key) {
      return ctx.body = {
        status: 500001,
        message: 'jscode2session 未知错误',
        data: {}
      }
    }
    // 解密获取微信用户信息
    const pc = new WXBizDataCrypt(appid, res.session_key)
    const wxUserInfo = pc.decryptData(decodeURIComponent(encryptedData), decodeURIComponent(iv))

    // 如果获取微信用户信息失败
    if (!wxUserInfo.unionId) {
      return ctx.body = {
        status: 500001,
        message: 'decryptData 未知错误',
        data: {}
      }
    }

    // 新增或者更新 授权数据
    const authData = await oauthModel.findOneAndUpdate(
      {
        id: wxUserInfo.unionId.toString()
      },
      {
        $set: {
          type: 'weixin',
          info: wxUserInfo,
          mTime: new Date()
        }
      },
      {
        new: true,
        upsert: true
      }
    )

    // 查询当前登录用户
    const userData = await userModel.findOne({
      user_type: 3,
      weixin: common.ObjectId(authData._id)
    })

    const updateData = {
      nickname: wxUserInfo.nickName,
      weixin: common.ObjectId(authData._id),
      user_type: 3
    }

    // 当前用户不存在
    if (!userData) {
      updateData.c_time = new Date()
      // 将微信头像地址处理成CDN地址
      const imgData = await fetch(authData.info.avatarUrl, 'suchaxun/user/header/')
      updateData.head_img = '//static.webascii.cn/' + imgData.key
    }

    // 新增或者更新 用户
    const userInfo = await userModel.findOneAndUpdate(
      {
        weixin: authData._id
      },
      {
        $set: updateData
      },
      {
        new: true,
        upsert: true
      }
    )
      .populate('weixin')
      .lean()

    const user = {}
    user._id = userInfo._id
    user.nickname = userInfo.nickname
    user.headImg = userInfo.head_img

    ctx.body = {
      status: 200,
      message: 'ok',
      data: {
        user
      }
    }
  },
  // 获取微信用户信息
  async getWeixinUser(ctx) {
    const id = ctx.request.query.id
    // 检查非必填
    const checked = common.checkRequired({
      id,
    }, ctx)
    if (!checked) return

    const userRes = await userModel.findOne({
      _id: id
    }).lean()
    // 用户不存在
    if (!userRes) {
      return ctx.body = {
        status: 200000,
        message: '用户不存在',
        data: {}
      }
    }
    ctx.body = {
      status: 200,
      message: 'ok',
      data: {
        user: {
          _id: userRes._id,
          nickname: userRes.nickname,
          headImg: userRes.head_img,
        }
      }
    }
  },
  async updateAvatar(ctx) {

  },


  // 地图小程序登录接口（随时可删除）
  async mapWeixinLogin(ctx) {
    const code = ctx.request.query.code
    const encryptedData = ctx.request.query.encryptedData
    const iv = ctx.request.query.iv
    // 检查非必填
    const checked = common.checkRequired({
      code,
      encryptedData,
      iv,
    }, ctx)
    if (!checked) return
    const {appid, secret} = config.server.mapXiaochengxu
    // 获取session_key
    const res = await common.request.get('https://api.weixin.qq.com/sns/jscode2session', {
      appid,
      secret,
      grant_type: 'authorization_code',
      js_code: code
    })
    // 获取session_key失败
    if (!res.session_key) {
      return ctx.body = {
        status: 500001,
        message: 'jscode2session 未知错误',
        data: {}
      }
    }
    // 解密获取微信用户信息
    const pc = new WXBizDataCrypt(appid, res.session_key)
    const wxUserInfo = pc.decryptData(decodeURIComponent(encryptedData), decodeURIComponent(iv))
    // 如果获取微信用户信息失败
    // if (!wxUserInfo.unionId) {
    //   return ctx.body = {
    //     status: 500001,
    //     message: 'decryptData 未知错误',
    //     data: {}
    //   }
    // }

    if (wxUserInfo.avatarUrl) {
      // updateData.c_time = new Date()
      // 将微信头像地址处理成CDN地址
      const imgData = await fetch(wxUserInfo.avatarUrl, 'mapXCX/user/header/')
      wxUserInfo.avatarUrl = '//static.webascii.cn/' + imgData.key
    }
    // console.log(wxUserInfo)

    // 新增或者更新 授权数据
    const authData = await mapOauthModel.findOneAndUpdate(
      {
        id: wxUserInfo.openId.toString()
      },
      {
        $set: {
          type: 'weixin',
          info: wxUserInfo,
          mTime: new Date()
        }
      },
      {
        new: true,
        upsert: true
      }
    )
    // 查询当前登录用户
    const userData = await mapOauthModel.findOne({
      _id: common.ObjectId(authData._id)
    })
    ctx.body = {
      status: 200,
      message: 'ok',
      data: {
        userInfo: {
          cTime: userData.cTime,
          _id: userData._id,
          avatarUrl: userData.info.avatarUrl,
          gender: userData.info.gender,
          nickName: userData.info.nickName,
        }
      }
    }
  },
  // 获取地图小程序用户信息(随时可删)
  async getMapWeixinUser(ctx) {
    const id = ctx.request.query.id
    // 检查非必填
    const checked = common.checkRequired({
      id,
    }, ctx)
    if (!checked) return

    const userRes = await mapOauthModel.findOne({
      _id: id
    }).lean()
    // 用户不存在
    if (!userRes) {
      return ctx.body = {
        status: 200000,
        message: '用户不存在',
        data: {}
      }
    }
    ctx.body = {
      status: 200,
      message: 'ok',
      data: {
        userInfo: {
          cTime: userRes.cTime,
          _id: userRes._id,
          avatarUrl: userRes.info.avatarUrl,
          gender: userRes.info.gender,
          nickName: userRes.info.nickName,
        }
      }
    }
  },
}
