export type NumberModifierTypes = {
  add: (left: number, right: number) => number
  sub: (left: number, right: number) => number
  mul: (left: number, right: number) => number
  div: (left: number, right: number) => number
  double: (target: number) => number
  toString: (target: number) => string
}

export const modifiers: NumberModifierTypes = {
  add: (left, right) => left + right,
  sub: (left, right) => left - right,
  mul: (left, right) => left * right,
  div: (left, right) => left / right,
  double: target => target * target,
  toString: target => target.toString()
}
