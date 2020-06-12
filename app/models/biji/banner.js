let mongoose = require("mongoose")

let schema = new mongoose.Schema({
	// ID
	id: Number,
	// 图片地址
	url_path: String,
	// 是否启用 默认1  0：不启用，1：启用
	is_enable: {
		type: Number,
		default: 1
	},
	// 跳转路径
	url: String,
	// 描述
	banner_describe: String,
	// 排序
	sort_index: Number,
	// 创建时间
	c_time: {
		type: Date,
		default: Date.now
	},
	// 更新时间
	m_time: {
		type: Date,
		default: null
	}
})

module.exports = db.model('webascii_biji_banner', schema)
