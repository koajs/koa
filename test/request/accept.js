
'use strict';

const Accept = require('accepts');
const assert = require('assert');
const context = require('../helpers/context');

describe('ctx.accept', () => {
  it('should return an Accept instance', () => {
    const ctx = context();
    ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain';
    assert(ctx.accept instanceof Accept);
  });
});

describe('ctx.accept=', () => {
  it('should replace the accept object', () => {
    const ctx = context();
    ctx.req.headers.accept = 'text/plain';
    assert.deepEqual(ctx.accepts(), ['text/plain']);

    const request = context.request();
    request.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain';
    ctx.accept = Accept(request.req);
    assert.deepEqual(ctx.accepts(), ['text/html', 'text/plain', 'image/jpeg', 'application/*']);
  });
});
