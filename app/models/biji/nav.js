let mongoose = require("mongoose")

let schema = new mongoose.Schema({
	// ID
	id: Number,
	// 文章类型名称
	title: String,
	// 是否启用 默认1  0：不启用，1：启用
	is_enable: {
		type: Number,
		default: 1
	},
	// 排序
	sort_index: Number,
	// 跳转链接
	url_link: String
})

module.exports = db.model('webascii_biji_nav', schema)
