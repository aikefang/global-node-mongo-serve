// 限制登录中间件
let loginMiddleware = async (ctx, next) => {
  if ((/ldap\/login|ldap\/logout|gitlabSystemHooks\/hooks|gitlabSystemHooks\/test|open\/v1|dealWebasciiData/ig).test(ctx.request.url)){
    await next()
    return
  } else {
    if (ctx.session.logged !== true) {
      ctx.body = {
        status: 200001,
        message: '用户未登录',
        data: {}
      }
      return
    } else {
      await next()
    }
  }
}
module.exports = loginMiddleware
