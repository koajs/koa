'use strict';

const request = require('supertest');
const assert = require('assert');
const Koa = require('../..');

describe('app.wrap', () => {
  it('should wrap mw correctly', done => {
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
    })

    app.use((ctx, next) => {
      wrapped.push('middleware 2')
      return next()
    })

    request(app.listen())
      .get('/')
      .end(() => {
        wrapped.should.eql([
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

  it ('should not wrap when mw is dewrapped', done => {
    const app = new Koa();
    const wrapped = [];

    app.wrappers = [(ctx, next) => {
      wrapped.push('pre');
      return next().then(() => {
        wrapped.push('post');
      });
    }]

    app.use((ctx, next) => {
      wrapped.push('middleware 1');
      return next();
    }).dewrap();

    app.use((ctx, next) => {
      wrapped.push('middleware 2');
      return next();
    }).dewrap();

    request(app.listen())
      .get('/')
      .end(() => {
        wrapped.should.eql(['middleware 1', 'middleware 2']);
        done();
      });
  })

  it ('should not wrap when app.wrappers is false', done => {
    const app = new Koa();
    const wrapped = [];
    app.wrappers = false;

    app.use((ctx, next) => {
      wrapped.push('middleware 1');
      return next();
    })

    request(app.listen())
      .get('/')
      .end(() => {
        wrapped.should.eql(['middleware 1']);
        done();
      });
  })

  it ('app.wrap() should wrap with provided wrappers', done => {
    const app = new Koa();
    const wrapped = [];

    const profiler = (ctx, next) => {
      wrapped.push('profiler pre');
      return next().then(() => {
        wrapped.push('profiler post');
      });
    }

    app.wrappers = [(ctx, next) => {
      wrapped.push('should not wrap mw1');
      return next().then(() => {
        wrapped.push('should not wrap mw1');
      });
    }]

    app.use((ctx, next) => {
      wrapped.push('middleware 1')
      return next();
    }).wrap([profiler])

    app.use((ctx, next) => {
      wrapped.push('middleware 2')
      return next()
    })

    request(app.listen())
      .get('/')
      .end(() => {
        wrapped.should.eql([
          'profiler pre',
          'middleware 1',
          'should not wrap mw1',
          'middleware 2',
          'should not wrap mw1',
          'profiler post'
        ])
        done();
      });
  })
})
