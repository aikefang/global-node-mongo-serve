/**
 * 将'demo_dede'修改为'demoDede'
 * options.deleteParam {Array} 设置不需要输出的参数
 * 示例：options.deleteParam:['content','cTime']
 * @param obj
 * @returns {{}}
 */

class DealData {
  constructor() {
    this.cache = null
    this.options = null
  }
  stringToCamelCase(str) {
    // 子项()表示子项
    let reg = /_(\w)/g
    return str.replace(reg, ($0, $1) => {
      // $0代表正则整体，replace（）方法中的第二个参数若是回调函数，那么这个回调函数中的参数就是匹配成功后的结果
      // 若回调函数中有多个参数时，第一个参数代表整个正则匹配结果，第二个参数代表第一个子项
      return $1.toUpperCase()
    })
  }

  // 处理Array
  dealArray(globalData) {
    globalData.map((data, index, all) => {
      if (this.getType(data) == 1) {
        this.dealArray(data)
      } else if (this.getType(data) == 2) {
        this.dealObject(data)
      }
    })
  }

  // 处理object
  dealObject(data) {
    for (let item in data) {
      if (this.getType(data[item]) == 1) { // 是数组
        this.dealArray(data[item])
      } else if (this.getType(data[item]) == 2) { // 是对象
        this.dealObject(data[item])
      } else { // 处理数据
        // 需要删除字段
        if (this.goDelete) {
          // 匹配字段
          if (this.options.deleteParam.indexOf(item) > -1 || this.options.deleteParam.indexOf(this.stringToCamelCase(item)) > -1) {
            // 删除字段
            delete data[item]
          } else { // 没有匹配到字段
            if (/_/g.test(item)){
              data[this.stringToCamelCase(item)] = data[item]
              delete data[item]
            }
          }
        } else { // 不需要删除字段
          // 只对驼峰字段进行处理
          if (/_/g.test(item)) {
            data[this.stringToCamelCase(item)] = data[item]
            delete data[item]
          }
        }
      }
    }
  }

  // 获取类型
  getType(data) {
    // 如果是数组
    if (Object.prototype.toString.call(data) == '[object Array]') {
      return 1
    }
    // 如果是对象
    if (Object.prototype.toString.call(data) == '[object Object]') {
      return 2
    }
    return 3
  }

 init(arr, options) {
    this.cache = arr
    this.options = options || {}
    // 判断是否有需要删除的字段 true：有， false：没有
    this.goDelete = !!this.options.deleteParam && this.getType(this.options.deleteParam) == 1 && this.options.deleteParam.length > 0
    if (this.getType(this.cache) == 1) {
      this.cache.map((data, index, all) => {
        // 如果是数组
        if (this.getType(data) == 1) {
          this.dealArray(data)
        }
        // 如果是对象
        if (this.getType(data) == 2) {
          this.dealObject(data)
        }
      })
    } else if (this.getType(this.cache) == 2) {
      this.dealObject(this.cache)
    }
    return this.cache
  }
}

let dealData = new DealData()
module.exports = (arr, options) => {
  return dealData.init(arr, options)
}
