const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../../controllers/biji/article')
const ai = require('../../../lib/abnormal-interception')
router.get('/list', ai(controller.list))
router.get('/details', ai(controller.details))
router.get('/redirect', ai(controller.redirect))
router.get('/historyList', ai(controller.historyList))
router.post('/historyDelete', ai(controller.historyDelete))
router.get('/historyDetails', ai(controller.historyDetails))
router.post('/zan', ai(controller.zan))
router.post('/edit', ai(controller.editDetail))

module.exports = router
