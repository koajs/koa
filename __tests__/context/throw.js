
'use strict'

const context = require('../../test-helpers/context')
const assert = require('assert')

describe('ctx.throw(msg)', () => {
  it('should set .status to 500', () => {
    const ctx = context()

    try {
      ctx.throw('boom')
    } catch (err) {
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.expose, false)
    }
  })
})

describe('ctx.throw(err)', () => {
  it('should set .status to 500', () => {
    const ctx = context()
    const err = new Error('test')

    try {
      ctx.throw(err)
    } catch (err) {
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.message, 'test')
      assert.strictEqual(err.expose, false)
    }
  })
})

describe('ctx.throw(err, status)', () => {
  it('should throw the error and set .status', () => {
    const ctx = context()
    const error = new Error('test')

    try {
      ctx.throw(error, 422)
    } catch (err) {
      assert.strictEqual(err.status, 422)
      assert.strictEqual(err.message, 'test')
      assert.strictEqual(err.expose, true)
    }
  })
})

describe('ctx.throw(status, err)', () => {
  it('should throw the error and set .status', () => {
    const ctx = context()
    const error = new Error('test')

    try {
      ctx.throw(422, error)
    } catch (err) {
      assert.strictEqual(err.status, 422)
      assert.strictEqual(err.message, 'test')
      assert.strictEqual(err.expose, true)
    }
  })
})

describe('ctx.throw(msg, status)', () => {
  it('should throw an error', () => {
    const ctx = context()

    try {
      ctx.throw('name required', 400)
    } catch (err) {
      assert.strictEqual(err.message, 'name required')
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.expose, true)
    }
  })
})

describe('ctx.throw(status, msg)', () => {
  it('should throw an error', () => {
    const ctx = context()

    try {
      ctx.throw(400, 'name required')
    } catch (err) {
      assert.strictEqual(err.message, 'name required')
      assert.strictEqual(400, err.status)
      assert.strictEqual(true, err.expose)
    }
  })
})

describe('ctx.throw(status)', () => {
  it('should throw an error', () => {
    const ctx = context()

    try {
      ctx.throw(400)
    } catch (err) {
      assert.strictEqual(err.message, 'Bad Request')
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.expose, true)
    }
  })

  describe('when not valid status', () => {
    it('should not expose', () => {
      const ctx = context()

      try {
        const err = new Error('some error')
        err.status = -1
        ctx.throw(err)
      } catch (err) {
        assert.strictEqual(err.message, 'some error')
        assert.strictEqual(err.expose, false)
      }
    })
  })
})

describe('ctx.throw(status, msg, props)', () => {
  it('should mixin props', () => {
    const ctx = context()

    try {
      ctx.throw(400, 'msg', { prop: true })
    } catch (err) {
      assert.strictEqual(err.message, 'msg')
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.expose, true)
      assert.strictEqual(err.prop, true)
    }
  })

  describe('when props include status', () => {
    it('should be ignored', () => {
      const ctx = context()

      try {
        ctx.throw(400, 'msg', {
          prop: true,
          status: -1
        })
      } catch (err) {
        assert.strictEqual(err.message, 'msg')
        assert.strictEqual(err.status, 400)
        assert.strictEqual(err.expose, true)
        assert.strictEqual(err.prop, true)
      }
    })
  })
})

describe('ctx.throw(msg, props)', () => {
  it('should mixin props', () => {
    const ctx = context()

    try {
      ctx.throw('msg', { prop: true })
    } catch (err) {
      assert.strictEqual(err.message, 'msg')
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.expose, false)
      assert.strictEqual(err.prop, true)
    }
  })
})

describe('ctx.throw(status, props)', () => {
  it('should mixin props', () => {
    const ctx = context()

    try {
      ctx.throw(400, { prop: true })
    } catch (err) {
      assert.strictEqual(err.message, 'Bad Request')
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.expose, true)
      assert.strictEqual(err.prop, true)
    }
  })
})

describe('ctx.throw(err, props)', () => {
  it('should mixin props', () => {
    const ctx = context()

    try {
      ctx.throw(new Error('test'), { prop: true })
    } catch (err) {
      assert.strictEqual(err.message, 'test')
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.expose, false)
      assert.strictEqual(err.prop, true)
    }
  })
})
