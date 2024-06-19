module.exports = (obj, keys) => {
  obj = obj || {};
  if ('string' == typeof keys) keys = keys.split(/ +/);
  const ret = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (null == obj[key]) continue;
    ret[key] = obj[key];
  }
  return ret;

};
