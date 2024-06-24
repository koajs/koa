const URLSearchParams = require('url').URLSearchParams

module.exports = {
  stringify: (obj) => {
    const searchParams = new URLSearchParams()
    const addKey = (k, v, params) => {
      const val = typeof v === 'string' || typeof v === 'number' ? v : ''
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
    for (const key of searchParams.keys()) {
      const values = searchParams.getAll(key)
      obj[key] = values.length <= 1 ? values[0] : values
    }
    return obj
  }
}
