// eslint-disable-next-line n/prefer-global/url-search-params
import {URLSearchParams} from 'node:url';

const searchParams = {
  stringify(obj: Record<string, unknown>) {
    const searchParams = new URLSearchParams();
    const addKey = (k: string, v: any, params: URLSearchParams) => {
      const val = typeof v === 'string' || typeof v === 'number' ? v : '';
      params.append(k, String(val));
    };

    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        const lgth = value.length;
        for (let i = 0; i < lgth; i++) {
          addKey(key, value[i], searchParams);
        }
      } else {
        addKey(key, value, searchParams);
      }
    }

    return searchParams.toString();
  },

  parse(str: string) {
    const searchParams = new URLSearchParams(str);
    const obj: Record<string, unknown> = {};
    for (const key of searchParams.keys()) {
      const values = searchParams.getAll(key);
      obj[key] = values.length <= 1 ? values[0] : values;
    }

    return obj;
  },
};

export default searchParams;
