let mongoose = require("mongoose")
/**
 * 文档分类
 */
let schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true
  },
	cTime: {
		type: Date,
		default: Date.now
	}
})

module.exports = db.model("doc_category", schema)
