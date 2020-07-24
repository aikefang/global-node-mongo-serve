const logModel = require('../app/models/log')

const runGithub = require('../lib/run-github')

const schedule = require('node-schedule')

const fn = async () => {

  // 定时任务 30秒一次
  schedule.scheduleJob('30 * * * * *', async () => {
    console.log(new Date())
    const res = await logModel.find({
      type: 'github-request-path-error'
    })

    // 没有数据不执行
    if (res.length === 0) {
      return
    }

    const list = res.map(data => data.data)

    runGithub({
      list,
      successCallback(path) {
        logModel.remove({
          type: 'github-request-path-error',
          data: path
        }, (data) => {
          console.log(data)
        })
      }
    })
  })

}


// exports = fn

module.exports = fn