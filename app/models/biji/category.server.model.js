let mongoose = require("mongoose")

let schema = new mongoose.Schema({
	// ID
	id: Number,
	parent_id: {
		type: Number,
		default: null
	},
	parent: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'webascii_biji_catrgory'
	},
	title: String,
	// 是否启用 默认1  0：不启用，1：启用
	is_enable: {
		type: Number,
		default: 1
	},
	// 排序
	sort_index: Number,
	/**
	 * 是否为父级
	 * 1：是
	 * 2：否
	 */
	is_parent: Number,
	// 热门 0：不热门，1：热门
	hot: {
		type: Number,
		default: 0
	},
	c_time: {
		type: Date,
		default: Date.now
	},
	m_time: {
		type: Date,
		default: null
	}
})

module.exports = db.model('webascii_biji_catrgory', schema)
