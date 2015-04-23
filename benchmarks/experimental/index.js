// support async await by babel
require('babel/register')({
  optional: ['asyncToGenerator']
});

require('./async');
