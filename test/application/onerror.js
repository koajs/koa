
'use strict';

const assert = require('assert');
const Koa = require('../..');
const mm = require('mm');

describe('app.onerror(err)', () => {
  afterEach(mm.restore);

  it('should throw an error if a non-error is given', () => {
    const app = new Koa();

    assert.throws(() => {
      app.onerror('foo');
    }, TypeError, 'non-error thrown: foo');
  });

  it('should accept errors coming from other scopes', () => {
    const ExternError = require('vm').runInNewContext('Error');

    const app = new Koa();
    const error = Object.assign(new ExternError('boom'), {
      status: 418,
      expose: true
    });

    assert.doesNotThrow(() => app.onerror(error));
  });

  it('should do nothing if status is 404', () => {
    const app = new Koa();
    const err = new Error();

    err.status = 404;

    let called = false;
    mm(console, 'error', () => { called = true; });
    app.onerror(err);
    assert(!called);
  });

  it('should do nothing if .silent', () => {
    const app = new Koa();
    app.silent = true;
    const err = new Error();

    let called = false;
    mm(console, 'error', () => { called = true; });
    app.onerror(err);
    assert(!called);
  });

  it('should log the error to stderr', () => {
    const app = new Koa();
    app.env = 'dev';

    const err = new Error();
    err.stack = 'Foo';

    let msg = '';
    mm(console, 'error', input => {
      if (input) msg = input;
    });
    app.onerror(err);
    assert(msg === '\n  Foo\n');
  });

  it('should use err.toString() instead of err.stack', () => {
    const app = new Koa();
    app.env = 'dev';

    const err = new Error('mock stack null');
    err.stack = null;

    app.onerror(err);

    let msg = '';
    mm(console, 'error', input => {
      if (input) msg = input;
    });
    app.onerror(err);
    assert(msg === '\n  Error: mock stack null\n');
  });
});
