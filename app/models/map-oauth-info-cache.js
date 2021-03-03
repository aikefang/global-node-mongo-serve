// 地图小程序授权信息
let mongoose = require("mongoose")
let schema = new mongoose.Schema({
	// 用户ID
	id: String,
	/**
	 * 信息类型
	 * github: github用户信息
	 * qq: qq用户信息
	 * weixin: 微信用户信息
	 */
	type: {
		type: String,
		default: null
	},
	info: {
		type: Object,
		default: null
	},
	cTime: {
		type: Date,
		default: Date.now
	},
	mTime: Date,
})

module.exports = db.model('map_oauth_info_cache', schema)
