const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/tag')
const ai = require('../../lib/abnormal-interception')
router.get('/create', ai(controller.create))

module.exports = router
