
'use strict';

const stderr = require('test-console').stderr;
const Koa = require('../..');
const AssertionError = require('assert').AssertionError;

describe('app.onerror(err)', () => {
  it('should throw an error if a non-error is given', done => {
    const app = new Koa();

    (() => app.onerror('foo')).should.throw(AssertionError, {message: 'non-error thrown: foo'});

    done();
  });

  it('should do nothing if status is 404', done => {
    const app = new Koa();
    const err = new Error();

    err.status = 404;

    const output = stderr.inspectSync(() => app.onerror(err));

    output.should.eql([]);

    done();
  });

  it('should do nothing if .silent', done => {
    const app = new Koa();
    app.silent = true;
    const err = new Error();

    const output = stderr.inspectSync(() => app.onerror(err));

    output.should.eql([]);

    done();
  });

  it('should log the error to stderr', done => {
    const app = new Koa();
    app.env = 'dev';

    const err = new Error();
    err.stack = 'Foo';

    const output = stderr.inspectSync(() => app.onerror(err));

    output.should.eql(['\n', '  Foo\n', '\n']);

    done();
  });

  it('should use err.toString() instad of err.stack', done => {
    const app = new Koa();
    app.env = 'dev';

    const err = new Error('mock stack null');
    err.stack = null;

    const output = stderr.inspectSync(() => app.onerror(err));

    output.should.eql(['\n', '  Error: mock stack null\n', '\n']);

    done();
  });
});
