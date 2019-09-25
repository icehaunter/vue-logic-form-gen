import { getByPath } from '@/utils/objectTraversal'

export type ObjectModifierTypes = {
  keys: (obj: object) => Array<string>,
  get: <T>(obj: { [k: string]: T }, key: string) => T,
  path: <T>(obj: object, path: string) => T,
}

export const modifiers: ObjectModifierTypes = {
  keys: (obj) => Object.keys(obj),
  get: (obj, key) => obj[key],
  path: (obj, path) => getByPath(obj, path)
}
