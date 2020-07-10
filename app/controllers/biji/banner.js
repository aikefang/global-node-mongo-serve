const bannerModel = require('../../models/biji/banner')
const humb = require('../../../lib/hump')
module.exports = {
  async list(ctx, next) {

    const imageMogr2 = ctx.request.query.imageMogr2


    let bannerList = await bannerModel.find({
        is_enable: 1
      })
      .sort({
        sort_index: -1,
        // _id: 1
      })
      .lean()

    const list = humb(bannerList)

    list.forEach(data => {
      if (imageMogr2) {
        data.urlPath2 = data.urlPath + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80|imageView2/1/w/800/h/300'
      } else {
        data.urlPath2 = data.urlPath
      }
    })

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        list
      }
    }
  }
}
