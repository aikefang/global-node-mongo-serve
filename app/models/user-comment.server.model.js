let mongoose = require("mongoose")

let schema = new mongoose.Schema({
	// 关联的文章
	article: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'webascii_biji_article',
		default: null
	},
	// 关联的作者
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	},
	replyAuthor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	},
	// 父级
	parent: {
		type: String,
		default: null
	},
	// 引用（当前的回复回复的那一条内容）
	quote: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user-comment',
		default: null
	},
	// 创建时间
	cTime: {
		type: Date,
		default: Date.now
	},
	/**
	 * 留言类型
	 * 1：文章反馈
	 * 2：全局反馈
	 * 3：自定义反馈
	 */
	type: {
		type: Number,
		enum: [1, 2, 3],
		default: 1
	},
	content: {
		type: String
	}
})

module.exports = db.model('user-comment', schema)
