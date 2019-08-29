import { BasicType } from './types'
import { Value } from './value'

interface Modifier {
  from: any,
  chain: ModifierChain
}

export type ModifierChain = DeepArray<NumberModifier>

type ModifierAggregate = { [k: string]: [] | [any] | [any, any]}

export interface NumberModifiers {
  'add': [Value<number>]
  'sub': [Value<number>]
  'mul': [Value<number>]
  'div': [Value<number>]
  'double': []
}

type ConvertToTuple<K extends String, V extends any[]> = ((arg1: K, ...rest: V) => any) extends ((...args: infer R) => any)
? R : never;

interface GenericMods {
  [s: string]: any[]
}

type ConvertedModifiers<M extends {[s: string]: any[]}> = {
  [k in Extract<keyof M, string>]: ConvertToTuple<k, M[k]>
}

type PreparedNumberModifiers = Pick<NumberModifiers, keyof NumberModifiers>

type Values<T> = T[keyof T]

export type NumberModifier = Values<ConvertedModifiers<PreparedNumberModifiers>>

interface DeepArray<T> extends Array<T | DeepArray<T>> {}

type MappingBase = {[k in BasicType]: [any, ...any[]]}

interface Mapping extends MappingBase {
  'test': []
}
