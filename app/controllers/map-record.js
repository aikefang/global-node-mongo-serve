const userModel = require('../models/user')
const mapRecord = require('../models/map-record')
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

module.exports = {
  async list(ctx) {
    const userId = ctx.request.query.userId
    // 检查非必填
    const checked = common.checkRequired({
      userId,
      // type,
    }, ctx)
    if (!checked) return
    const list = await mapRecord.find({
      userId
    }).populate('userInfo', {
      'info.nickName': 1,
      'info.gender': 1,
      'info.avatarUrl': 1
    })
    ctx.body = {
      status: 200,
      message: 'ok',
      data: {
        list
      }
    }
  },
  async insert(ctx) {
    const {lat, lng, address, userId, type} = ctx.request.query
    // 检查非必填
    const checked = common.checkRequired({
      userId,
      lat,
      lng,
      type,
      address
    }, ctx)
    if (!checked) return
    if (!global.custom.mongoose.Types.ObjectId.isValid(userId)) {
      return ctx.body = {
        status: 500001,
        message: '未知错误',
        data: {
          userId
        }
      }
    }
    // 验证
    const findRes = await mapRecord.findOne({
      userId,
      type
    })

    // 如果当前地址存在
    if (findRes) { // 更新
      const res = await mapRecord.findOneAndUpdate({
          userId,
          type
        },
        {
          $set: {
            userId,
            lat,
            lng,
            address,
            type,
            mTime: new Date(),
            userInfo: userId,
            location: [lng, lat]
          }
        },
        {
          'upsert': false
        })
      ctx.body = {
        status: 200,
        message: 'ok',
        data: res
      }
    } else { // 新建
      const mapRecordEnity = await new mapRecord({
        userId,
        lat,
        lng,
        address,
        type,
        userInfo: userId,
        location: [lng, lat]
      })
      // 创建历史记录
      const res = await mapRecord.create(mapRecordEnity)
      ctx.body = {
        status: 200,
        message: 'ok',
        data: res
      }
    }
  },
  // 附近的地点
  async nearbyLocation(ctx) {
    const {lat, lng, userType, distance = 5000} = ctx.request.query
    // 检查非必填
    const checked = common.checkRequired({
      lat,
      lng,
      userType,
    }, ctx)
    if (!checked) return

    const list = await mapRecord.find({
      location: {
        $geoWithin: {$centerSphere: [[Number(lng), Number(lat)], distance / 6378100]}
      },
      type: Number(userType) === 2 ? 1 : 2
    }, {
      lat: 1,
      lng: 1,
      address: 1,
      type: 1,
    })
      .limit(20)
      .populate('userInfo', {
        'info.nickName': 1,
        'info.gender': 1,
        'info.avatarUrl': 1
      })

    ctx.body = {
      status: 200,
      message: 'ok',
      data: {
        list
      }
    }

  }
}
