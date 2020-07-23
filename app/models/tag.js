let mongoose = require("mongoose")

let schema = new mongoose.Schema({
	// 名称
	title: {
		type: String,
		required: true
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
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user',
		required: true
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
	}
})

module.exports = db.model('tag', schema)
