import { resolveModelPath, Context } from '../schema/resolution'
import { Value, isValueFromModel, isValueBuilder } from './value'
import { resolveModifierChain } from './modifiers'

export class ValueUndefinedError extends Error {
  path: string
  context: Context

  constructor (path: string, context: Context) {
    super(`Value resolution failed: property is undefined; path: ${path}`)
    this.path = path
    this.context = context
  }
}

export function resolveValue<T> (value: Value<T>, model: any, context: Context): T {
  if (typeof value !== 'object' || value === null) {
    return value
  } else if (isValueFromModel(value)) {
    const result = resolveModelPath(value._modelPath, model, context)
    if (result !== undefined) {
      return result
    } else {
      throw new ValueUndefinedError(value._modelPath, context)
    }
  } else if (isValueBuilder(value)) {
    const initialValue = resolveValue(value._buildFrom, model, context)
    return resolveModifierChain(initialValue, value._actions, model, context)
  } else {
    return value
  }
}
