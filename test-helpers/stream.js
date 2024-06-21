'use strict'

const { EventEmitter } = require('events')

class Readable extends EventEmitter {
  pipe () {}
  read () {}
  destroy () {}
  get readable () {
    return true
  }

  get readableObjectMode () {
    return false
  }

  get destroyed () {
    return false
  }
}

module.exports = {
  Readable
}
