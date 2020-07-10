const categoryModel = require('../../models/biji/category')
const humb = require('../../../lib/hump')
const _ = require('lodash')
const logModel = require('../../models/log')
const common = require('../../../lib/common')
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
    const list = await common.cacheData({
      cacheType: 'hot-category',
      async fn() {
        let aggCategory = await logModel.aggregate([
          {
            $match: {
              type: 'category-view'
            },
          },
          {
            $project: {
              'data': 1
            },
          },
          {
            $group: {
              _id: '$data.levelSecond',
              count: {$sum: 1}, // 统计总数量
            }
          },
          {
            $sort: {count: -1}// 根据date排序
          },
          {
            $limit: 10
          }
        ])

        const res = await categoryModel.find(
          {
            $or: aggCategory.map(data => {
              return {
                _id: data._id
              }
            })
          }, {
            _id: 1,
            title: 1,
            seo: 1,
          }
        )
          .populate('parent', {
            _id: 1,
            title: 1,
            seo: 1,
          })
          .lean()
        const categoryObj = {}
        res.forEach(data => categoryObj[data._id] = data)
        const list = []
        aggCategory.forEach(data => list.push(categoryObj[data._id.toString()]))

        return list
      },
      updateMillisecond: 1000 * 60 * 60 * 2
      // updateMillisecond: 1000 * 6
    })

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        list
      }
    }
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
