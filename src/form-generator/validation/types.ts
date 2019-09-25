import { WrapValueObject } from '../logic/value'

export type ValidatorLevel = 'error' | 'warn' | 'info' | 'success'
type ValidatorParam = { [k: string]: any } | undefined
type ValidatorParams = { [k: string]: ValidatorParam }

type ConvertParamToFunction<T extends ValidatorParam> = T extends undefined
  ? () => (value: any) => boolean
  : (params: T) => (value: any) => boolean

export type BuildValidators<T extends ValidatorParams> = {
  [k in keyof T]: ConvertParamToFunction<T[k]>
}

type Values<T> = T[keyof T]

interface Validator<K> {
  /**
   * Type of the validator. Inferred from available validators.
   * Implicitly defines needed parameters
   */
  type: K,
  /**
   * Message to display. This will be passed to the component.
   * At the moment, no resolution is performed on the message
   */
  message: string,
  /**
   * Level of the validator message. This specifies the prop into which the message will be put
   */
  level: ValidatorLevel,
  /**
   * Whether the validator needs to run and display the message before any change to the model was made.
   */
  runOnEmpty?: boolean
}

interface ValidatorWithParams<K, P extends object> extends Validator<K> {
  /**
   * Parameters for the specified validator
   */
  params: WrapValueObject<P>
}

export type BuildValidatorSchema<T extends ValidatorParams> = Values<{
  [k in keyof T]: T[k] extends object ? ValidatorWithParams<k, T[k]> : Validator<k>
}>
