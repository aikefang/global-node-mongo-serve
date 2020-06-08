const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/upload')
const ai = require('../../lib/abnormal-interception')
router.post('/files', global.custom.upload.single('file'), ai(controller.files))

module.exports = router
