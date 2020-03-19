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
	login_token: String,
	// 最后登录时间
	last_login_time: Date,
	// 创建时间
	c_time: Date,
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
	// github用户名
	github_login: String,
	// github用户ID，0:未绑定github用户
	github_id: {
		type: Number,
		default: 0
	},
	// github node_id
	github_node_id: String,
	// github头像信息
	github_avatar_url: String,
	// github首页
	github_home_url: String,
	// github账户绑定时间
	github_bind_time: Date,
	// qq用户的openid
	qq_openid: String,
	// qq昵称
	qq_nickname: String,
	// qq性别
	qq_gender: String,
	// qq省份
	qq_province: String,
	// qq城市
	qq_city: String,
	// qq 个人出生年份
	qq_year: String,
	// qq头像
	qq_figureurl_qq: String,
	// 首次绑定qq的时间
	qq_bind_time: Date,
})

module.exports = db.model('user', schema)
