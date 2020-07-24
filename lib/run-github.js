/**
 * 获取github内容
 */
const gitUser = 'aikefang'
const gitProject = 'suchaxun-doc'

const {requestGitHubGet} = require('../lib/request')


const docModel = require('../app/models/doc/doc')
// const common = require('../../lib/common')

const getAllCommit = async (path) => {
  // https://api.github.com/repos/aikefang/suchaxun-doc/commits?path=linux/ab3.md&per_page=100&page=1

  const arr = []
  let page = 1

  const fn = async () => {
    const res = await requestGitHubGet(`/repos/${gitUser}/${gitProject}/commits`, {
      path: path + '.md',
      per_page: 100,
      page: 1
    }).catch(e => console.log(e))
    // 请求成功
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

/**
 * @param list {Array} ['path', 'path']
 * @param errorCallback {Function}
 * @param successCallback {Function}
 * @returns {Promise.<void>}
 */
module.exports = async ({list, errorCallback = () => {}, successCallback = () => {}}) => {
  for (let i = 0; i < list.length; i++) {
    const res = await requestGitHubGet(`/repos/${gitUser}/${gitProject}/contents/${list[i]}`).catch(e => console.log(e))
    // 请求失败
    if (!res) {
      errorCallback(list[i])
      // 请求失败 需要记录log
      continue
    } else { // 请求成功
      successCallback(list[i])
    }
    const content = new Buffer(res.content, 'base64').toString()
    const noMdPath = list[i].replace('.md', '')
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
