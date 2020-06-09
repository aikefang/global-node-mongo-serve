// 限制登录中间件
let loginMiddleware = async (ctx, next) => {
  // 不限制登录的路由
  const re = [
    'ldap\/login',
    'ldap\/logout',
    'gitlabSystemHooks\/hooks',
    'gitlabSystemHooks\/test',
    'open\/v1',
    'dealWebasciiData',
    'dealWebasciiData',
    // 'upload\/files',
  ]
  const reg = new RegExp(re.join('|'), 'ig')
  if (reg.test(ctx.request.url)){
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
