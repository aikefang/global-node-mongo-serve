const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/justchat')
const ai = require('../../lib/abnormal-interception')
router.post('/createRole', ai(controller.createRole))
router.post('/getPrologue', ai(controller.get_prologue))
router.post('/createSession', ai(controller.create_session))
router.post('/getAnswer', ai(controller.getAnswer))

module.exports = router
