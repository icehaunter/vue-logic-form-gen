import { WrapValueObject, Value } from '../logic/value'
import { ValidatorLevel } from '../validation/types'

export interface WidgetParams {}

type Values<T> = T[keyof T]

export type PrepareParams<K, T> = T extends object ? ({} extends T ? { type: K } : { type: K, params: WrapValueObject<T> }) : { type: K }

type ParamsToSchema<T> = Values<{
  [k in keyof T]: PrepareParams<k, T[k]>
}>

export type WidgetSchema = ParamsToSchema<WidgetParams>

export interface BaseProps {
  _validations: { [k in ValidatorLevel]: string[] }
  errorMessage: string | undefined
  warnMessage: string | undefined
  successMessage: string | undefined
  infoMessage: string | undefined
}
