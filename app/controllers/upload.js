const upload = require('../../lib/upload')
module.exports = {
  async files(ctx) {
    const file = ctx.req.file
    const res = await upload(file, 'webascii/files/', {
      size: true,
    })
    if (!res) {
      return ctx.body = {
        status: 400001,
        message: '文件上传失败',
        data: {}
      }
    }
    ctx.body = {
      status: 200,
      message: '上传成功',
      link: res.path,
      data: res
    }
  },
  async bookView(ctx) {
    const file = ctx.req.file
    const res = await upload(file, 'webascii/book-view/',{
      size: true,
    })
    if (!res) {
      return ctx.body = {
        status: 400001,
        message: '文件上传失败',
        data: {}
      }
    }
    ctx.body = {
      status: 200,
      message: '上传成功',
      link: res.path,
      data: res
    }
  }
}
