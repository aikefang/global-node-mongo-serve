let mongoose = require("mongoose")

let schema = new mongoose.Schema({
	// 缓存名称
	cacheType: String,
	// 创建时间
	updateTime: {
		type: Date,
		default: Date.now
	},
	// 数据
	data: Object,
})

module.exports = db.model('cache_data', schema)
