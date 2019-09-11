import { WrapValueArray } from '../value'
import { ConvertAnyToBasic } from '../types'

// prettier-ignore
type BuildModifierAction<Action extends string, P extends (a1: any, ...args: any[]) => any> =
  P extends (from: infer FromType, ...args: infer Args) => infer ToType
  ? [
    ConvertAnyToBasic<FromType>,
    Action,
    WrapValueArray<Args>,
    ConvertAnyToBasic<ToType>
  ]
  : never

type GetValues<T> = T[keyof T]

// prettier-ignore
export type BuildModifiers<Mods extends { [k: string]: (arg: any, ...more: any[]) => any }> = GetValues<{
  [k in keyof Mods]: k extends string ? BuildModifierAction<k, Mods[k]> : never
}>
