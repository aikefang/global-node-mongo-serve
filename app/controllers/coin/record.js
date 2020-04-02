const recordModel = require('../../models/coin/record.server.model')
// const humb = require('../../lib/hump')
module.exports = {
  // 买入记录
  async createIn(ctx) {
    const {
      currency,
      // inCount,
      // inPrice,
      inTime
    } = ctx.request.body
    const inCount = parseFloat(ctx.request.body.inCount)
    const inPrice = parseFloat(ctx.request.body.inPrice)
    // 检查参数
    if (currency === undefined) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => currency',
        data: {}
      }
    }
    if (currency !== 'ETC') {
      return ctx.body = {
        status: 500003,
        message: '参数错误',
        data: {
          currency: ['ETC']
        }
      }
    }
    if (inCount === undefined) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => inCount',
        data: {}
      }
    }
    if (inPrice === undefined) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => inPrice',
        data: {}
      }
    }
    if (inTime === undefined) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => inTime',
        data: {}
      }
    }
    const recordEnity = new recordModel({
      type: 'in',
      currency,
      inCount,
      inPrice,
      inTime,
    })
    const res = await recordModel.create(recordEnity).catch(e => console.log(e))
    ctx.body = {
      status: 200,
      message: '新增记录成功',
      data: {
        info: res
      }
    }
  },
  // 卖出记录
  async createOut(ctx) {
    const {
      id,
      currency,
      // outCount,
      // outPrice,
      outTime
    } = ctx.request.body
    const outCount = parseFloat(ctx.request.body.outCount)
    const outPrice = parseFloat(ctx.request.body.outPrice)
    // console.log(findParent)
    // ctx.body = {
    //   findParent
    // }
    // return
    // 检查参数
    if (id === undefined) {
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
    if (currency === undefined) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => currency',
        data: {}
      }
    }
    if (currency !== 'ETC') {
      return ctx.body = {
        status: 500003,
        message: '参数错误',
        data: {
          currency: ['ETC']
        }
      }
    }
    if (outCount === undefined) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => outCount',
        data: {}
      }
    }
    if (outPrice === undefined) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => outPrice',
        data: {}
      }
    }
    if (outTime === undefined) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => outTime',
        data: {}
      }
    }
    const findParent = await recordModel.findOne({
      _id: id
    })
    // const findChild = await recordModel.find({
    //   parentId: id
    // })
    // console.log(id)
    const soldCount = await recordModel.aggregate([
      {
        $match: {
          parentId: new global.custom.mongoose.Types.ObjectId(id)
        },
      },
      {
        $project: {
          _id: 0,
          outCount: 1,
          type: 1,
          outPrice: {
            $multiply: ['$outCount', '$outPrice']
          }
        },
      },
      {
        $group: {
          _id: '$type',
          outCount: {
            '$sum': '$outCount'
          },
          outPrice: {
            '$sum': '$outPrice'
          }
        },
      },
    ])
    if (soldCount.length > 0) { // 有结果
      // 如果已售出数量 + 准备售出数量 > 总数量
      if (soldCount[0].outCount + outCount > findParent.inCount) {
        return ctx.body = {
          status: 300001,
          message: '数量超出限制',
          data: {
            inCount: findParent.inCount,
            soldCount: soldCount[0].outCount,
            outCount,
          }
        }
      }
    } else { // 无结果
      // 准备售出数量 > 总数量
      if ( outCount > findParent.inCount) {
        return ctx.body = {
          status: 300001,
          message: '数量超出限制',
          data: {
            inCount: findParent.inCount,
            soldCount: 0,
            outCount,
          }
        }
      }
    }
    // ctx.body = {
    //   findParent,
    //   // findChild,
    //   count: findParent.inCount,
    //   soldCount,
    // }
    // return
    const recordEnity = new recordModel({
      type: 'out',
      parentId: id,
      currency,
      outCount,
      outPrice,
      outTime,
    })
    const res = await recordModel.create(recordEnity).catch(e => console.log(e))
    ctx.body = {
      status: 200,
      message: '新增记录成功',
      data: {
        info: res
      }
    }
  },
  // 列表
  async list(ctx) {
    const size = ctx.request.body.size || 10
    const page = ctx.request.body.page || 1
    const {
      currency
    } = ctx.request.body
    if (currency === undefined) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => currency',
        data: {}
      }
    }
    if (currency !== 'ETC') {
      return ctx.body = {
        status: 500003,
        message: '参数错误',
        data: {
          currency: ['ETC']
        }
      }
    }
    const recordList = await recordModel.find({
      currency,
      type: 'in',
    })
      .skip((page - 1) * size)
      .limit(size)
      // .sort(sort)
    ctx.body = {
      recordList
    }
  },
  async update(ctx) {

  },

  // async login(ctx, next) {
  //   const account = ctx.request.query.account
  //   const password = ctx.request.query.password
  //
  //   if (!account) {
  //     return ctx.body = {
  //       status: 500002,
  //       message: '缺少参数 => account',
  //       data: {}
  //     }
  //   }
  //   if (!password) {
  //     return ctx.body = {
  //       status: 500002,
  //       message: '缺少参数 => password',
  //       data: {}
  //     }
  //   }
  //
  //   let userInfo = await userModel.findOne({
  //       account,
  //     }, {
  //       _id: 1,
  //       id: 1,
  //       nickname: 1,
  //       account: 1,
  //       password: 1,
  //       head_img: 1,
  //       user_type: 1,
  //     }).lean()
  //
  //   if (!userInfo) {
  //     return ctx.body = {
  //       status: 200000,
  //       message: '用户不存在',
  //       data: {}
  //     }
  //   }
  //
  //   if (userInfo.account !== account || userInfo.password !== password) {
  //     return ctx.body = {
  //       status: 200002,
  //       message: '用户账号或密码错误',
  //       data: {}
  //     }
  //   }
  //
  //   ctx.session.logged = true
  //   // session中存储ldap用户信息
  //   ctx.session.userInfo = {
  //     _id: userInfo._id,
  //     id: userInfo.id,
  //     account: userInfo.account,
  //   }
  //
  //   ctx.cookies.set('logged', 1, { // 用于前端判断登录状态
  //     maxAge: 1000 * 60 * 60 * 24 * 30,
  //     httpOnly: false
  //   })
  //
  //   // console.log({
  //   //   userInfo: humb(userInfo, {
  //   //     deleteParam: ['password', 'account']
  //   //   })
  //   // })
  //   // }, 1000)
  //   ctx.body = {
  //     status: 200,
  //     message: '登录成功',
  //     data: {
  //       userInfo: humb(userInfo, {
  //         deleteParam: ['password', 'account']
  //       })
  //     }
  //   }
  // },
  // async info(ctx) {
  //   console.log(ctx.request)
  //   ctx.body = {
  //     status: 200,
  //     message: ctx.session.logged ? '有效状态' : '无效状态',
  //     data: {
  //       userInfo: ctx.session.userInfo || {},
  //       userStatus: ctx.session.logged || false
  //     }
  //   }
  // },
  // // 登出
  // logout: async (ctx) => {
  //   // 重置登录状态
  //   ctx.session.logged = false
  //   // 清空登录信息
  //   ctx.session.userInfo = {}
  //   ctx.cookies.set('logged', 0, {
  //     maxAge: 86400 * 1000,
  //     httpOnly: false
  //   })
  //   ctx.body = {
  //     status: 200,
  //     message: '登出成功',
  //     data: {}
  //   }
  // },
}
