export type ArrayModifierTypes = {
  length: (t: Array<any>) => number
  at: <T>(t: Array<T>, index: number) => T
}

export const modifiers: ArrayModifierTypes = {
  length: (arr) => arr.length,
  at: (arr, index) => arr[index]
}
