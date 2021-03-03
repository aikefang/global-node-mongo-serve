const fs = require('fs')

module.exports = (originBuffer) => {
  return new Promise((resolve, reject) => {
    console.log(Buffer.isBuffer(originBuffer))
    // // 生成图片2(把buffer写入到图片文件)
    // fs.writeFile('./public/images/avatar2.jpg', originBuffer, (err) => {
    //   if(err) {console.log(err)}
    // });

    const base64Img = originBuffer.toString('base64')  // base64图片编码字符串

    console.log(base64Img)

    const decodeImg = Buffer.from(base64Img, 'base64') // new Buffer(string, encoding)

    console.log(Buffer.compare(originBuffer, decodeImg))  // 0 表示一样
    // 生成图片3(把base64位图片编码写入到图片文件)
    fs.writeFile('./tmp/aaa.jpg', decodeImg, (err) => {
      if(err) {
        console.log(err)
        reject(err)
      }
      resolve({

      })
    })
  })
}
