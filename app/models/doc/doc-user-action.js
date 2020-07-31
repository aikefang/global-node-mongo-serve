let mongoose = require("mongoose")
/**
 * 用户对文档产生的动作
 * @type {mongoose.Schema}
 * 注：同一个文档ID & 同一种动作类型只能存在一条记录
 * 		用户的多次同样的动作只需要更新actionTime
 */
let schema = new mongoose.Schema({
	/**
	 * 动作
	 * view:浏览
	 * collection: 收藏
	 */
	action: {
		type: String,
		enum: ['view', 'collection'],
		default: 'collection'
	},
	// 用户ID
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
		required: true,
	},
	// 文档ID
	doc: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'doc',
		required: true,
	},
	// 动作发生时间
	actionTime: {
		type: Date,
		default: Date.now
	}
})

module.exports = db.model("doc_user_action", schema)
