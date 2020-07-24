const docModel = require('../models/doc/doc')
const common = require('../../lib/common')

const {requestGitHubGet} = require('../../lib/request')

const gitUser = 'aikefang'
const gitProject = 'suchaxun-doc'


const getAllCommit = async (path) => {
  // https://api.github.com/repos/aikefang/suchaxun-doc/commits?path=linux/ab3.md&per_page=100&page=1

  const arr = []
  let page = 1

  const fn = async () => {
    const res = await requestGitHubGet(`/repos/${gitUser}/${gitProject}/commits`, {
      path: path,
      per_page: 100,
      page: 1
    }).catch(e => console.log(e))
    if (Array.isArray(res)) {
      arr.push(...res)
      if (res.length === 100) {
        page++
        await fn()
      }
    }
  }

  await fn()

  return arr
}

module.exports = {
  async github(ctx) {
    ctx.body = 200
    // 只处理master分支变更
    if (ctx.request.body.ref === 'refs/heads/master') {
      // common.log('github-hook-data', ctx.request.body)

      // 获取文件内容
      // https://api.github.com/repos/aikefang/suchaxun-doc/contents/linux/ab.md

      // 获取文件提交记录
      // https://api.github.com/repos/aikefang/suchaxun-doc/commits?path=linux/ab3.md&per_page=100&page=1

      const commit = ctx.request.body.commits

      const filePath = []

      commit.forEach(data => {
        // 当前提交有新增文件
        if (data.added.length > 0) {
          data.added.forEach(addData => {
            if (/(.md)$/.test(addData)) {
              filePath.push(addData)
            }
          })
        }

        // 当前提交有修改文件
        if (data.modified.length > 0) {
          data.modified.forEach(modifiedData => {
            if (/(.md)$/.test(modifiedData)) {
              filePath.push(modifiedData)
            }
          })
        }
      })

      // 去重
      const filterPath = [...new Set(filePath)]


      for (let i = 0; i < filterPath.length; i++) {
        const res = await requestGitHubGet(`/repos/${gitUser}/${gitProject}/contents/${filterPath[i]}`).catch(e => console.log(e))
        if (!res) {
          common.log('github-request-path-error', filterPath[i])
          // 请求失败 需要记录log
          continue
        }
        const content = new Buffer(res.content, 'base64').toString()
        const noMdPath = filterPath[i].replace('.md', '')
        const pathArr = noMdPath.split('/')
        const lastPath = pathArr[pathArr.length - 1]

        // 更新或者新增
        await docModel.updateOne(
          {
            path: noMdPath
          },
          {
            $set: {
              title: lastPath,
              path: noMdPath,
              markdown: content,
            }
          },
          {
            upsert: true,
            new: true
          }
        )

        // 获取当前文件所有提交记录
        const commits = await getAllCommit(noMdPath)

        // 更新提交记录
        await docModel.updateOne(
          {
            path: noMdPath
          },
          {
            $set: {
              commit: commits
            }
          },
          {
            upsert: false,
            new: true
          }
        )
      }
    }

  }
}
