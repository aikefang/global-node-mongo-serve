const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/webhook')
const ai = require('../../lib/abnormal-interception')
router.post('/github', ai(controller.github))
router.get('/github', ai(controller.github))

module.exports = router
