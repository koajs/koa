
'use strict';

const request = require('supertest');
const assert = require('assert');
const Koa = require('../..');

describe('app', () => {
  it('should wrap mw correctly', done => {
    const app = new Koa();
    const composed = []

    app.wrappers = [(ctx, next) => {
      composed.push('pre');
      return next().then(() => {
        composed.push('post')
      })
    }]

    app.use((ctx, next) => {
      composed.push('middleware 1')
      return next()
    })

    app.use((ctx, next) => {
      composed.push('middleware 2')
      return next()
    })

    request(app.listen())
      .get('/')
      .end(() => {
        composed.should.eql([
          'pre',
          'middleware 1',
          'pre',
          'middleware 2',
          'post',
          'post'
        ])
        done();
      });
  })

  it ('should not wrap when opts.wrappers = false', done => {
    const app = new Koa();
    const wrapped = []

    app.wrappers = [(ctx, next) => {
      wrapped.push('pre');
      return next().then(() => {
        wrapped.push('post')
      })
    }]

    app.use((ctx, next) => {
      wrapped.push('middleware 1')
      return next()
    }, { wrappers: false })

    app.use((ctx, next) => {
      wrapped.push('middleware 2')
      return next()
    }, { wrappers: false })

    request(app.listen())
      .get('/')
      .end(() => {
        wrapped.should.eql(['middleware 1', 'middleware 2'])
        done();
      });
  })

  it ('should not wrap when app.wrappers is false', done => {
    const app = new Koa();
    const wrapped = [];
    app.wrappers = false;

    app.use((ctx, next) => {
      wrapped.push('middleware 1')
      return next()
    })

    request(app.listen())
      .get('/')
      .end(() => {
        wrapped.should.eql(['middleware 1'])
        done();
      });
  })

  it ('should wrap with provided opts.wrappers', done => {
    const app = new Koa();
    const wrapped = []

    const profiler = (ctx, next) => {
      wrapped.push('profiler pre');
      return next().then(() => {
        wrapped.push('profiler post')
      })
    }

    app.wrappers = [(ctx, next) => {
      wrapped.push('should not wrap pre');
      return next().then(() => {
        wrapped.push('should not wrap post')
      })
    }]

    app.use((ctx, next) => {
      wrapped.push('middleware 1')
      return next()
    }, {
      wrappers: [profiler]
    })

    app.use((ctx, next) => {
      wrapped.push('middleware 2')
      return next()
    }, { wrappers: false })

    request(app.listen())
      .get('/')
      .end(() => {
        wrapped.should.eql([
          'profiler pre',
          'middleware 1',
          'middleware 2',
          'profiler post'
        ])
        done();
      });
  })

  it('should handle socket errors', done => {
    const app = new Koa();

    app.use((ctx, next) => {
      // triggers ctx.socket.writable == false
      ctx.socket.emit('error', new Error('boom'));
    });

    app.on('error', err => {
      err.message.should.equal('boom');
      done();
    });

    request(app.listen())
      .get('/')
      .end(() => {});
  });

  it('should not .writeHead when !socket.writable', done => {
    const app = new Koa();

    app.use((ctx, next) => {
      // set .writable to false
      ctx.socket.writable = false;
      ctx.status = 204;
      // throw if .writeHead or .end is called
      ctx.res.writeHead =
      ctx.res.end = () => {
        throw new Error('response sent');
      };
    });

    // hackish, but the response should occur in a single tick
    setImmediate(done);

    request(app.listen())
      .get('/')
      .end(() => {});
  });

  it('should set development env when NODE_ENV missing', () => {
    const NODE_ENV = process.env.NODE_ENV;
    process.env.NODE_ENV = '';
    const app = new Koa();
    process.env.NODE_ENV = NODE_ENV;
    assert.equal(app.env, 'development');
  });
});
