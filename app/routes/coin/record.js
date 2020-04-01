const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../../controllers/coin/record')
router.get('/createIn', controller.createIn)
router.get('/createOut', controller.createOut)
// router.get('/info', controller.info)

module.exports = router
