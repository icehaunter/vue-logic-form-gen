export type ArrayModifierTypes = {
  length: (t: Array<any>) => number
  at: <T>(t: Array<T>, index: number) => T,
  debug: (target: Array<any>, level: 'debug' | 'log' | 'warn' | 'error', tag: string) => Array<any>
}

export const modifiers: ArrayModifierTypes = {
  length: (arr) => arr.length,
  at: (arr, index) => arr[index],
  // eslint-disable-next-line
  debug: (target, level, tag) => { console[level](tag, ':', target); return target }

}
