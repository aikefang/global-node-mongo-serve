let minute = 1000 * 60;
let hour = minute * 60;
let day = hour * 24;
let week = day * 7;
let month = day * 30;
let year = day * 365;
let getTimer = (stringTime, text) => {
  let time1 = new Date().getTime();//当前的时间戳
  let time2 = Date.parse(new Date(stringTime));//指定时间的时间戳
  let time = time1 - time2;

  let result = null;
  if (time < 0) {
    result = "设置的时间不能早于当前时间！";
  }else if (time / year >= 1) {
    result = `${text}于${parseInt(time / year)}年前`;
  } else if (time / month >= 1) {
    result = `${text}于${parseInt(time / month)}月前`;
  } else if (time / week >= 1) {
    result = `${text}于${parseInt(time / week)}周前`;
  } else if (time / day >= 1) {
    result = `${text}于${parseInt(time / day)}天前`;
  } else if (time / hour >= 1) {
    result = `${text}于${parseInt(time / hour)}小时前`;
  } else if (time / minute >= 1) {
    result = `${text}于${parseInt(time / minute)}分钟前`;
  } else {
    result = `刚刚${text}！`;
  }
  return result
}
/**
 *
 * @param time 时间
 * @returns {string}
 */
// 定时任务自动删除缓存文件
module.exports = (time, text) => {
  if (!time) {
    return ''
  }
  return getTimer(time, text)
}