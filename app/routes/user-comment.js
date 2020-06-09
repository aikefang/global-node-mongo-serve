const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/user-comment')
const ai = require('../../lib/abnormal-interception')
router.post('/create', ai(controller.create))
router.get('/list', ai(controller.list))
router.post('/delete', ai(controller.delete))

module.exports = router
