import { ValidatorsSchema, validators } from './validators'
import { resolveValue } from '../logic'
import { Context } from '../resolution'
import { ResolutionResult } from '../resolution/resolution'
import { ValidatorLevel } from './types'
import { groupByKey } from '@/utils/arrayTraversal'

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
    runOnEmpty: validator.runOnEmpty,
    predicate: predicate
  }
}

type ModelValidators = [string, ValidationCurriedApplier]

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

export type ValidationResult = { [k in ValidatorLevel]: string[] }

export type ValidationApplier = (value: any) => ValidationCurriedApplier

export type ValidationCurriedApplier = (dirty: boolean) => ValidationResult

export type CollectedValidators = { [k: string]: ValidationCurriedApplier }

// function groupValidators (agg: { [k: string]: PreparedValidator[] }, [path, validators]: [string, PreparedValidator[]]): {}

const buildValidationApplier = (validators: PreparedValidator[]): ValidationApplier => (value) => (dirty) => {
  return validators.reduce((result, validator) => {
    if ((validator.runOnEmpty || dirty) && !validator.predicate(value)) {
      result[validator.level].push(validator.message)
    }
    return result
  }, {
    error: [],
    info: [],
    success: [],
    warn: []
  } as ValidationResult)
}

export function prepareAppliedValidator (validators: ValidatorsSchema[], model: any, context: Context) {
  return buildValidationApplier(validators.map(prepareValidator(model, context)))
}

function mergeValidationResults (a: ValidationResult, b: ValidationResult): ValidationResult {
  return {
    error: a.error.concat(b.error),
    warn: a.warn.concat(b.warn),
    success: a.success.concat(b.success),
    info: a.info.concat(b.info)
  }
}

export function collectValidators (resolved: ResolutionResult): CollectedValidators {
  const grouped = groupByKey(_collectValidators(resolved))

  return Object.keys(grouped).reduce((agg, key) => {
    agg[key] = (dirty: boolean) => grouped[key].map(a => a(dirty)).reduce(mergeValidationResults)
    return agg
  }, {} as CollectedValidators)
}
