const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/user')
// const {checkSign} = require('../../lib/checkStatus')
// let middleware = async (ctx, next) => {
//   // 判断用户是否为管理员
//   if (!await checkSign(ctx, next)) {
//     return
//   }
//   await next()
// }
router.post('/login', controller.login)
router.get('/logout', controller.logout)
router.get('/info', controller.info)

module.exports = router
