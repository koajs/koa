'use strict';

const path = require('path');
const fetch = require('node-fetch');
const onFinished = require('on-finished');

module.exports = (koa, url, options) => {
  return new Promise((resolve, reject) => {
    const server = koa.listen(0, () => {
      resolve(server);
    });
  }).then(server => {
    url = 'http://' + path.join('127.0.0.1:' + server.address().port, url);
    const fetchObj = fetch(url, options);
    fetchObj.then(res => onFinished(res.body, () => server.close())).catch(() => server.close());
    return fetchObj;
  });
};
