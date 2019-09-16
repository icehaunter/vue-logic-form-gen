import { WrapValueObject, Value } from '../logic/value'

export interface WidgetParams {}

type Values<T> = T[keyof T]

export type PrepareParams<K, T> = T extends object ? ({} extends T ? { type: K } : { type: K, params: WrapValueObject<T> }) : { type: K }

type ParamsToSchema<T> = Values<{
  [k in keyof T]: PrepareParams<k, T[k]>
}>

export type WidgetSchema = ParamsToSchema<WidgetParams>
