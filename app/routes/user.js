const Router = require('koa-router') // koa 路由中间件
const router = Router()
let controller = require('../controllers/user')
const ai = require('../../lib/abnormal-interception')
router.post('/login', ai(controller.login))
router.get('/logout', ai(controller.logout))
router.get('/info', ai(controller.info))
router.get('/baseInfo', ai(controller.baseInfo))
router.post('/register', ai(controller.register))

// 小程序相关接口
router.post('/weixinLogin', ai(controller.weixinLogin))
router.post('/getWeixinUser', ai(controller.getWeixinUser))

// 地图小程序（随时可删）
router.post('/mapWeixinLogin', ai(controller.mapWeixinLogin))
// 地图小程序（随时可删）
router.post('/getMapWeixinUser', ai(controller.getMapWeixinUser))
// 地图小程序（随时可删）
router.post('/setMapWXUserType', ai(controller.setMapWXUserType))

module.exports = router
