let mongoose = require("mongoose")

let schema = new mongoose.Schema({
	/**
	 * type: 买入或者卖出
	 * in: 买入
	 * out：卖出
	 */
	type: String,
	/**
	 * 用于卖出类型记录买入的ID
	 */
	parentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'record'
	},
	// 币种
	currency: {
		type: String,
		default: 'ETC'
	},
	// 买入数量
	inCount: Number,
	// 卖出数量
	outCount: Number,
	// 买入价格
	inPrice: Number,
	// 卖出价格
	outPrice: Number,
	// 买入时间
	inTime: Date,
	// 卖出时间
	outTime: Date,
})

module.exports = db.model("record", schema)
