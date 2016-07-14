
'use strict';

// support async await by babel
require('babel-core/register')({
  plugins: ['babel-plugin-syntax-async-functions', 'babel-plugin-bluebird-async-functions']
});

require('./async');
