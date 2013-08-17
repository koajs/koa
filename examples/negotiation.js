
var koa = require('..');
var fs = require('fs');
var app = koa();

var tobi = {
  _id: '123',
  name: 'tobi',
  species: 'ferret'
};

var loki = {
  _id: '321',
  name: 'loki',
  species: 'ferret'
};

var users = {
  tobi: tobi,
  loki: loki
};

// content negotiation middleware.
// note that you should always check for
// presence of a body, and sometimes you
// may want to check the type, as it may
// be a stream, buffer, string, etc.

app.use(function(next){
  return function *(){
    yield next;

    // responses vary on accepted type
    this.vary('Accept');
    this.status = 'bad request';

    // no body? nothing to format, early return
    if (!this.body) return;
    
    // accepts json, koa handles this for us,
    // so just return
    if (this.accepts('json')) return;

    // accepts xml
    if (this.accepts('xml')) {
      this.type = 'xml';
      this.body = '<name>' + this.body.name + '</name>';
      return;
    }

    // accepts html
    if (this.accepts('html')) {
      this.type = 'html';
      this.body = '<h1>' + this.body.name + '</h1>';
      return;
    }

    // default to text
    this.body = this.body.name;
  }
});

// filter responses, in this case remove ._id
// since it's private

app.use(function(next){
  return function *(){
    yield next;

    if (!this.body) return;

    delete this.body._id;
  }
});

// try $ GET /tobi
// try $ GET /loki

app.use(function(){
  return function *(){
    var name = this.path.slice(1);
    var user = users[name];
    this.body = user;
  }
});

app.listen(3000);
