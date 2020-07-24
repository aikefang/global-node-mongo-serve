module.exports = {
  apps : [
    {
      name: "node-mongo-services-timed-tasks",                   // 项目名
      script: "timed-tasks.js",               // 执行文件
      watch: true,                             // 是否监听文件变动然后重启
      // cwd: "./",
      exec_interpreter: "node",
      "log_date_format": "YYYY-MM-DD HH:mm Z",
      env_production: {
        // "PORT": 2020,
        "NODE_ENV": "production",
      },
      "ignore_watch": [                        // 不用监听的文件
        "node_modules",
        "logs",
        "tmp"
      ],
      "error_file": "/home/wwwroot/global-node-mongo-service/logs/err-timed-tasks.log",
      "out_file": "/home/wwwroot/global-node-mongo-service/logs/out-timed-tasks.log",
    }
  ]
}
