const URLSearchParams = require('url').URLSearchParams

module.exports = {
  stringify: (obj) => {
    const searchParams = new URLSearchParams()
    const addKey = (k, v, params) => {
      const val = typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? v : ''
      params.append(k, val)
    }

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        const lgth = value.length
        for (let i = 0; i < lgth; i++) {
          addKey(key, value[i], searchParams)
        }
      } else {
        addKey(key, value, searchParams)
      }
    }
    return searchParams.toString()
  },

  parse: (str) => {
    const searchParams = new URLSearchParams(str)
    const obj = {}
    for (const [key, value] of searchParams) {
      if (Object.hasOwn(obj, key)) {
        const previous = obj[key]
        if (Array.isArray(previous)) previous.push(value)
        else obj[key] = [previous, value]
      } else {
        Object.defineProperty(obj, key, {
          value,
          writable: true,
          enumerable: true,
          configurable: true
        })
      }
    }
    return obj
  }
}
