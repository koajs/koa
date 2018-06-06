
'use strict';

const assert = require('assert');
const Koa = require('../..');

describe('app.onerror(err)', () => {
  beforeEach(() => {
    global.console = jest.genMockFromModule('console');
  });

  afterEach(() => {
    global.console = require('console');
  });

  it('should throw an error if a non-error is given', () => {
    const app = new Koa();

    assert.throws(() => {
      app.onerror('foo');
    }, TypeError, 'non-error thrown: foo');
  });

  it('should do nothing if status is 404', () => {
    const app = new Koa();
    const err = new Error();

    err.status = 404;

    app.onerror(err);

    assert.deepEqual(console.error.mock.calls, []);
  });

  it('should do nothing if .silent', () => {
    const app = new Koa();
    app.silent = true;
    const err = new Error();

    app.onerror(err);

    assert.deepEqual(console.error.mock.calls, []);
  });

  it('should log the error to stderr', () => {
    const app = new Koa();
    app.env = 'dev';

    const err = new Error();
    err.stack = 'Foo';

    app.onerror(err);

    const stderr = console.error.mock.calls.join('\n');
    assert.deepEqual(stderr, '\n  Foo\n');
  });

  it('should use err.toString() instad of err.stack', () => {
    const app = new Koa();
    app.env = 'dev';

    const err = new Error('mock stack null');
    err.stack = null;

    app.onerror(err);

    const stderr = console.error.mock.calls.join('\n');
    assert.equal(stderr, '\n  Error: mock stack null\n');
  });
});
