// 异常处理
let ai = (fn) => {
  return async function (ctx, next) {
    await fn(...arguments).catch(e => {
      ctx.body = {
        status: 500000,
        message: e.message || e.errorMessage || '系统错误',
        data: {}
      }
    })
  }
}
module.exports = ai
