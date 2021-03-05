const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/map-record')
const ai = require('../../lib/abnormal-interception')
// 地图小程序（随时可删）
router.post('/list', ai(controller.list))
// 地图小程序（随时可删）
router.post('/insert', ai(controller.insert))

module.exports = router
