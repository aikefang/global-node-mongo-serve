let mongoose = require("mongoose")

let schema = new mongoose.Schema({
	id: Number,
	name: String,
	count: Number
})

module.exports = db.model("test", schema)
