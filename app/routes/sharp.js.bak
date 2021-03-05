const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/sharp')
const ai = require('../../lib/abnormal-interception')
// router.post('/compositing', global.custom.upload.single('files'), ai(controller.compositing))
router.post('/compositing', global.custom.upload.fields([
  {
    name: 'background',
    maxCount: 1
  },
  {
    name: 'files',
    maxCount: 10
  }
]), ai(controller.compositing))
module.exports = router
