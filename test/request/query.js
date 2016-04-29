
'use strict';

const context = require('../helpers/context');
const should = require('should');

describe('ctx.query', () => {
  describe('when missing', () => {
    it('should return an empty object', () => {
      const ctx = context({ url: '/' });
      should(ctx.query).empty;
    });

    it('should return the same object each time it\'s accessed', done => {
      const ctx = context({ url: '/' });
      ctx.query.a = '2';
      ctx.query.a.should.equal('2');
      done();
    });
  });

  it('should return a parsed query-string', () => {
    const ctx = context({ url: '/?page=2' });
    ctx.query.page.should.equal('2');
  });
});

describe('ctx.query=', () => {
  it('should stringify and replace the querystring and search', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.query = { page: 2, color: 'blue' };
    ctx.url.should.equal('/store/shoes?page=2&color=blue');
    ctx.querystring.should.equal('page=2&color=blue');
    ctx.search.should.equal('?page=2&color=blue');
  });

  it('should change .url but not .originalUrl', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.query = { page: 2 };
    ctx.url.should.equal('/store/shoes?page=2');
    ctx.originalUrl.should.equal('/store/shoes');
    ctx.request.originalUrl.should.equal('/store/shoes');
  });
});
