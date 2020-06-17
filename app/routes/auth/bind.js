const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../../controllers/auth/bind')
const ai = require('../../../lib/abnormal-interception')
router.post('/gitlab/new/user', ai(controller.githubNewUser))
router.post('/gitlab/old/user', ai(controller.githubOldUser))
router.post('/gitlab/auto/login', ai(controller.gitlabAutoLogin))

module.exports = router
