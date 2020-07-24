const config = require('./config/config')

// log颜色
const chalk = require('chalk')
// mongo数据库
const mongoose = require('mongoose')
global.db = mongoose.createConnection(
  config.mongo.url,
  config.mongo.options,
  (err) => {
    if (err) {
      console.log('mongo => ', chalk.yellow(`连接失败`))
    } else {
      console.log(chalk.green('MongoDB =>'), chalk.yellow(`连接成功`))
    }
  })

// 获取文件列表
const fileList = require('get-file-list')
// 获取文件列表
fileList.config({
  path: './timed-tasks', // 绝对路径
  type: '.js', // 允许遍历的文件类型（详情请查看下文文档）
})
fileList.run().then(data => {
  data.forEach(path => {
    require(path)()
  })
})