// 地图小程序授权信息
let mongoose = require("mongoose")
let schema = new mongoose.Schema({
  // 用户ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // 经纬度
  lat: Number,
  lng: Number,
  // 地址
  address: String,
  /**
   * 类型
   * 1：乘客
   * 2：司机
   */
  type: Number,
  cTime: {
    type: Date,
    default: Date.now
  },
  mTime: Date,
  userInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'map_oauth_info_cache'
  },
})

module.exports = db.model('map_record', schema)
