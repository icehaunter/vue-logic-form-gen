export type StringModifierTypes = {
  'join': (left: string, right: string) => string
  'length': (target: string) => number
  'testRegex': (target: string, regex: RegExp | string) => boolean
}

export const modifiers: StringModifierTypes = {
  join: (left, right) => left + right,
  length: (target) => target.length,
  testRegex: (target, regex) => regex instanceof RegExp ? regex.test(target) : (new RegExp(regex)).test(regex)
}
