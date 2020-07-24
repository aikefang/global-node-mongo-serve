// const userModel = require('../models/user')
// const articleModel = require('../models/biji/article')
// const logModel = require('../models/log')
const common = require('../../lib/common')
// const humb = require('../../lib/hump')
// const moment = require('moment')
module.exports = {
  async github(ctx) {
    if (ctx.request.body.ref === 'refs/heads/master') {
      common.log('github-hook-data', ctx.request.body)
    }

    ctx.body =  ctx.request.body
  }
}
