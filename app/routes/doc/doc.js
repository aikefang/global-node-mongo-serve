const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../../controllers/doc/doc')
const ai = require('../../../lib/abnormal-interception')
// router.get('/create', ai(controller.create))
// router.post('/create', ai(controller.create))
// router.get('/list', ai(controller.list))
router.get('/search', ai(controller.search))
router.get('/content', ai(controller.content))

module.exports = router
