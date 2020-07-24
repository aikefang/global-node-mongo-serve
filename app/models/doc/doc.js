let mongoose = require("mongoose")
/**
 * 说明
 * @type {mongoose.Schema}
 * 父级 parent = null
 * 子集 parent = 父级._id
 * seo关键字 用户url路由
 */
let schema = new mongoose.Schema({
	// 标题
	title: String,
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
	imageView: String,
	// 浏览量
	views: {
		type: Number,
		default: 0
	},
	author: {
		type: Object
	},
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
		type: Array,
		default: []
	},
})

module.exports = db.model("doc", schema)
