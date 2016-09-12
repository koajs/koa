
'use strict';

const request = require('supertest');
const Koa = require('../..');

describe('ctx.redirect(url)', () => {
  it('should redirect to the given url', done => {
    const app = new Koa();

    app.use(ctx => {
      ctx.redirect('http://google.com');
    });

    const server = app.listen();

    request(server)
      .get('/')
      .expect(302)
      .end((err, res) => {
        if (err) return done(err);
        res.should.have.header('Location', 'http://google.com');
        done();
      });
  });

  describe('with "back"', () => {
    it('should redirect to Referrer', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.req.headers.referrer = '/login';
        ctx.redirect('back');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.header('Location', '/login');
          done();
        });
    });

    it('should redirect to Referer', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.req.headers.referer = '/login';
        ctx.redirect('back');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.header('Location', '/login');
          done();
        });
    });

    it('should default to alt', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.redirect('back', '/index.html');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.header('Location', '/index.html');
          done();
        });
    });

    it('should default redirect to /', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.redirect('back');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.header('Location', '/');
          done();
        });
    });
  });

  describe('when html is accepted', () => {
    it('should respond with html', done => {
      const url = 'http://google.com';
      const app = new Koa();

      app.use(ctx => {
        ctx.header.accept = 'text/html';
        ctx.redirect(url);
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.header('Content-Type', 'text/html; charset=utf-8');
          res.text.should.equal(`Redirecting to <a href="${url}">${url}</a>.`);
          done();
        });
    });

    it('should escape the url', done => {
      let url = '<script>';
      const app = new Koa();

      app.use(ctx => {
        ctx.header.accept = 'text/html';
        ctx.redirect(url);
        url = escape(url);
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.header('Content-Type', 'text/html; charset=utf-8');
          res.text.should.equal(`Redirecting to <a href="${url}">${url}</a>.`);
          done();
        });
    });
  });

  describe('when text is accepted', () => {
    it('should respond with text', done => {
      const url = 'http://google.com';
      const app = new Koa();

      app.use(ctx => {
        ctx.header.accept = 'text/plain';
        ctx.redirect(url);
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          res.text.should.equal(`Redirecting to ${url}.`);
          done();
        });
    });
  });

  describe('when status is 301', () => {
    it('should not change the status code', done => {
      const url = 'http://google.com';
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 301;
        ctx.header.accept = 'text/plain';
        ctx.redirect('http://google.com');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(301)
        .end((err, res) => {
          if (err) return done(err);
          res.text.should.equal(`Redirecting to ${url}.`);
          done();
        });
    });
  });

  describe('when status is 304', () => {
    it('should change the status code', done => {
      const url = 'http://google.com';
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 304;
        ctx.header.accept = 'text/plain';
        ctx.redirect('http://google.com');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          res.text.should.equal(`Redirecting to ${url}.`);
          done();
        });
    });
  });

  describe('when content-type was present', () => {
    it('should overwrite content-type', done => {
      const url = 'http://google.com';
      const app = new Koa();

      app.use(ctx => {
        ctx.body = {};
        ctx.header.accept = 'text/plain';
        ctx.redirect('http://google.com');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(302)
        .end((err, res) => {
          if (err) return done(err);
          res.text.should.equal(`Redirecting to ${url}.`);
          res.should.have.header('Content-Type', 'text/plain; charset=utf-8');
          done();
        });
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
