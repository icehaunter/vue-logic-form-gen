import { BasicType, ConvertBasicToAny } from './types'
import { ModifierChain } from './modifiers'

interface ValueFromModel {
  _modelPath: string
}

interface ValueBuilder<T, K extends BasicType = BasicType> {
  _buildFrom: Value<ConvertBasicToAny<K>>,
  _actions: ModifierChain<K>
}

export type Value<T> = T | ValueFromModel | ValueBuilder<T>

export type WrapValue<T> = T extends ValueFromModel | ValueBuilder<T> ? T : Value<T>

export type UnwrapValue<T> = T extends Value<infer P> ? P : T

export type UnwrapValueArray<T extends any[]> = { [k in keyof T]: UnwrapValue<T[k]> }
export type WrapValueArray<Arr extends any[]> = { [k in keyof Arr]: WrapValue<Arr[k]> }

// type t = WrapValueArray<[ number ]>

export function isValueFromModel<T> (v: Value<T>): v is ValueFromModel {
  return typeof v === 'object' && Object.keys(v)[0] === '_modelPath'
}

export function isValueBuilder<T> (v: Value<T>): v is ValueBuilder<T> {
  return typeof v === 'object' && Object.keys(v).length === 2 && '_buildFrom' in v && '_actions' in v
}
