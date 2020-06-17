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
    let params = ctx.request.body
    await $axios.post('https://open.feishu.cn/open-apis/bot/hook/d93784d224f9402587c32eb3fe2051c6', {
      title: '订阅消息',
      text: JSON.stringify(ctx.request.body)
    })
    // await $axios.post('https://open.feishu.cn/open-apis/bot/hook/d93784d224f9402587c32eb3fe2051c6', {
    //   title: '参数信息',
    //   text: JSON.stringify(params),
    // })


    // if (ctx.request.body.msg) {
    //
    // }

    // params = {
    //   "uuid": "2d1215b43f8760591a21b8b4f21cde1e",
    //   "event": {
    //     "app_id": "cli_9e63c932c5ac900e",
    //     "chat_type": "group",
    //     "is_mention": true,
    //     "lark_version": "lark/3.24.9",
    //     "message_id": "",
    //     "msg_type": "text",
    //     "open_chat_id": "oc_f17c8230bb9262ee955dca6e6b65692f",
    //     "open_id": "ou_77b5c8a5f3116ac9502563138b9e8d0a",
    //     "open_message_id": "om_a93ff3f366e4ce4410abfe709a904f09",
    //     "parent_id": "",
    //     "root_id": "",
    //     "tenant_key": "2d5a0a659d4f575d",
    //     "text": "<at open_id=\"ou_e3cdeeabf8619823a35014358d2c33e1\">@Friday全职保姆</at> 你好啊",
    //     "text_without_at_bot": "1+1等于几？",
    //     "type": "message",
    //     "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Lark/3.24.9 Chrome/73.0.3683.119 Electron/5.0.0 Safari/537.36 LarkLocale/zh_CN SDK-Version/3.24.13",
    //     "user_open_id": "ou_77b5c8a5f3116ac9502563138b9e8d0a"
    //   },
    //   "token": "jZUAb78EXuuDs4zC7qdsFd2VUpL0TEgO",
    //   "ts": "1592376142.817108",
    //   "type": "event_callback"
    // }


    if (params.event.text_without_at_bot) {

      if (diffText(params.event.text_without_at_bot, ['我的', '任务'])) {
        await sendMsg(params, textSelect(2))
        return ctx.body = {
          ...ctx.request.body,
        }
      }
      if (diffText(params.event.text_without_at_bot, ['任务'])) {
        await sendMsg(params, textSelect(2))
        return ctx.body = {
          ...ctx.request.body,
        }
      }

      if (diffText(params.event.text_without_at_bot, ['你是谁'])) {
        await sendMsg(params, textSelect(3))
        return ctx.body = {
          ...ctx.request.body,
        }
      }

      if (diffText(params.event.text_without_at_bot, ['我是谁'])) {
        await sendMsg(params, textSelect(4))
        return ctx.body = {
          ...ctx.request.body,
        }
      }
      if (diffText(params.event.text_without_at_bot, ['公司', '叫', '什么'])) {
        await sendMsg(params, textSelect(5))
        return ctx.body = {
          ...ctx.request.body,
        }
      }

      let res = await tulingReply(params.event.text_without_at_bot)
      if (!res) {
        res = await qingyunkeReply(params.event.text_without_at_bot)
      }
      // let res = await qingyunkeReply(params.event.text_without_at_bot)

      // params.event.text_without_at_bot

      if (res) {
        await sendMsg(params, res)
      } else {
        await sendMsg(params, '什么意思？')
      }
    }
    ctx.body = {
      ...ctx.request.body,
    }
  }
}

function diffText(text, arr) {
  let boo = []
  arr.forEach(data => {
    if (text.indexOf(data) >= 0) {
      boo.push(true)
    } else {
      boo.push(false)
    }
  })
  return boo.indexOf(false) === -1
}

function textSelect(select) {
  switch (select) {
    // case 1:
    //   return '我非常好~';
    case 2:
      return '任务统计正在开发中，请耐心等待。';
    case 3:
      return '我是Friday全职保姆啊';
    case 4:
      return '你看看我@的谁，那就是你的名字哦';
    case 5:
      return '新氧科技有限公司';
  }
}

async function tulingReply (msg) {
  const res = await $axios.get(`http://www.tuling123.com/openapi/api`, {
    params: {
      key: '7891896c5c1c472babf6abafd842e008',
      info: msg,
    }
  })
  if (res.data.text === '对不起，没听清楚，请再说一遍吧。') {
    return false
  }
  return res.data.text
}


async function qingyunkeReply (msg) {
  const res = await $axios.get(`http://api.qingyunke.com/api.php`, {
    params: {
      key: 'free',
      appid: 0,
      msg: msg,
    }
  })
  if (res.data.result === 0) {
    return res.data.content.replace('菲菲', ' Friday全职保姆')
  }
  return false
}



async function sendMsg(params, text) {
  const token = await $axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/', {
    app_id: 'cli_9e63c932c5ac900e',
    app_secret: 'sDYHZhDNjCSuHyvnLKfOCdjjv8hHRJhI'
  })
  // console.log(token)
  await $axios.post('https://open.feishu.cn/open-apis/message/v4/send/',
    {
      open_id: params.event.open_id,
      chat_id: params.event.open_chat_id,
      root_id: params.event.open_message_id,
      msg_type: 'text',
      content: {
        text: `<at user_id=\"${params.event.open_id}\">test</at> ${text}`
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${token.data.tenant_access_token}`
      }
    })
}
