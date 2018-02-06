'use strict';

class KoaError extends Error {
  constructor() {
    super();
    this.name = 'KoaError';
  }
}

class KoaBreakMwError extends KoaError {
  constructor() {
    super();
    this.name = 'KoaBreakMwError';
  }
}

exports.KoaError = KoaError;
exports.KoaBreakMwError = KoaBreakMwError;
