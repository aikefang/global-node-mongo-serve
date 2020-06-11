const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../../controllers/biji/article')
const ai = require('../../../lib/abnormal-interception')
router.get('/list', ai(controller.list))
router.get('/search', ai(controller.search))
router.get('/details', ai(controller.details))
router.get('/redirect', ai(controller.redirect))
router.get('/historyList', ai(controller.historyList))
router.post('/historyDelete', ai(controller.historyDelete))
router.get('/historyDetails', ai(controller.historyDetails))
router.post('/zan', ai(controller.zan))
router.post('/edit', ai(controller.edit))

router.get('/draftList', ai(controller.draftList))
router.post('/draftUpdate', ai(controller.draftUpdate))
router.get('/draftDetails', ai(controller.draftDetails))
router.post('/draftCreate', ai(controller.draftCreate))
router.post('/draftDelete', ai(controller.draftDelete))
router.post('/draftPublish', ai(controller.draftPublish))

module.exports = router
