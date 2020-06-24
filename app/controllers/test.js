const Common = require('../../lib/common')
class Controllers extends Common {
  async test(ctx) {
    console.log(new Common().demo)
    console.log(this)
    ctx.body = {
      test: new Common().demo.toString()
    }
  }
}
module.exports = new Controllers()
