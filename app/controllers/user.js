const userModel = require('../models/user.server.model')
const humb = require('../../lib/hump')
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

    ctx.session.logged = true
    // session中存储ldap用户信息
    ctx.session.userInfo = {
      _id: userInfo._id,
      id: userInfo.id,
      account: userInfo.account,
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
    // console.log(ctx.request)
    ctx.body = {
      status: 200,
      message: ctx.session.logged ? '有效状态' : '无效状态',
      data: {
        userInfo: ctx.session.userInfo || {},
        userStatus: ctx.session.logged || false
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
  }
}
