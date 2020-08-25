let mongoose = require("mongoose")
let schema = new mongoose.Schema({
  // 加密后的unionid
  id: {
    type: String,
    required: true
  },
  data: {
    type: Object
  },
})

module.exports = db.model("unionid_encryption", schema)
