'use strict';

const context = require('../helpers/context');

describe('ctx.type=', () => {
  describe('with a mime', () => {
    it('should set the Content-Type', () => {
      const ctx = context();
      ctx.type = 'text/plain';
      expect(ctx.type).toBe('text/plain');
      expect(ctx.response.header['content-type']).toBe('text/plain; charset=utf-8');
    });
  });

  describe('with an extension', () => {
    it('should lookup the mime', () => {
      const ctx = context();
      ctx.type = 'json';
      expect(ctx.type).toBe('application/json');
      expect(ctx.response.header['content-type']).toBe('application/json; charset=utf-8');
    });
  });

  describe('without a charset', () => {
    it('should default the charset', () => {
      const ctx = context();
      ctx.type = 'text/html';
      expect(ctx.type).toBe('text/html');
      expect(ctx.response.header['content-type']).toBe('text/html; charset=utf-8');
    });
  });

  describe('with a charset', () => {
    it('should not default the charset', () => {
      const ctx = context();
      ctx.type = 'text/html; charset=foo';
      expect(ctx.type).toBe('text/html');
      expect(ctx.response.header['content-type']).toBe('text/html; charset=foo');
    });
  });

  describe('with an unknown extension', () => {
    it('should not set a content-type', () => {
      const ctx = context();
      ctx.type = 'asdf';
      expect(ctx.type).toBe('');
      expect(ctx.response.header['content-type']).toBe(undefined);
    });
  });
});

describe('ctx.type', () => {
  describe('with no Content-Type', () => {
    it('should return ""', () => {
      const ctx = context();
      expect(ctx.type).toBe('');
    });
  });

  describe('with a Content-Type', () => {
    it('should return the mime', () => {
      const ctx = context();
      ctx.type = 'json';
      expect(ctx.type).toBe('application/json');
    });
  });
});
