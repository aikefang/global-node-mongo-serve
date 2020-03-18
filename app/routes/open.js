const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/open')
// const {checkSign} = require('../../lib/checkStatus')
// let middleware = async (ctx, next) => {
//   // 判断用户是否为管理员
//   if (!await checkSign(ctx, next)) {
//     return
//   }
//   await next()
// }
// router.post('/v1/search/project', middleware)
// router.post('/v1/search/project', controller.searchProject)
// router.get('/v1/search/project', middleware)
router.get('/v1/demo', controller.demo)

module.exports = router
