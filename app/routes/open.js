const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/open')
// const $axios = require('axios')
const ai = require('../../lib/abnormal-interception')
router.get('/v1/demo', ai(controller.demo))
router.get('/v1/feishu', ai(controller.feishu))
router.post('/v1/feishu', ai(controller.feishu))
router.get('/v1/sendFeishu', ai(controller.sendFeishu))

module.exports = router
