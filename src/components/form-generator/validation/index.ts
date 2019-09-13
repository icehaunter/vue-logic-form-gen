import { ValidatorsSchema, validators } from './validators'
import { resolveValue } from '../logic'
import { Context } from '../resolution'

export interface PreparedValidator extends Omit<ValidatorsSchema, 'params'> {
  predicate: (value: any) => boolean
}

export const prepareValidator = (model: any, context: Context) => (validator: ValidatorsSchema): PreparedValidator => {
  let predicate: (value: any) => boolean

  if ('params' in validator) {
    let preparedParams: any = {}
    for (const [key, value] of Object.entries(validator.params)) {
      preparedParams[key] = resolveValue(value, model, context)
    }

    predicate = validators[validator.type](preparedParams)
  } else {
    predicate = validators[validator.type]()
  }

  return {
    type: validator.type,
    errorMessage: validator.errorMessage,
    level: validator.level,
    predicate: predicate
  }
}
