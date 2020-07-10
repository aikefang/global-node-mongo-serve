const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../../controllers/biji/category')
const ai = require('../../../lib/abnormal-interception')
router.get('/list', ai(controller.list))
router.get('/hotSearch', ai(controller.hotSearch))
router.get('/redirect', ai(controller.redirect))

module.exports = router
