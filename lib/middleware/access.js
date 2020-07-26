const permission = {
  // 笔记网站权限
  note: {
    userType: 2
  }
}
// 需要登录的接口 且 需要用户身份认证
const needLogin = {
  // '/api/dealWebasciiData/article': permission.note,
  // '/api/dealWebasciiData/articleDraft': permission.note,
  // '/api/dealWebasciiData/articleHistory': permission.note,
  // '/api/dealWebasciiData/user': permission.note,
  // '/api/dealWebasciiData/category': permission.note,
  // '/api/dealWebasciiData/banner': permission.note,
  // '/api/dealWebasciiData/nav': permission.note,
  // '/api/dealWebasciiData/book': permission.note,
  '/api/upload/files': permission.note,
  '/api/user-comment/create': permission.note,
  '/api/user-comment/delete': permission.note,
  '/api/user/logout': permission.note,
  '/api/user/info': permission.note,
  '/api/user/baseInfo': permission.note,
  '/api/biji/article/historyDelete': permission.note,
  '/api/biji/article/edit': permission.note,
  '/api/biji/article/draftList': permission.note,
  '/api/biji/article/draftUpdate': permission.note,
  '/api/biji/article/draftDetails': permission.note,
  '/api/biji/article/draftCreate': permission.note,
  '/api/biji/article/draftDelete': permission.note,
  '/api/biji/article/draftPublish': permission.note,
  '/api/tag/create': permission.note,
  // '/api/doc/create': permission.note,
}

// 限制登录中间件
const accress = async (ctx, next) => {
  let url = ctx.request.req._parsedUrl.pathname
  // url最后一位为反斜杠，删除反斜杠，统一规范
  if (url[url.length - 1] === '/') {
    url = url.substr(0, url.length - 1)
  }
  const session = ctx.session
  // 当前用户未登录 && 命中需要登录权限的路由
  if (!(session.userInfo && session.userInfo._id) && needLogin[url]) {
    return ctx.body = {
      status: 200001,
      message: '用户未登录',
      data: {}
    }
  } else if (session.userInfo && needLogin[url] && session.userInfo.userType !== needLogin[url].userType) {
    // 用户已登录 && 命中需要权限的路由 && 当前用户类型与路由限制访问类型不匹配
    return ctx.body = {
      status: 200005,
      message: '无操作权限',
      data: {}
    }
  }
  await next()
}
module.exports = accress
