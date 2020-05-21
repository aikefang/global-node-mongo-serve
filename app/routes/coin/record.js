const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../../controllers/coin/record')
const ai = require('../../../lib/abnormal-interception')
router.get('/createIn', ai(controller.createIn))
router.get('/createOut', ai(controller.createOut))
router.get('/list', ai(controller.list))
// router.get('/info', controller.info)

module.exports = router
