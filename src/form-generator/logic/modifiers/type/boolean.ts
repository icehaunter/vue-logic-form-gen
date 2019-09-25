export type BooleanModifierTypes = {
  not: (x: boolean) => boolean
  and: (x: boolean, y: boolean) => boolean
  or: (x: boolean, y: boolean) => boolean
  xor: (x: boolean, y: boolean) => boolean
}

export const modifiers: BooleanModifierTypes = {
  not: (x) => !x,
  and: (x, y) => x && y,
  or: (x, y) => x || y,
  xor: (x, y) => x ? !y : y
}
