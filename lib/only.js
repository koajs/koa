module.exports = (obj, keys) => {
  obj = obj || {}
  if (typeof keys === 'string') keys = keys.split(/ +/)
  const ret = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (obj[key] == null) continue
    ret[key] = obj[key]
  }
  return ret
}
