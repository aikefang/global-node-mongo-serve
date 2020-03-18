module.exports = {
  apps : [
    {
      name: "node-mongo-services",                   // 项目名
      script: "./bin/server.js",               // 执行文件
      watch: true,                             // 是否监听文件变动然后重启
      env_production: {
        "PORT": 2020,
        "NODE_ENV": "production",
      },
      "ignore_watch": [                        // 不用监听的文件
        "node_modules",
        "logs"
      ],
    }
  ]
}
