
var util = require('util');
var context = require('../context');

describe('ctx.inspect()', function(){
  it('should work', function(){
    var ctx = context();

    ctx.req.method = 'POST';
    ctx.req.url = '/items';
    ctx.req.headers['content-type'] = 'text/plain';
    ctx.status = 200;
    ctx.body = '<p>Hey</p>';

    util.inspect(ctx).should.be.String;
  })
})
