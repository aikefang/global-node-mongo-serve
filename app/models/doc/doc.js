let mongoose = require("mongoose")
let schema = new mongoose.Schema({
	// 标题
	title: String,
	// 分类
	category: String,
	// git文件路径
	path: {
		type: String,
		required: true
	},
	// 内容
	content: String,
	markdown: {
		type: String,
		required: true
	},
	// 预览图
	// imageView: String,
	// 浏览量
	views: {
		type: Number,
		default: 0
	},
	// author: {
	// 	type: Object
	// },
	/**
	 * 是否可用
	 * 1:是否可用
	 * 0:不可用
	 */
	isEnable: {
		type: Number,
		default: 1
	},
	// 创建时间
	cTime: {
		type: Date,
		default: Date.now
	},
	// 更新时间
	mTime: {
		type: Date,
		default: null
	},
	// 标签
	tags: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'tag',
	}],
	commit: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'doc_commit',
		default: null
	},
})

module.exports = db.model("doc", schema)
