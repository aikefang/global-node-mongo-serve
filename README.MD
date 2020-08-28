# 安装
```
npm install supervisor -g
npm install
```
#使用
```
npm run dev
```
# 浏览器访问
### http://localhost:2020/

# Rrror status
* 200 成功
* 200000 用户不存在
* 200001 用户未登录
* 200002 用户账号或密码错误
* 200003 数据已存在
* 200004 数据不存在
* 200005 无权限
* 200100 微信登录失败

* 300001 数量超出限制

* 400001 文件上传失败

* 500000 系统错误
* 500001 未知错误
* 500002 缺少参数
* 500003 参数错误



# log日志类型
* article-view 文章访问
* category-view 分类访问
* search-key 搜索词
* github-hook-data github hook请求数据
* github-request-path-error github hook接口请求路径拿内容接口报错
* find-icon-error 在添加新的文档前查询分类，未查询到相关分类错误
* xcx-article-view 小程序文章预览

# 日志类型




