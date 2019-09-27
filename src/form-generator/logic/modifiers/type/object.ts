import { getByPath } from '../../../utils/objectTraversal'

export type ObjectModifierTypes = {
  keys: (obj: object) => Array<string>,
  get: <T>(obj: { [k: string]: T }, key: string) => T,
  path: <T>(obj: object, path: string) => T,
  debug: (target: object, level: 'debug' | 'log' | 'warn' | 'error', tag: string) => object
}

export const modifiers: ObjectModifierTypes = {
  keys: (obj) => Object.keys(obj),
  get: (obj, key) => obj[key],
  path: (obj, path) => getByPath(obj, path),
  // eslint-disable-next-line
  debug: (target, level, tag) => { console[level](tag, ':', target); return target }
}
