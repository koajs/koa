
'use strict';

const context = require('../helpers/context');
const parseurl = require('parseurl');

describe('ctx.path', () => {
  it('should return the pathname', () => {
    const ctx = context();
    ctx.url = '/login?next=/dashboard';
    ctx.path.should.equal('/login');
  });
});

describe('ctx.path=', () => {
  it('should set the pathname', () => {
    const ctx = context();
    ctx.url = '/login?next=/dashboard';

    ctx.path = '/logout';
    ctx.path.should.equal('/logout');
    ctx.url.should.equal('/logout?next=/dashboard');
  });

  it('should change .url but not .originalUrl', () => {
    const ctx = context({ url: '/login' });
    ctx.path = '/logout';
    ctx.url.should.equal('/logout');
    ctx.originalUrl.should.equal('/login');
    ctx.request.originalUrl.should.equal('/login');
  });

  it('should not affect parseurl', () => {
    const ctx = context({ url: '/login?foo=bar' });
    ctx.path = '/login';
    const url = parseurl(ctx.req);
    url.path.should.equal('/login?foo=bar');
  });
});
