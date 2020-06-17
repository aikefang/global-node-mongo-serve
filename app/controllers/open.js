// const gitlabProjectData = require('../datas/gitlabProject')
// const testModel = require('../models/test')

const $axios = require('axios')


module.exports = {
  demo: async (ctx, next) => {
    // ctx.body = {
    //   info: '测试pm2重启'
    // }
    // testModel.create()
    // let testEnity = new testModel({
    //   id: 1,
    //   name: 'test',
    //   count: 1.221
    // })
    //
    // // 创建用户
    // testModel.create(testEnity, (err, data) => {
    //   if (err) return console.log(err)
    // })
    ctx.response.redirect('/about')
    // ctx.body = {
    //   status: 200,
    //   message: '成功2',
    //   data: {
    //
    //   }
    // }
  },
  async feishu(ctx) {
    const params = ctx.request.body

    const token = await $axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/', {
      app_id: 'cli_9e63c932c5ac900e',
      app_secret: 'sDYHZhDNjCSuHyvnLKfOCdjjv8hHRJhI'
    })
    ctx.append('Authorization', `Bearer ${token.data.tenant_access_token}`)

    await $axios.post('https://open.feishu.cn/open-apis/message/v4/send/', {
      open_id: params.event.open_id,
      chat_id: params.event.open_chat_id,
      root_id: params.event.open_message_id,
      msg_type: 'text',
      content: {
        text: `<at user_id=\"${params.event.open_id}\">test</at>`
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token.data.tenant_access_token}`
      }
    })
    await $axios.post('https://open.feishu.cn/open-apis/bot/hook/d93784d224f9402587c32eb3fe2051c6', {
      title: '订阅消息',
      text: JSON.stringify(ctx.request.body),
    })
    ctx.body = {
      ...ctx.request.body,
    }
  }
}
