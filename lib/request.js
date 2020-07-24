let axios = require('axios')
const config = require('../config/config')

exports.requestPost = async (url, params = {}) => {
  // return new Promise((resolve, reject) => {
  //   httpRequest({
  //     timeout: 5000, // 设置超时
  //     method: 'POST',
  //     url: url,
  //     headers: {
  //       "content-type": "application/json"
  //     },
  //     // 参数，注意get和post的参数设置不一样 get:qs,post:body
  //     body: {
  //       ...params
  //     },
  //     json: true      //这个针对body是不是支持json
  //
  //   }, (error, response, body) => {
  //     if (!error) {
  //       resolve(body)
  //     } else {
  //       resolve(false)
  //     }
  //   })
  // })
}

exports.requestGet = async (url, params = {}) => {
  // return new Promise((resolve, reject) => {
  //   httpRequest({
  //     timeout: 5000, // 设置超时
  //     method: 'GET',
  //     url: url,
  //     headers: {
  //       "content-type": "application/json",
  //     },
  //     // 参数，注意get和post的参数设置不一样 get:qs,post:body
  //     qs: {
  //       ...params
  //     },
  //     json: true // 这个针对body是不是支持json
  //
  //   }, (error, response, body) => {
  //     console.log(error)
  //     if (!error) {
  //       resolve(body)
  //     } else {
  //       resolve(false)
  //     }
  //   })
  // })
}
exports.requestGitHubGet = async (url, params = {}) => {
  return new Promise((resolve, reject) => {
    axios({
      timeout: 5000, // 设置超时
      method: 'GET',
      url: 'https://api.github.com' + url,
      headers: {
        // "content-type": "application/x-www-form-urlencoded",
        'Authorization': `Bearer ${config.github.token}`
      },
      // 参数，注意get和post的参数设置不一样 get:qs,post:body
      params: {
        access_token: config.github.token,
        ...params
      },
      // json: true // 这个针对body是不是支持json

    }
    )
      .then((response) => {
        if (response.status === 200) {
          resolve(response.data)
        } else {
          resolve(false)
        }
      })
      .catch((error) => {
        resolve(false)
      })
  })
}
