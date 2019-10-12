
'use strict';

const assert = require('assert');
const request = require('supertest');
const context = require('../helpers/context');
const Koa = require('../..');

describe('ctx.redirect(url)', () => {
  it('should redirect to the given url', () => {
    const ctx = context();
    ctx.redirect('http://google.com');
    assert.equal(ctx.response.header.location, 'http://google.com');
    assert.equal(ctx.status, 302);
  });

  it('should auto fix not encode url', done => {
    const app = new Koa();

    app.use(ctx => {
      ctx.redirect('http://google.com/😓');
    });

    request(app.callback())
      .get('/')
      .end((err, res) => {
        if (err) return done(err);
        assert.equal(res.status, 302);
        assert.equal(res.headers.location, 'http://google.com/%F0%9F%98%93');
        done();
      });
  });

  describe('with "back"', () => {
    it('should redirect to Referrer', () => {
      const ctx = context();
      ctx.req.headers.referrer = '/login';
      ctx.redirect('back');
      assert.equal(ctx.response.header.location, '/login');
    });

    it('should redirect to Referer', () => {
      const ctx = context();
      ctx.req.headers.referer = '/login';
      ctx.redirect('back');
      assert.equal(ctx.response.header.location, '/login');
    });

    it('should default to alt', () => {
      const ctx = context();
      ctx.redirect('back', '/index.html');
      assert.equal(ctx.response.header.location, '/index.html');
    });

    it('should default redirect to /', () => {
      const ctx = context();
      ctx.redirect('back');
      assert.equal(ctx.response.header.location, '/');
    });
  });

  describe('when html is accepted', () => {
    it('should respond with html', () => {
      const ctx = context();
      const url = 'http://google.com';
      ctx.header.accept = 'text/html';
      ctx.redirect(url);
      assert.equal(ctx.response.header['content-type'], 'text/html; charset=utf-8');
      assert.equal(ctx.body, `Redirecting to <a href="${url}">${url}</a>.`);
    });

    it('should escape the url', () => {
      const ctx = context();
      let url = '<script>';
      ctx.header.accept = 'text/html';
      ctx.redirect(url);
      url = escape(url);
      assert.equal(ctx.response.header['content-type'], 'text/html; charset=utf-8');
      assert.equal(ctx.body, `Redirecting to <a href="${url}">${url}</a>.`);
    });
  });

  describe('when text is accepted', () => {
    it('should respond with text', () => {
      const ctx = context();
      const url = 'http://google.com';
      ctx.header.accept = 'text/plain';
      ctx.redirect(url);
      assert.equal(ctx.body, `Redirecting to ${url}.`);
    });
  });

  describe('when status is 301', () => {
    it('should not change the status code', () => {
      const ctx = context();
      const url = 'http://google.com';
      ctx.status = 301;
      ctx.header.accept = 'text/plain';
      ctx.redirect('http://google.com');
      assert.equal(ctx.status, 301);
      assert.equal(ctx.body, `Redirecting to ${url}.`);
    });
  });

  describe('when status is 304', () => {
    it('should change the status code', () => {
      const ctx = context();
      const url = 'http://google.com';
      ctx.status = 304;
      ctx.header.accept = 'text/plain';
      ctx.redirect('http://google.com');
      assert.equal(ctx.status, 302);
      assert.equal(ctx.body, `Redirecting to ${url}.`);
    });
  });

  describe('when content-type was present', () => {
    it('should overwrite content-type', () => {
      const ctx = context();
      ctx.body = {};
      const url = 'http://google.com';
      ctx.header.accept = 'text/plain';
      ctx.redirect('http://google.com');
      assert.equal(ctx.status, 302);
      assert.equal(ctx.body, `Redirecting to ${url}.`);
      assert.equal(ctx.type, 'text/plain');
    });
  });
});

function escape(html){
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
