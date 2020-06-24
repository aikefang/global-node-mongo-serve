// const navModel = require('../../models/biji/nav')
// const humb = require('../../../lib/hump')

const $axios = require('axios')
const config = require('../../../../config/config')


const oauthModel = require('../../../models/oauth-info-cache')

async function getAccessToken(github, param) {
  const res = await $axios({
    url: `https://github.com/login/oauth/access_token`,
    method: 'POST',
    headers: {
      "content-type": "application/json"
    },
    data: {
      client_id: github.clientId,
      client_secret: github.clientSecret,
      code: param.code,
    },
    timeout: 5000, // 设置超时
    responseType: 'text'
  })
  if (res.data.indexOf('access_token') === -1) {
    return false
  }
  return res.data.split('&')[0].split('=')[1]
}

async function getUserInfo(github, accessToken) {
  const res = await $axios({
    // url: 'http://localhost:1314/api/sw/test',
    url: 'https://api.github.com/user',
    method: "GET",
    headers: {
      "content-type": "application/json",
      'User-Agent': `${github.userName}:${accessToken}`
    },
    params: {
      access_token: accessToken,
      rd: Math.random()
    },
    // timeout: 5000, // 设置超时
    responseType: 'json'
  })
  return res.data
}

async function requestGithub (github, param) {
  let accessToken = await getAccessToken(github, param)
  if (!accessToken) {
    console.log('github token 接口未知错误')
    return false
  }
  let userInfo = await getUserInfo(github, accessToken)
  if (!userInfo) {
    console.log('github user 接口未知错误')
    return false
  } else if (!userInfo.login) {
    console.log('github user 接口未知错误')
    return false
  }
  return userInfo
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

    const userInfo = await requestGithub(config.server.github, {
      code
    })
    
    if (!userInfo) {
      return ctx.body = {
        status: 500001,
        message: '未知错误',
        data: {}
      }
    }

    // 缓存github登录数据
    const res = await oauthModel.findOneAndUpdate(
      {
        id: userInfo.id.toString()
      },
      {
        $set: {
          type: 'github',
          info: userInfo,
          mTime: new Date()
        }
      },
      {
        'upsert': true
      })

    let infoId = null

    if (!res) {
      const findRes = await oauthModel.findOne({
        id: userInfo.id.toString()
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
        github: userInfo,
        id: infoId
      }
    }
  }
}
