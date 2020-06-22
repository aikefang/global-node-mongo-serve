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
    // return ctx.body = {
    //   status: 200,
    //   message: '成功',
    //   data: { github:
    //       { login: 'aikefang',
    //         id: 21077842,
    //         node_id: 'MDQ6VXNlcjIxMDc3ODQy',
    //         avatar_url: 'https://avatars2.githubusercontent.com/u/21077842?v=4',
    //         gravatar_id: '',
    //         url: 'https://api.github.com/users/aikefang',
    //         html_url: 'https://github.com/aikefang',
    //         followers_url: 'https://api.github.com/users/aikefang/followers',
    //         following_url:
    //           'https://api.github.com/users/aikefang/following{/other_user}',
    //         gists_url: 'https://api.github.com/users/aikefang/gists{/gist_id}',
    //         starred_url:
    //           'https://api.github.com/users/aikefang/starred{/owner}{/repo}',
    //         subscriptions_url: 'https://api.github.com/users/aikefang/subscriptions',
    //         organizations_url: 'https://api.github.com/users/aikefang/orgs',
    //         repos_url: 'https://api.github.com/users/aikefang/repos',
    //         events_url: 'https://api.github.com/users/aikefang/events{/privacy}',
    //         received_events_url: 'https://api.github.com/users/aikefang/received_events',
    //         type: 'User',
    //         site_admin: false,
    //         name: null,
    //         company: null,
    //         blog: '',
    //         location: null,
    //         email: null,
    //         hireable: null,
    //         bio: null,
    //         twitter_username: null,
    //         public_repos: 58,
    //         public_gists: 0,
    //         followers: 2,
    //         following: 0,
    //         created_at: '2016-08-17T08:59:34Z',
    //         updated_at: '2020-06-16T02:06:03Z' },
    //     id: '5ee7388859545aead05825a9' }
    // }
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
