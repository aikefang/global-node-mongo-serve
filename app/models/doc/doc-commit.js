let mongoose = require("mongoose")
let schema = new mongoose.Schema({
	// git文件路径
	path: {
		type: String,
		required: true
	},
	commit: {
		type: Array,
		default: []
	},
})

module.exports = db.model("doc_commit", schema)
