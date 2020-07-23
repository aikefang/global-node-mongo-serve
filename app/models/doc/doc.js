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
	// seo关键词
	seo: {
		type: String,
		required: true
	},
	// 内容
	content: String,
	// 预览图
	// imageView: String,
	// 浏览量
	views: {
		type: Number,
		default: 0
	},
	// 作者
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
		required: true,
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
	// 子集
	// children: Array,
	// // 主分类
	// category: {
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: 'doc_category',
	// 	required: true
	// },
	/**
	 * 是否为父级
	 * true：父级
	 * false：子集(子集可能会有子集)
	 */
	parent: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'doc',
		// required: true
	}
})

module.exports = db.model("doc", schema)
