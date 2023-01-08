let mongoose = require("mongoose")

let schema = new mongoose.Schema({
	// 用户ID
	id: Number,
	// 昵称
	nickname: String,
	// 账号
	account: String,
	// 密码
	password: String,
	// 创建时间
	cTime: {
		type: Date,
		default: Date.now
	},
	// 更新时间
	mTime: Date,
	// 头像
	headImg: String,
})

module.exports = db.model('chat_user', schema)
