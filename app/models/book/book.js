let mongoose = require("mongoose")

let schema = new mongoose.Schema({
	// ID
	id: Number,
	// 书名
	bookName: String,
	// 百度云盘地址
	baiduCloudDiskUrl: String,
	// 预览图
	bookImg: String,
	// 是否启用 默认1  0：不启用，1：启用
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
	mTime: Date,
	// 下载量
	downloads: Number,
	// 贡献者名称
	contributorName: String,
	// 浏览量
	views: {
		type: Number,
		default: 0
	}
})

module.exports = db.model('book', schema)
