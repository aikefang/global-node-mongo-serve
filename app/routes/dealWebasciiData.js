const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/dealWebasciiData')
const ai = require('../../lib/abnormal-interception')
router.get('/article', ai(controller.article))
router.get('/articleDoc', ai(controller.articleDoc))
router.get('/articleDraft', ai(controller.articleDraft))
router.get('/articleHistory', ai(controller.articleHistory))
router.get('/user', ai(controller.user))
router.get('/category', ai(controller.category))
router.get('/banner', ai(controller.banner))
router.get('/nav', ai(controller.nav))
router.get('/book', ai(controller.book))

module.exports = router
