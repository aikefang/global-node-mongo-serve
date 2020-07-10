const categoryModel = require('../../models/biji/category')
const humb = require('../../../lib/hump')
const _ = require('lodash')
const logModel = require('../../models/log')
module.exports = {
  async list(ctx, next) {
    let pageSize = parseInt(ctx.request.query.pageSize, 10) || 10
    let pageNum = parseInt(ctx.request.query.pageNum, 10) || 1

    const type = ctx.request.query.type || 'all'

    if (['hot', 'all'].indexOf(type) < 0) {
      return ctx.body = {
        status: 500003,
        message: 'type => [hot, all]',
        data: {}
      }
    }

    let categoryList = null

    const params = {
      is_enable: 1
    }

    if (type === 'hot') {
      params.parent_id = {
        $ne: 0
      }
      params.hot = 1
      categoryList = await categoryModel.find(params)
        .sort({
          sort_index: -1
        })
        .populate('parent', {
          id: 1,
          _id: 1,
          title: 1,
          is_enable: 1,
          parent: 1,
          parent_id: 1,
          seo: 1,
        })
        .lean()
    } else {
      params.parent_id = 0
      params.hot = 0
      categoryList = await categoryModel.find(params)
        .sort({
          sort_index: -1
        })
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .lean()
    }

    const list = humb(categoryList)

    const parentIds = list.map(data => data._id.toString())

    if (type === 'all') {
      let childAll = await categoryModel.find({
        is_enable: 1,
        parent: {
          $in: parentIds
        }
      })
        .lean()
      childAll = humb(childAll)
      const childGroup = _.groupBy(childAll, 'parent')
      list.forEach(data => {
        data.children = []
        if (childGroup[data._id]) {
          data.children.push(...childGroup[data._id])
        }
      })
    }

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        list
      }
    }
  },
  // 热搜分类
  async hotSearch(ctx) {

  },
  async redirect(ctx) {
    let ids = ctx.request.query['ids[]']
    if (!Array.isArray(ids)) {
      ids = [ids]
    }

    const ca = await categoryModel.find({
      id: {
        $in: ids
      }
    })
      .lean()

    const redirect = {}
    ca.forEach(data => {
      redirect[data.id] = data.seo
    })

    ctx.body = {
      status: 200,
      massage: 'success',
      data: {
        needRedirect: ca.length > 0,
        redirect
      }
    }
  }
}
