'use strict';

const response = require('../helpers/context').response;

describe('res.message', () => {
  it('should return the response status message', () => {
    const res = response();
    res.status = 200;
    expect(res.message).toBe('OK');
  });

  describe('when res.message not present', () => {
    it('should look up in statuses', () => {
      const res = response();
      res.res.statusCode = 200;
      expect(res.message).toBe('OK');
    });
  });
});

describe('res.message=', () => {
  it('should set response status message', () => {
    const res = response();
    res.status = 200;
    res.message = 'ok';
    expect(res.res.statusMessage).toBe('ok');
    expect(res.inspect().message).toBe('ok');
  });
});
