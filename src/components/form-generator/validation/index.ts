import { ValidatorsSchema, validators } from './validators'
import { resolveValue } from '../logic'
import { Context } from '../resolution'
import { ResolutionResult } from '../resolution/resolution'
import { ValidatorLevel } from './types'

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
    message: validator.message,
    level: validator.level,
    predicate: predicate
  }
}

type ModelValidators = [string, PreparedValidator[]]

function _collectValidators (resolved: ResolutionResult): Array<ModelValidators> {
  if (resolved === undefined) {
    return []
  } else if (Array.isArray(resolved)) {
    return resolved.flatMap(_collectValidators)
  } else if (resolved.type === 'level') {
    return resolved.children.flatMap(_collectValidators)
  } else if (resolved.validation !== undefined) {
    return [[resolved.modelPath, resolved.validation]]
  } else {
    return []
  }
}

type ValidatorMap = {[k: string]: { [k in ValidatorLevel]: PreparedValidator[] }}

export function collectValidators (resolved: ResolutionResult): ValidatorMap {
  return _collectValidators(resolved).reduce((agg, [path, validators]) => {
    if (!(path in agg)) {
      agg[path] = {
        error: [],
        warn: [],
        info: [],
        success: []
      }
    }

    validators.forEach(v => agg[path][v.level].push(v))
    return agg
  }, {} as ValidatorMap)
}

// export function applyValidators (path)
