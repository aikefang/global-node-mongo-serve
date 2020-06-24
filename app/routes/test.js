const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/test')
const ai = require('../../lib/abnormal-interception')
router.get('/test', ai(controller.test))

module.exports = router
