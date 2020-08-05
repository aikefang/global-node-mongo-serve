process.env.TZ = 'Asia/Shanghai'
const config = require('./config/config')
const Koa = require('koa')
const multer = require('koa-multer')
const uuid = require('node-uuid')
const fnv = require('fnv-plus')
const qiniuTool = require('qiniu-tool')

// 配置上传
const storage = multer.diskStorage({
  // 文件保存路径
  async destination(req, file, cb) {
    cb(null, 'tmp')
  },
  // 修改文件名称
  async filename(req, file, cb) {
    const fileFormat = (file.originalname).split(".");  // 以点分割成数组，数组的最后一项就是后缀名
    const suffix = '.' + fileFormat[fileFormat.length - 1]
    const name = file.originalname.replace(suffix, '').replace(/\s+/g, '')
    const v1 = uuid.v1()
    const hash = `${fnv.hash(v1, 64).str()}`
    // cb(null, `${name}-${hash}${suffix}`)
    cb(null, `${hash}${suffix}`)
  }
})
//加载配置
const upload = multer({storage: storage})

// 路由
const Router = require('koa-router')
// 视图
const views = require('koa-views')
// 配置静态目录
const koaStatic = require('koa-static')
// 日志
// const koaLogger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
// 跨域问题处理
const cors = require('koa2-cors')
// mongo数据库
const mongoose = require('mongoose')
global.custom = {
  mongoose: mongoose,
  upload: upload
}
// log颜色
const chalk = require('chalk')
// 获取文件列表
const fileList = require('get-file-list')
// 路径
const {join, normalize, relative, resolve} = require('path')
// session
const session = require('koa-session')
const {contentType} = require('mime-types')

const app = new Koa()
// 处理前端跨域的配置
app.use(cors({
  // origin: function (ctx) {
  //   // if (ctx.url === '/test') {
  //   //   return false;
  //   // }
  //   return '*'
  // },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'], // 设置获取其他自定义字段
  maxAge: 5, // 指定本次预检请求的有效期，单位为秒。
  credentials: true, // 是否允许发送Cookie
  allowMethods: ['GET', 'POST', 'DELETE'], // 设置所允许的HTTP请求方法
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'Accept'
  ], // 设置服务器支持的所有头信息字段
}))
app.keys = config.sissionOption.keys
const CONFIG = config.sissionOption.config
require('./config/webascii-mysql')
app.use(session(CONFIG, app))

app.use(bodyParser())

app.use(koaStatic(__dirname + '/public'))
app.use(koaStatic(__dirname + '/public', {
  setHeaders: (res, src, stats) => res.setHeader('Content-Type', contentType(src)), // 给静态资源加上正确的 header, 否则浏览器会识别错误
}))
mongoose.set('useFindAndModify', false)

global.db = mongoose.createConnection(
  config.mongo.url,
  config.mongo.options,
  (err) => {
    if (err) {
      console.log('mongo => ', chalk.yellow(`连接失败`))
    } else {
      console.log(chalk.green('MongoDB =>'), chalk.yellow(`连接成功`))
    }
  })
app.use(views(__dirname + '/app/views', {
  extension: 'ejs',
}))
// 获取文件列表
fileList.config({
  path: './app/routes', // 绝对路径
  type: '.js', // 允许遍历的文件类型（详情请查看下文文档）
})
let router = new Router({
  // prefix:'/venom'
})
// app.use(accessLogger())

/** 参数处理中间件 **/
/** 同时接收get和post<x-www-form-urlencoded>参数 body参数会覆盖query参数 **/
app.use(async (ctx, next) => {
  ctx.request.body = {
    ...ctx.request.query,
    ...ctx.request.body,
  }
  ctx.request.query = {
    ...ctx.request.body,
    ...ctx.request.query,
  }
  await next()
})

router.use('/api/*', require('./lib/middleware/access'))

// 路由自动注册
fileList.run().then((data) => {
  // 注册路由
  data.map(async (data) => {
    let routePathName = data.match(/([^<>/\\\|:""\*\?]+)\.\w+$/, 'ig')
    let name = routePathName[1]
    let rootRouteName = name.split('.')[0]
    let routePath = join(data.split(normalize('routes/'))[1].split(`${name}`)[0], rootRouteName)
    let childRoute = require(data)
    childRoute.stack.map((data) => {
      let apiMethod = data.methods[data.methods.length - 1]
      console.log(chalk.green('启动路由 =>'), chalk.bgMagenta(apiMethod), chalk.yellow(`/api/${routePath}${data.path}`))
    })
    await router.use(`/api/${routePath}`, childRoute.routes(), childRoute.allowedMethods())
  })
})
// 错误log
app.on('error', async (err, ctx) => {
  console.log(err)
})
// 错误view渲染
app.use(async (ctx, next) => {
  await ctx.render('error', {
    message: `${ctx.response.status} ${ctx.response.message}`,
    url: ctx.request.url
  })
  await next()
})
//加载路由中间件
app.use(router.routes()).use(router.allowedMethods())
module.exports = app
