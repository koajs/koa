import {type UnknownRecord} from 'type-fest';

function only(object: any, keys: string | string[]) {
  object ||= {};

  // eslint-disable-next-line eqeqeq
  if (typeof keys == 'string') keys = keys.split(/ +/);

  return keys.reduce<UnknownRecord>(function (returnValue, key) {
    // eslint-disable-next-line no-eq-null, eqeqeq
    if (object[key] == null) return returnValue;
    returnValue[key] = object[key];
    return returnValue;
  }, {});
}

export default only;
