/**
 * 简化数字
 */
module.exports = (num) => {
  if (num >= 0 && num <= 999) {
    return num + ''
  } else if (num > 999 && num <= 9999) {
    let n = parseFloat((num/1000).toString().match(/^\d+(?:\.\d{0,1})?/)) + 'k'
    if (num > 1000) {
      n = n + '+'
    }
    return n
  } else if (num > 9999) {
    let n = parseFloat((num/10000).toString().match(/^\d+(?:\.\d{0,1})?/)) + 'w'
    if (num%1000 > 0) {
      n = n + '+'
    }
    return n
  }
}
