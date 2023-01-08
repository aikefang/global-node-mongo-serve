// const Common = require('../../lib/common')
var thrift = require('thrift');
const fs = require('fs');
const path = require('path');
var Justchat = require('../../lib/justchat/justchat');
var ttypes = require('../../lib/justchat/justchat_types');
const common = require('../../lib/common')
const upload = require('../../lib/upload')
const config = require('../../config/config')
const uuid = require('uuid')
const fnv = require('fnv-plus')

var transport = thrift.TBufferedTransport;
var protocol = thrift.TBinaryProtocol;

var connection = thrift.createConnection('42.192.199.72', 9900, {
  transport : transport,
  protocol : protocol
});

connection.on('error', function(err) {
  assert(false, err);
});

// Create a Calculator client with the connection
var client = thrift.createClient(Justchat, connection);
const QA_file = './lib/justchat/QA/QA3.txt'
const QA = fs.readFileSync(QA_file);

const product_str_file = './lib/justchat/productInfo/A6.CSV'
const product_str = fs.readFileSync(product_str_file);




class Controllers {
  async createRole(ctx) {
    const result = await client.create_role(JSON.stringify({
      rolename: '奥迪4S店导购员',
      prologue: '欢迎来到奥迪4S店，有什么需要帮您？',
      resumes: '30岁女士，经验丰富',
      knowledge: [{"content":product_str.toString(), "type": 'csv'}],
      QA: QA.toString(),
      expiration: 3600,
      language: 'zh-cn'
    }))
    const resultJSON = JSON.parse(result)
    const prologue = await client.get_prologue(JSON.stringify({
      roleid: resultJSON.roleid,
      voice: 'zh_Male'
    }))
    const prologueJSON = JSON.parse(prologue)
    const buff = new Buffer(prologueJSON.wavedata, 'base64')
    const v1 = uuid.v1()
    const hash = `${fnv.hash(v1, 64).str()}`
    const filePath = `${config.server.uploadCache}${hash}.wav`
    fs.writeFileSync(filePath, buff);
    const res = await upload({
      filename: hash + '.wav',
      path: filePath
    }, 'chat/voice/',{})
    const session = await client.create_session(JSON.stringify({
      roleid: resultJSON.roleid
    }))
    const sessionJSON = JSON.parse(session)
    ctx.body = {
      status: 200,
      message: 'ok',
      data: {
        sessionJSON,
        video: res,
        filePath,
        resultJSON,
        prologueJSON: {
          "code": prologueJSON.code,
          "prologue": prologueJSON.prologue
        },
      }
    }
  }
  // async get_prologue(ctx) {
  //   // console.log(new Common().demo)
  //   // console.log(this)
  //   // ctx.body = {
  //   //   test: new Common().demo.toString()
  //   // }
  // }
  // async create_session(ctx) {
  //   // console.log(new Common().demo)
  //   // console.log(this)
  //   // ctx.body = {
  //   //   test: new Common().demo.toString()
  //   // }
  // }
  async getAnswer(ctx) {
    const { question, sessionId } = ctx.request.body
    const session = await client.get_answer(JSON.stringify({
      sessionid: sessionId,
      prompt: question,
      voice: 'zh_male'
    }))
    const sessionJSON = JSON.parse(session)
    const buff = Buffer.from(sessionJSON.wavedatabs64, 'base64')
    const v1 = uuid.v1()
    const hash = `${fnv.hash(v1, 64).str()}`
    const filePath = `${config.server.uploadCache}${hash}.wav`
    fs.writeFileSync(filePath, buff);
    const res = await upload({
      filename: hash + '.wav',
      path: filePath
    }, 'chat/voice/',{})
    ctx.body = {
      status: 200,
      message: 'ok',
      data: {
        res,
        sessionJSON: {
          code: sessionJSON.code,
          answer: sessionJSON.answer,
          voicetext: sessionJSON.voicetext
        }
      }
    }
  }
}
module.exports = new Controllers()
