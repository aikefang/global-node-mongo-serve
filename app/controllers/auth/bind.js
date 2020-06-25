// const navModel = require('../../models/biji/nav')
// const humb = require('../../../lib/hump')

const $axios = require('axios')
const config = require('../../../config/config')


const oauthModel = require('../../models/oauth-info-cache')
const userModel = require('../../models/user')
const humb = require('../../../lib/hump')

module.exports = {
  async githubOldUser(ctx, next) {
    const id = ctx.request.body.id
    const account = ctx.request.body.account
    const password = ctx.request.body.password
    if (!id) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => id',
        data: {}
      }
    }
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
    if (!global.custom.mongoose.Types.ObjectId.isValid(id)) {
      return ctx.body = {
        status: 500001,
        message: '未知错误',
        data: {
          id
        }
      }
    }
    const oauthRes = await oauthModel.findOne({
      _id: id
    })
    if (!oauthRes) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }

    const userRes = await userModel.findOne({
      account
    }).lean()
    if (!userRes) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }
    if (userRes.password !== password) {
      return ctx.body = {
        status: 200002,
        message: '密码错误',
        data: {}
      }
    }
    // 当前接口强制限制用户类型访问
    if (userRes.user_type !== 2) {
      return ctx.body = {
        status: 200005,
        message: '无权访问',
        data: {}
      }
    }

    const repeatBind = await userModel.findOne({
      info: oauthRes._id
    })
    // 当前第三方账号已经被绑定
    if (repeatBind) {
      return ctx.body = {
        status: 200003,
        message: '当前第三方账号已经被绑定',
        data: {}
      }
    }

    const userUpdateRes = await userModel.findOneAndUpdate(
      {
        _id: userRes._id
      },
      {
        $set: {
          info: oauthRes._id
        }
      },
      {
        'upsert': false
      })

    ctx.session.logged = true
    // session中存储ldap用户信息
    ctx.session.userInfo = {
      _id: userRes._id,
      id: userRes.id,
      account: userRes.account,
      userType: userRes.user_type
    }

    ctx.cookies.set('logged', 1, { // 用于前端判断登录状态
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: false
    })

    ctx.body = {
      status: 200,
      message: '绑定旧账号成功',
      data: {
        userInfo: humb(userRes, {
          deleteParam: ['password', 'account']
        })
      }
    }
  },
  async githubNewUser(ctx, next) {
    const id = ctx.request.body.id
    const account = ctx.request.body.account
    const password = ctx.request.body.password
    if (!id) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => id',
        data: {}
      }
    }
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
    if (!global.custom.mongoose.Types.ObjectId.isValid(id)) {
      return ctx.body = {
        status: 500001,
        message: '未知错误',
        data: {
          id
        }
      }
    }
    const oauthRes = await oauthModel.findOne({
      _id: id
    })
    if (!oauthRes) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }

    const userRes = await userModel.findOne({
      account
    })
    if (userRes) {
      return ctx.body = {
        status: 200004,
        message: '账号已存在',
        data: {}
      }
    }

    // 新增
    const userEnity = new userModel({
      account: account,
      password: password,
      user_type: 2,
      info: oauthRes._id
    })
    // 创建用户
    const userData = await userModel.create(userEnity)

    ctx.session.logged = true
    // session中存储ldap用户信息
    ctx.session.userInfo = {
      _id: userData._id,
      id: userData.id,
      account: userData.account,
      userType: userData.user_type
    }

    ctx.cookies.set('logged', 1, { // 用于前端判断登录状态
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: false
    })

    ctx.body = {
      status: 200,
      message: '绑定新账号成功',
      data: {
        userInfo: humb(userData.toObject(), {
          deleteParam: ['password', 'account']
        })
      }
    }
  },
  async gitlabAutoLogin(ctx) {
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

    const res = await userModel.findOne({
      github: id
    }).lean()

    if (!res) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }
    ctx.session.logged = true
    // session中存储ldap用户信息
    ctx.session.userInfo = {
      _id: res._id,
      id: res.id,
      account: res.account,
      userType: res.user_type
    }

    ctx.cookies.set('logged', 1, { // 用于前端判断登录状态
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: false
    })
    // console.log(ctx.session)

    ctx.body = {
      status: 200,
      message: '自动登录成功',
      data: {
        userInfo: humb(res, {
          deleteParam: ['password', 'account']
        })
      }
    }
  },
  async qqOldUser(ctx) {
    const id = ctx.request.body.id
    const account = ctx.request.body.account
    const password = ctx.request.body.password
    if (!id) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => id',
        data: {}
      }
    }
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
    if (!global.custom.mongoose.Types.ObjectId.isValid(id)) {
      return ctx.body = {
        status: 500001,
        message: '未知错误',
        data: {
          id
        }
      }
    }
    const oauthRes = await oauthModel.findOne({
      _id: id
    })
    if (!oauthRes) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }

    const userRes = await userModel.findOne({
      account
    }).lean()
    if (!userRes) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }
    if (userRes.password !== password) {
      return ctx.body = {
        status: 200002,
        message: '密码错误',
        data: {}
      }
    }
    // 当前接口强制限制用户类型访问
    if (userRes.user_type !== 2) {
      return ctx.body = {
        status: 200005,
        message: '无权访问',
        data: {}
      }
    }

    const repeatBind = await userModel.findOne({
      info: oauthRes._id
    })
    // 当前第三方账号已经被绑定
    if (repeatBind) {
      return ctx.body = {
        status: 200003,
        message: '当前第三方账号已经被绑定',
        data: {}
      }
    }

    const userUpdateRes = await userModel.findOneAndUpdate(
      {
        _id: userRes._id
      },
      {
        $set: {
          info: oauthRes._id
        }
      },
      {
        'upsert': false
      })

    ctx.session.logged = true
    // session中存储ldap用户信息
    ctx.session.userInfo = {
      _id: userRes._id,
      id: userRes.id,
      account: userRes.account,
      userType: userRes.user_type
    }

    ctx.cookies.set('logged', 1, { // 用于前端判断登录状态
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: false
    })

    ctx.body = {
      status: 200,
      message: '绑定旧账号成功',
      data: {
        userInfo: humb(userRes, {
          deleteParam: ['password', 'account']
        })
      }
    }
  },
  async qqNewUser(ctx) {
    const id = ctx.request.body.id
    const account = ctx.request.body.account
    const password = ctx.request.body.password
    if (!id) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => id',
        data: {}
      }
    }
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
    if (!global.custom.mongoose.Types.ObjectId.isValid(id)) {
      return ctx.body = {
        status: 500001,
        message: '未知错误',
        data: {
          id
        }
      }
    }
    const oauthRes = await oauthModel.findOne({
      _id: id
    })
    if (!oauthRes) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }

    const userRes = await userModel.findOne({
      account
    })
    if (userRes) {
      return ctx.body = {
        status: 200004,
        message: '账号已存在',
        data: {}
      }
    }

    const repeatBind = await userModel.findOne({
      info: oauthRes._id
    })
    // 当前第三方账号已经被绑定
    if (repeatBind) {
      return ctx.body = {
        status: 200003,
        message: '当前第三方账号已经被绑定',
        data: {}
      }
    }

    // 新增
    const userEnity = new userModel({
      account: account,
      password: password,
      user_type: 2,
      info: oauthRes._id
    })
    // 创建用户
    const userData = await userModel.create(userEnity)

    ctx.session.logged = true
    // session中存储ldap用户信息
    ctx.session.userInfo = {
      _id: userData._id,
      id: userData.id,
      account: userData.account,
      userType: userData.user_type
    }

    ctx.cookies.set('logged', 1, { // 用于前端判断登录状态
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: false
    })

    ctx.body = {
      status: 200,
      message: '绑定新账号成功',
      data: {
        userInfo: humb(userData.toObject(), {
          deleteParam: ['password', 'account']
        })
      }
    }
  },
  async qqAutoLogin(ctx) {
    console.log(1111, ctx.request.body.id)
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

    const res = await userModel.findOne({
      qq: id
    }).lean()
    console.log(222, res)

    if (!res) {
      return ctx.body = {
        status: 200004,
        message: '数据不存在',
        data: {}
      }
    }
    ctx.session.logged = true
    // session中存储ldap用户信息
    ctx.session.userInfo = {
      _id: res._id,
      id: res.id,
      account: res.account,
      userType: res.user_type
    }

    ctx.cookies.set('logged', 1, { // 用于前端判断登录状态
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: false
    })
    // console.log(ctx.session)

    ctx.body = {
      status: 200,
      message: '自动登录成功',
      data: {
        userInfo: humb(res, {
          deleteParam: ['password', 'account']
        })
      }
    }
  }
}

// class Controllers {
//
// }
// module.exports = new Controllers()

