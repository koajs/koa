
'use strict';

const context = require('../helpers/context');

describe('ctx.accepts(types)', () => {
  describe('with no arguments', () => {
    describe('when Accept is populated', () => {
      it('should return all accepted types', () => {
        const ctx = context();
        ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain';
        expect(ctx.accepts()).toEqual(['text/html', 'text/plain', 'image/jpeg', 'application/*']);
      });
    });
  });

  describe('with no valid types', () => {
    describe('when Accept is populated', () => {
      it('should return false', () => {
        const ctx = context();
        ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain';
        expect(ctx.accepts('image/png', 'image/tiff')).toBe(false);
      });
    });

    describe('when Accept is not populated', () => {
      it('should return the first type', () => {
        const ctx = context();
        expect(ctx.accepts('text/html', 'text/plain', 'image/jpeg', 'application/*')).toBe('text/html');
      });
    });
  });

  describe('when extensions are given', () => {
    it('should convert to mime types', () => {
      const ctx = context();
      ctx.req.headers.accept = 'text/plain, text/html';
      expect(ctx.accepts('html')).toBe('html');
      expect(ctx.accepts('.html')).toBe('.html');
      expect(ctx.accepts('txt')).toBe('txt');
      expect(ctx.accepts('.txt')).toBe('.txt');
      expect(ctx.accepts('png')).toBe(false);
    });
  });

  describe('when an array is given', () => {
    it('should return the first match', () => {
      const ctx = context();
      ctx.req.headers.accept = 'text/plain, text/html';
      expect(ctx.accepts(['png', 'text', 'html'])).toBe('text');
      expect(ctx.accepts(['png', 'html'])).toBe('html');
    });
  });

  describe('when multiple arguments are given', () => {
    it('should return the first match', () => {
      const ctx = context();
      ctx.req.headers.accept = 'text/plain, text/html';
      expect(ctx.accepts('png', 'text', 'html')).toBe('text');
      expect(ctx.accepts('png', 'html')).toBe('html');
    });
  });

  describe('when present in Accept as an exact match', () => {
    it('should return the type', () => {
      const ctx = context();
      ctx.req.headers.accept = 'text/plain, text/html';
      expect(ctx.accepts('text/html')).toBe('text/html');
      expect(ctx.accepts('text/plain')).toBe('text/plain');
    });
  });

  describe('when present in Accept as a type match', () => {
    it('should return the type', () => {
      const ctx = context();
      ctx.req.headers.accept = 'application/json, */*';
      expect(ctx.accepts('text/html')).toBe('text/html');
      expect(ctx.accepts('text/plain')).toBe('text/plain');
      expect(ctx.accepts('image/png')).toBe('image/png');
    });
  });

  describe('when present in Accept as a subtype match', () => {
    it('should return the type', () => {
      const ctx = context();
      ctx.req.headers.accept = 'application/json, text/*';
      expect(ctx.accepts('text/html')).toBe('text/html');
      expect(ctx.accepts('text/plain')).toBe('text/plain');
      expect(ctx.accepts('image/png')).toBe(false);
      expect(ctx.accepts('png')).toBe(false);
    });
  });
});
