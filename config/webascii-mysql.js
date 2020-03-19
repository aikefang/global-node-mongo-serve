const config = require('./config')
// log颜色
const chalk = require('chalk')
// mysql数据库
const webasciiMysql = require('mysql')
let connection = webasciiMysql.createConnection({
  host: config.mysql.webascii.host,
  user: config.mysql.webascii.user,
  password: config.mysql.webascii.password,
  database: config.mysql.webascii.database,
  multipleStatements: config.mysql.webascii.multipleStatements
})
connection.connect((err) => {
  if (err) {
    console.log('webascii MySql => ', chalk.yellow(`连接失败`))
  } else {
    console.log(chalk.green('webascii MySql =>'), chalk.yellow(`连接成功`))
  }
})

exports.connection = connection
