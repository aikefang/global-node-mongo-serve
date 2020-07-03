const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../../controllers/biji/sitemap')
const ai = require('../../../lib/abnormal-interception')
router.get('/map', ai(controller.map))

module.exports = router
