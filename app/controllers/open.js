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
    await $axios.post('https://open.feishu.cn/open-apis/bot/hook/d93784d224f9402587c32eb3fe2051c6', {
      title: '参数信息',
      text: JSON.stringify(params),
    })
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

      let res = await tulingReply(params.event.text_without_at_bot)
      if (!res) {
        res = await qingyunkeReply(params.event.text_without_at_bot)
      }

      // params.event.text_without_at_bot

      if (res) {
        await sendMsg(params, params.event.text_without_at_bot)
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
  }
}

async function tulingReply (msg) {
  await $axios.post('https://open.feishu.cn/open-apis/bot/hook/d93784d224f9402587c32eb3fe2051c6', {
    title: '图灵b' + msg,
    text: '123123123',
  })
  const res = await $axios.get(`http://www.tuling123.com/openapi/api`, {
    params: {
      key: '7891896c5c1c472babf6abafd842e008',
      info: msg,
    }
  })

  await $axios.post('https://open.feishu.cn/open-apis/bot/hook/d93784d224f9402587c32eb3fe2051c6', {
    title: '图灵' + msg,
    text: JSON.stringify(res),
  })

  if (res.text !== '对不起，没听清楚，请再说一遍吧。') {
    return res.text
  }
  return false
}


async function qingyunkeReply (msg) {
  const res = await $axios.get(`http://api.qingyunke.com/api.php`, {
    params: {
      key: 'free',
      appid: 0,
      msg: msg,
    }
  })

  await $axios.post('https://open.feishu.cn/open-apis/bot/hook/d93784d224f9402587c32eb3fe2051c6', {
    title: '青云客' + msg,
    text: JSON.stringify(res),
  })

  if (res.result === 0) {
    return res.content
  }
  return false
}



async function sendMsg(params, text) {
  const token = await $axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/', {
    app_id: 'cli_9e63c932c5ac900e',
    app_secret: 'sDYHZhDNjCSuHyvnLKfOCdjjv8hHRJhI'
  })
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
