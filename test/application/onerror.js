'use strict';

const Koa = require('../..');
const AssertionError = require('assert').AssertionError;

function captureStderr(fn){
  const oldErr = console.error;
  const stderr = [];
  console.error = msg => stderr.push(msg);
  fn();
  console.error = oldErr;
  return stderr;
}

describe('app.onerror(err)', () => {
  it('should throw an error if a non-error is given', () => {
    const app = new Koa();

    expect(() => app.onerror('foo')).toThrow(AssertionError, {message: 'non-error thrown: foo'});
  });

  it('should do nothing if status is 404', () => {
    const app = new Koa();
    const err = new Error();

    err.status = 404;

    const output = captureStderr(() => app.onerror(err));

    expect(output).toEqual([]);
  });

  it('should do nothing if .silent', () => {
    const app = new Koa();
    app.silent = true;
    const err = new Error();

    const output = captureStderr(() => app.onerror(err));

    expect(output).toEqual([]);
  });

  it('should log the error to stderr', () => {
    const app = new Koa();
    app.env = 'dev';

    const err = new Error();
    err.stack = 'Foo';

    const output = captureStderr(() => app.onerror(err));

    expect(output).toEqual([undefined, '  Foo', undefined]);
  });

  it('should use err.toString() instad of err.stack', () => {
    const app = new Koa();
    app.env = 'dev';

    const err = new Error('mock stack null');
    err.stack = null;

    const output = captureStderr(() => app.onerror(err));

    expect(output).toEqual([undefined, '  Error: mock stack null', undefined]);
  });
});
