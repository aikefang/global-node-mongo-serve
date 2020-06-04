const navModel = require('../../models/biji/nav.server.model')
const humb = require('../../../lib/hump')
module.exports = {
  async list(ctx, next) {

    let navList = await navModel.find({
      is_enable: 1
    }, {
      _id: 1,
      id: 1,
      title: 1,
      url_link: 1,
    })
      .sort({
        sort_index: -1,
        _id: 1
      })
      .lean()

    const list = humb(navList)
    let reg = /^(http|https):\/\//

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        /**
         * type
         * 0: 相对链接（默认）
         * 1：绝对链接
         */
        list: list.map(data => {
          if (reg.test(data.urlLink)) {
            data.type = 1
          } else {
            data.type = 0
          }
          return data
        })
      }
    }
  }
}
