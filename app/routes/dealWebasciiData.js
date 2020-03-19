const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/dealWebasciiData')
router.get('/article', controller.article)
router.get('/articleDraft', controller.articleDraft)
router.get('/articleHistory', controller.articleHistory)
router.get('/user', controller.user)
router.get('/category', controller.category)
router.get('/banner', controller.banner)
router.get('/nav', controller.nav)

module.exports = router
