import { Context } from '../resolution'
import { WrapValue, WrapValueObject } from '../logic/value'

type ValidatorParam = { [k: string]: any } | undefined
type ValidatorParams = { [k: string]: ValidatorParam }

type ConvertParamToFunction<T extends ValidatorParam> = T extends undefined
  ? () => (value: any) => boolean
  : (params: T) => (value: any) => boolean

export type BuildValidators<T extends ValidatorParams> = {
  [k in keyof T]: ConvertParamToFunction<T[k]>
}

type Values<T> = T[keyof T]

export type BuildValidatorSchema<T extends ValidatorParams> = Values<{
  [k in keyof T]: T[k] extends object ? {
    type: k,
    params: WrapValueObject<T[k]>,
    errorMessage: string,
    level: 'error' | 'warn' | 'info' | 'success'
  } : {
    type: k,
    errorMessage: string,
    level: 'error' | 'warn' | 'info' | 'success'
  }
}>
