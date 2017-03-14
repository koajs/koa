
'use strict';

const context = require('../helpers/context');

describe('ctx.redirect(url)', () => {
  it('should redirect to the given url', () => {
    const ctx = context();
    ctx.redirect('http://google.com');
    expect(ctx.response.header.location).toBe('http://google.com');
    expect(ctx.status).toBe(302);
  });

  describe('with "back"', () => {
    it('should redirect to Referrer', () => {
      const ctx = context();
      ctx.req.headers.referrer = '/login';
      ctx.redirect('back');
      expect(ctx.response.header.location).toBe('/login');
    });

    it('should redirect to Referer', () => {
      const ctx = context();
      ctx.req.headers.referer = '/login';
      ctx.redirect('back');
      expect(ctx.response.header.location).toBe('/login');
    });

    it('should default to alt', () => {
      const ctx = context();
      ctx.redirect('back', '/index.html');
      expect(ctx.response.header.location).toBe('/index.html');
    });

    it('should default redirect to /', () => {
      const ctx = context();
      ctx.redirect('back');
      expect(ctx.response.header.location).toBe('/');
    });
  });

  describe('when html is accepted', () => {
    it('should respond with html', () => {
      const ctx = context();
      const url = 'http://google.com';
      ctx.header.accept = 'text/html';
      ctx.redirect(url);
      expect(ctx.response.header['content-type']).toBe('text/html; charset=utf-8');
      expect(ctx.body).toBe(`Redirecting to <a href="${url}">${url}</a>.`);
    });

    it('should escape the url', () => {
      const ctx = context();
      let url = '<script>';
      ctx.header.accept = 'text/html';
      ctx.redirect(url);
      url = escape(url);
      expect(ctx.response.header['content-type']).toBe('text/html; charset=utf-8');
      expect(ctx.body).toBe(`Redirecting to <a href="${url}">${url}</a>.`);
    });
  });

  describe('when text is accepted', () => {
    it('should respond with text', () => {
      const ctx = context();
      const url = 'http://google.com';
      ctx.header.accept = 'text/plain';
      ctx.redirect(url);
      expect(ctx.body).toBe(`Redirecting to ${url}.`);
    });
  });

  describe('when status is 301', () => {
    it('should not change the status code', () => {
      const ctx = context();
      const url = 'http://google.com';
      ctx.status = 301;
      ctx.header.accept = 'text/plain';
      ctx.redirect('http://google.com');
      expect(ctx.status).toBe(301);
      expect(ctx.body).toBe(`Redirecting to ${url}.`);
    });
  });

  describe('when status is 304', () => {
    it('should change the status code', () => {
      const ctx = context();
      const url = 'http://google.com';
      ctx.status = 304;
      ctx.header.accept = 'text/plain';
      ctx.redirect('http://google.com');
      expect(ctx.status).toBe(302);
      expect(ctx.body).toBe(`Redirecting to ${url}.`);
    });
  });

  describe('when content-type was present', () => {
    it('should overwrite content-type', () => {
      const ctx = context();
      ctx.body = {};
      const url = 'http://google.com';
      ctx.header.accept = 'text/plain';
      ctx.redirect('http://google.com');
      expect(ctx.status).toBe(302);
      expect(ctx.body).toBe(`Redirecting to ${url}.`);
      expect(ctx.type).toBe('text/plain');
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
