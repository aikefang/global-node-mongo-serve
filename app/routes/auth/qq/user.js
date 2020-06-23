const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../../../controllers/auth/qq/oauth')
const ai = require('../../../../lib/abnormal-interception')
router.get('/userInfo', ai(controller.userInfo))

module.exports = router
