const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../../controllers/biji/banner')
const ai = require('../../../lib/abnormal-interception')
router.get('/list', ai(controller.list))

module.exports = router
