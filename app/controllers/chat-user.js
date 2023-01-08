const userModel = require('../models/chat-user')
const common = require('../../lib/common')
const fetch = require('../../lib/fetch')
const humb = require('../../lib/hump')
const moment = require('moment')
const config = require('../../config/config')
const md5 = require('md5')

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
  // 注册
  async register(ctx) {
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
    // 新增
    const userEnity = new userModel({
      account: account,
      password: password,
    })

    // 创建用户
    const userData = await userModel.create(userEnity)
    ctx.body = {
      status: 200,
      message: '注册成功',
      data: {
        account: userData.account,
        _id: userData._id,
      }
    }
  },
}
