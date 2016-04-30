
'use strict';

const context = require('../helpers/context');
const should = require('should');

describe('ctx.search=', () => {
  it('should replace the search', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.search = '?page=2&color=blue';
    ctx.url.should.equal('/store/shoes?page=2&color=blue');
    ctx.search.should.equal('?page=2&color=blue');
  });

  it('should update ctx.querystring and ctx.query', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.search = '?page=2&color=blue';
    ctx.url.should.equal('/store/shoes?page=2&color=blue');
    ctx.querystring.should.equal('page=2&color=blue');
    should(ctx.query).have.property('page', '2');
    should(ctx.query).have.property('color', 'blue');
  });

  it('should change .url but not .originalUrl', () => {
    const ctx = context({ url: '/store/shoes' });
    ctx.search = '?page=2&color=blue';
    ctx.url.should.equal('/store/shoes?page=2&color=blue');
    ctx.originalUrl.should.equal('/store/shoes');
    ctx.request.originalUrl.should.equal('/store/shoes');
  });

  describe('when missing', () => {
    it('should return ""', () => {
      const ctx = context({ url: '/store/shoes' });
      ctx.search.should.equal('');
    });
  });
});
