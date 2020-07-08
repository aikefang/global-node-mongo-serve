/**
 * 正则替换图片
 */
module.exports = (text) => {
  const reg = /<img/ig
  // 不包含图片的字符串不处理
  if (!reg.test(text)) {
    return text
  }
  let cont = text
  // 替换旧图片
  cont.replace(/(webascii\/old_pictures\/uploads\/)(.*?)(\.png|\.jpg)/g, (res, val1, val2, val3, index, content) => {
    if (res.indexOf('_s.png') >= 0) {
      cont = cont.replace(res, res.replace(val3, val3 + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80'))
    }
  })
  // 替换新图片
  cont.replace(/(webascii\/files\/)(.*?)(\.png|\.jpg)/g, (res, val1, val2, val3, index, content) => {
    cont = cont.replace(res, res.replace(val2 + val3, val2 + val3 + '?imageMogr2/auto-orient/strip/format/jpg/interlace/1/quality/80'))
  })
  return cont
}
