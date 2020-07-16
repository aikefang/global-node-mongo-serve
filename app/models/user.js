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
	// 令牌
	// login_token: String,
	// 最后登录时间
	last_login_time: Date,
	// 创建时间
	c_time: {
		type: Date,
		default: Date.now
	},
	// 更新时间
	m_time: Date,
	/**
	 * 用户类型
	 * 1：后台用户
	 * 2：笔记网站用户
	 */
	user_type: Number,
	// 头像
	head_img: String,
	github: {
		type: mongoose.Schema.Types.ObjectId,
		default: null,
		ref: 'oauth_info_cache'
	},
	qq: {
		type: mongoose.Schema.Types.ObjectId,
		default: null,
		ref: 'oauth_info_cache'
	},
})

module.exports = db.model('user', schema)
