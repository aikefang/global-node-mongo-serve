const categoryModel = require('../../models/biji/category')
const articleModel = require('../../models/biji/article')
const bookModel = require('../../models/book/book')
module.exports = {
  async map(ctx, next) {
    const list = [
      {
        title: '笔记网_学的不仅是实战，更是经验!',
        link: '/'
      },
      {
        title: '笔记网技术文档_全部文档_webascii.cn',
        link: '/category/'
      },
      {
        title: '前端书籍PDF_webascii.cn',
        link: '/book/'
      }
    ]

    // 分类 Start
    const categoryList = await categoryModel.find(
      {
        is_enable: 1,
        parent_id: {
          $ne: 0
        }
      },
      {
        _id: 0,
        title: 1,
        seo: 1,
      }
    )
      .sort({
        sort_index: -1
      })
      .populate('parent', {
        _id: 0,
        title: 1,
        parent: 1,
        seo: 1,
      })
      .lean()
    const categoryChildren = []
    const categoryParent = {}
    categoryList.forEach(data => {
      categoryParent[data.parent.seo] = {
        title: `${data.parent.title}技术文档_笔记网_webascii.cn`,
        link: `/category/${data.parent.seo}/`
      }
      categoryChildren.push({
        title: `${data.parent.title}_${data.title}技术文档_笔记网_webascii.cn`,
        link: `/category/${data.parent.seo}/${data.seo}/`
      })
    })

    for (let item in categoryParent) {
      list.push(categoryParent[item])
    }

    list.push(...categoryChildren)
    // 分类 End


    // 文章 Start
    const articleList = await articleModel
      .find(
        {
          is_enable: 1,
        },
        {
          title: 1,
        }
      )
      .sort({
        c_time: -1
      })
      .lean()

    articleList.forEach(data => {
      list.push({
        title: `${data.title}技术文档_webascii.cn`,
        link: `/article/${data._id}/`
      })
    })
    // 文章 End


    // PDF Start
    const bookList = await bookModel
      .find(
        {
          isEnable: 1,
        },
        {
          title: 1,
          bookName: 1,
        }
      )
      .lean()

    bookList.forEach(data => {
      list.push({
        title: `${data.bookName}_pdf_下载_webascii.cn`,
        link: `/book/${data._id}/`
      })
    })
    // PDF End

    ctx.body = {
      status: 200,
      message: '成功',
      data: {
        list
      }
    }
  }
}
