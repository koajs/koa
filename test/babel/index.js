'use strict';

// http://babeljs.io/docs/setup/#babel_register

require('babel-register')({
  plugins: ['transform-async-to-generator']
});
require('./_test.js');
