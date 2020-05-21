const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/user')
const ai = require('../../lib/abnormal-interception')
router.post('/login', ai(controller.login))
router.get('/logout', ai(controller.logout))
router.get('/info', ai(controller.info))

module.exports = router
