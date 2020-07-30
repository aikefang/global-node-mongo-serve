/**
 * 获取github内容
 */
const gitUser = 'aikefang'
const gitProject = 'suchaxun-doc'

const {requestGitHubGet} = require('../lib/request')


const docModel = require('../app/models/doc/doc')
const docCommitModel = require('../app/models/doc/doc-commit')
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
    const firstPath = pathArr[0]

    // 检查是否为新数据 Start
    const hasData = await docModel.findOne({
      path: noMdPath
    }, {
      _id: 1
    })
    let otherData = {}
    // 更新数据
    if (hasData) {
      otherData.mTime = new Date()
    } else { // 新增数据
      otherData.cTime = new Date()
      otherData.views = 0
      otherData.path = noMdPath
      otherData.title = lastPath
      otherData.category = firstPath
    }
    // 检查是否为新数据 End

    // 更新或者新增
    await docModel.updateOne(
      {
        path: noMdPath
      },
      {
        $set: {
          markdown: content,
          ...otherData
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
    const docCommitData = await docCommitModel.updateOne(
      {
        path: noMdPath
      },
      {
        $set: {
          path: noMdPath,
          commit: commits
        }
      },
      {
        upsert: false,
        new: true
      }
    )

    // 添加id到doc表
    await docModel.updateOne(
      {
        path: noMdPath
      },
      {
        $set: {
          commits: docCommitData._id
        }
      },
      {
        upsert: false,
        new: true
      }
    )
  }
}
