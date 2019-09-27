export type NumberModifierTypes = {
  add: (left: number, right: number) => number
  sub: (left: number, right: number) => number
  mul: (left: number, right: number) => number
  div: (left: number, right: number) => number
  double: (target: number) => number
  toString: (target: number) => string
  eq: (left: number, right: number) => boolean
  lt: (left: number, right: number) => boolean
  lte: (left: number, right: number) => boolean
  gt: (left: number, right: number) => boolean
  gte: (left: number, right: number) => boolean
  debug: (target: number, level: 'debug' | 'log' | 'warn' | 'error', tag: string) => number
}

export const modifiers: NumberModifierTypes = {
  add: (left, right) => left + right,
  sub: (left, right) => left - right,
  mul: (left, right) => left * right,
  div: (left, right) => left / right,
  double: target => target * target,
  toString: target => target.toString(),
  eq: (l, r) => l === r,
  lt: (l, r) => l < r,
  lte: (l, r) => l <= r,
  gt: (l, r) => l > r,
  gte: (l, r) => l >= r,
  debug: (target, level, tag) => { console[level](tag, ':', target); return target }
}
