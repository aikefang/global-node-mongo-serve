const common = require('../../lib/common')
const upload = require('../../lib/upload')
// const bufferToImage = require('../../lib/bufferToImage')
const uuid = require('node-uuid')
const fnv = require('fnv-plus')
const sharp = require('sharp')
const TextToSVG = require('text-to-svg')
module.exports = {
  async compositing(ctx) {
    const {background, files} = ctx.req.files
    // const {
    //   backgroundOptions = {
    //     width: 100
    //   }
    // } = ctx.req.body
    console.log(typeof backgroundOptions)

    // // 创建圆形SVG，用于实现头像裁剪
    // const roundedCorners = Buffer.from(
    //   '<svg><circle r="90" cx="90" cy="90"/>222</svg>'
    // );

    const textToSVG = TextToSVG.loadSync();

    const textSVG = Buffer.from(textToSVG.getSVG('重要通知', {
      x: 0, y: 0, fontSize: 26, anchor: 'top', attributes: {
        fill: '#FFFFFF',
        // stroke: '#FFFFFF'
      }
    }))
    const textSVG2 = Buffer.from(textToSVG.getSVG('今晚一起看文档', {
      x: 0, y: 0, fontSize: 26, anchor: 'top', attributes: {
        fill: '#24bede',
        // stroke: '#FFFFFF'
      }
    }))
    const textSVG3 = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">` + textToSVG.getSVG('不见不散', {
      x: 0, y: 0, fontSize: 26, anchor: 'top', attributes: {
        fill: '#24bede',
        // stroke: '#FFFFFF'
      }
    }))
    // console.log(`<?xml version="1.0" encoding="UTF-8"?>` + textToSVG.getSVG('不见不散', {
    //   x: 0,
    //   y: 0,
    //   fontSize: 26,
    //   anchor: 'top',
    //   attributes: {
    //     fill: '#24bede',
    //     // stroke: '#FFFFFF'
    //   },
    //   encoding: 'UTF-8'
    // }))


    const resMini2 = await sharp(files[1].path)
      .resize(50)
      .png({quality: 100})
      .toBuffer()

    const resMini1 = await sharp(files[0].path)
      .resize(40)
      .png({quality: 100})
      .toBuffer()

    const v1 = uuid.v1()
    const hash = `${fnv.hash(v1, 64).str()}`
    const res = await sharp(background[0].path)
      .resize(600)
      .flatten({background: '#ff6600'})
      .composite([
        {
          input: resMini1,
          top: 25,
          left: 210
        },
        {
          input: resMini2,
          top: 20,
          left: 20
        },
        {
          input: textSVG,
          top: 32,
          left: 265
        },
        {
          input: textSVG2,
          top: 150,
          left: 225
        },
        // {
        //   input: textSVG3,
        //   top: 220,
        //   left: 265
        // },
      ])
      .jpeg({quality: 100})
      // .toFile(`./tmp/${hash}-${backgroundWidth}.jpg`)
      .toFile(`./tmp/111.jpg`)


    console.log(res)

    ctx.body = {
      ...ctx.req.body,
      ...res
    }
    // .toBuffer()
    // .then(async (outputBuffer) => {
    //   console.log(outputBuffer)
    //   await bufferToImage(outputBuffer)
    //   ctx.body = {}
    //   // outputBuffer contains upside down, 300px wide, alpha channel flattened
    //   // onto orange background, composited with overlay.png with SE gravity,
    //   // sharpened, with metadata, 90% quality WebP image data. Phew!
    // })


    // const res = await upload(file, 'webascii/files/', {
    //   size: true,
    // })
    // if (!res) {
    //   return ctx.body = {
    //     status: 400001,
    //     message: '文件上传失败',
    //     data: {}
    //   }
    // }
    // ctx.body = {
    //   status: 200,
    //   message: '上传成功',
    //   file: file.files
    //   // link: res.path,
    //   // data: res
    // }
  }
}
