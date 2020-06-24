const $axios = require('axios')
const config = require('../../../../config/config')
const oauthModel = require('../../../models/oauth-info-cache')

async function getAccessToken(qq, param) {
  const res = await $axios({
    url: `https://graph.qq.com/oauth2.0/token`,
    method: 'GET',
    headers: {
      "content-type": "application/json"
    },
    params: {
      grant_type: 'authorization_code',
      client_id: qq.clientId,
      client_secret: qq.clientSecret,
      code: param.code,
      redirect_uri: qq.redirectUri,
    },
    timeout: 5000, // 设置超时
    // responseType: 'text'
  })
  console.log('qq token', res.data)
  if (res.data.indexOf('access_token') === -1) {
    return false
  }
  // let accessToken = accessTokenStr.split('&')[0].split('=')[1]
  return res.data.split('&')[0].split('=')[1]
}

// 获取openID
async function getOpenid(accessToken) {
  const res = await $axios({
    url: `https://graph.qq.com/oauth2.0/me`,
    method: 'GET',
    headers: {
      "content-type": "application/json"
    },
    params: {
      access_token: accessToken
    },
    timeout: 5000, // 设置超时
    responseType: 'text'
  })
  console.log('qq openid', res.data)
  let openidObj = {}
  try {
    openidObj = eval('openid' + `${res.data}`)
    if (!openidObj.client_id || !openidObj.openid) {
      console.log('qq openid 回调方法接口未知错误')
      return false
    }
  } catch (e) {
    console.log('qq openid 接口未知错误')
    return false
  }
  return openidObj
}

async function getUserInfo(qq, info) {
  const res = await $axios({
    // url: 'http://localhost:1314/api/sw/test',
    url: 'https://graph.qq.com/user/get_user_info',
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
    params: {
      access_token: info.accessToken,
      oauth_consumer_key: qq.clientId,
      openid: info.openid,
    },
    // timeout: 5000, // 设置超时
    responseType: 'json'
  })
  console.log('qq user info', res.data)
  return res.data
}

async function requestQQ(qq, param) {
  console.log(qq)
  let accessToken = await getAccessToken(qq, param)
  if (!accessToken) {
    console.log('qq token 接口未知错误')
    return false
  }
  const openidObj = await getOpenid(accessToken)
  if (!openId) {
    console.log('qq openid 接口未知错误')
    return false
  }
  let userInfo = await getUserInfo(qq, {
    accessToken,
    openid: openidObj.openid
  })
  if (!userInfo) {
    console.log('qq user 接口未知错误')
    return false

  }
  return {
    userInfo: {
      ...userInfo,
      openid: openidObj.openid
    },
    openidObj
  }
}


module.exports = {
  async userInfo(ctx, next) {
    const code = ctx.request.query.code
    if (!code) {
      return ctx.body = {
        status: 500002,
        message: '缺少参数 => code',
        data: {}
      }
    }
    const userInfo = await requestQQ(config.server.qq, {
      code
    })

    if (!userInfo) {
      return ctx.body = {
        status: 500001,
        message: '未知错误',
        data: {}
      }
    }

    // 缓存qq登录数据
    const res = await oauthModel.findOneAndUpdate(
      {
        id: userInfo.openid.toString()
      },
      {
        $set: {
          type: 'qq',
          info: userInfo,
          mTime: new Date()
        }
      },
      {
        'upsert': true
      }
    )

    let infoId = null

    if (!res) {
      const findRes = await oauthModel.findOne({
        id: userInfo.openid.toString()
      })
      if (findRes) {
        infoId = findRes._id
      }
    } else {
      infoId = res._id
    }

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        qq: userInfo,
        id: infoId
      }
    }
  }
}
