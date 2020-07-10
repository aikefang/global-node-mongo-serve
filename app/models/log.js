// 用于记录日志
let mongoose = require("mongoose")
/**
 * 记录api log日志
 */
let schema = new mongoose.Schema({
  type: String,
  created: {
    type: Date,
    default: Date.now
  },
  data: {
    type: Object,
    default: {}
  }
})

let logModel = db.model("log", schema)
module.exports = logModel
