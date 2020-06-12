const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../../controllers/book/book')
const ai = require('../../../lib/abnormal-interception')
router.get('/list', ai(controller.list))
router.post('/create', ai(controller.create))
router.get('/redirect', ai(controller.redirect))
router.get('/details', ai(controller.details))

module.exports = router
