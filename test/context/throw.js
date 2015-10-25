
'use strict';

const context = require('../helpers/context');
const assert = require('assert');

describe('ctx.throw(msg)', () => {
  it('should set .status to 500', done => {
    const ctx = context();

    try {
      ctx.throw('boom');
    } catch (err) {
      assert(500 == err.status);
      assert(!err.expose);
      done();
    }
  });
});

describe('ctx.throw(err)', () => {
  it('should set .status to 500', done => {
    const ctx = context();
    const err = new Error('test');

    try {
      ctx.throw(err);
    } catch (err) {
      assert(500 == err.status);
      assert('test' == err.message);
      assert(!err.expose);
      done();
    }
  });
});

describe('ctx.throw(err, status)', () => {
  it('should throw the error and set .status', done => {
    const ctx = context();
    const error = new Error('test');

    try {
      ctx.throw(error, 422);
    } catch (err) {
      assert(422 == err.status);
      assert('test' == err.message);
      assert(true === err.expose);
      done();
    }
  });
});

describe('ctx.throw(status, err)', () => {
  it('should throw the error and set .status', done => {
    const ctx = context();
    const error = new Error('test');

    try {
      ctx.throw(422, error);
    } catch (err) {
      assert(422 == err.status);
      assert('test' == err.message);
      assert(true === err.expose);
      done();
    }
  });
});

describe('ctx.throw(msg, status)', () => {
  it('should throw an error', done => {
    const ctx = context();

    try {
      ctx.throw('name required', 400);
    } catch (err) {
      assert('name required' == err.message);
      assert(400 == err.status);
      assert(true === err.expose);
      done();
    }
  });
});

describe('ctx.throw(status, msg)', () => {
  it('should throw an error', done => {
    const ctx = context();

    try {
      ctx.throw(400, 'name required');
    } catch (err) {
      assert('name required' == err.message);
      assert(400 == err.status);
      assert(true === err.expose);
      done();
    }
  });
});

describe('ctx.throw(status)', () => {
  it('should throw an error', done => {
    const ctx = context();

    try {
      ctx.throw(400);
    } catch (err) {
      assert('Bad Request' == err.message);
      assert(400 == err.status);
      assert(true === err.expose);
      done();
    }
  });

  describe('when not valid status', () => {
    it('should not expose', done => {
      const ctx = context();

      try {
        const err = new Error('some error');
        err.status = -1;
        ctx.throw(err);
      } catch (err) {
        assert('some error' == err.message);
        assert(!err.expose);
        done();
      }
    });
  });
});

describe('ctx.throw(status, msg, props)', () => {
  it('should mixin props', done => {
    const ctx = context();

    try {
      ctx.throw(400, 'msg', { prop: true });
    } catch (err) {
      assert('msg' == err.message);
      assert(400 == err.status);
      assert(true === err.expose);
      assert(true === err.prop);
      done();
    }
  });

  describe('when props include status', () => {
    it('should be ignored', done => {
      const ctx = context();

      try {
        ctx.throw(400, 'msg', {
          prop: true,
          status: -1
        });
      } catch (err) {
        assert('msg' == err.message);
        assert(400 == err.status);
        assert(true === err.expose);
        assert(true === err.prop);
        done();
      }
    });
  });
});

describe('ctx.throw(msg, props)', () => {
  it('should mixin props', done => {
    const ctx = context();

    try {
      ctx.throw('msg', { prop: true });
    } catch (err) {
      assert('msg' == err.message);
      assert(500 == err.status);
      assert(false === err.expose);
      assert(true === err.prop);
      done();
    }
  });
});

describe('ctx.throw(status, props)', () => {
  it('should mixin props', done => {
    const ctx = context();

    try {
      ctx.throw(400, { prop: true });
    } catch (err) {
      assert('Bad Request' == err.message);
      assert(400 == err.status);
      assert(true === err.expose);
      assert(true === err.prop);
      done();
    }
  });
});

describe('ctx.throw(err, props)', () => {
  it('should mixin props', done => {
    const ctx = context();

    try {
      ctx.throw(new Error('test'), { prop: true });
    } catch (err) {
      assert('test' == err.message);
      assert(500 == err.status);
      assert(false === err.expose);
      assert(true === err.prop);
      done();
    }
  });
});
