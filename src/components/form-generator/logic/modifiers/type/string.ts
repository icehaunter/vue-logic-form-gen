export type StringModifierTypes = {
  join: (left: string, right: string) => string
  lowercase: (target: string) => string
  uppercase: (target: string) => string
  titlecase: (target: string) => string
  slice: (target: string, from: number, to: number) => string
  split: (target: string, symbol: RegExp | string) => Array<string>
  length: (target: string) => number
  testRegex: (target: string, regex: RegExp | string) => boolean
  isEqual: (target: string, equal: string) => boolean
  isSubstring: (target: string, bigger: string) => boolean
  containsSubstring: (target: string, smaller: string) => boolean
}

export const modifiers: StringModifierTypes = {
  join: (left, right) => left + right,
  lowercase: target => target.toLocaleLowerCase(),
  uppercase: target => target.toLocaleUpperCase(),
  titlecase: target =>
    target.replace(
      /([\wа-я]+)/igmu,
      sub => {
        return sub.slice(0, 1).toLocaleUpperCase() + sub.slice(1).toLocaleLowerCase()
      }
    ),
  slice: (target, from, to) => target.slice(from, to),
  split: (target, symbol) => target.split(symbol),
  length: target => target.length,
  testRegex: (target, regex) =>
    regex instanceof RegExp
      ? regex.test(target)
      : new RegExp(regex).test(target),
  isEqual: (target, equal) => target === equal,
  isSubstring: (target, bigger) => bigger.includes(target),
  containsSubstring: (target, smaller) => target.includes(smaller)
}
