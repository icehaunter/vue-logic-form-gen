import { Context, resolveModelPath } from '../resolution'
import { Value, isValueFromModel, isValueBuilder } from './value'
import { resolveModifierChain } from './modifiers'
import { ModelValueUndefinedError, ValueUndefinedError } from './errors'

function _resolveValue<T> (value: Value<T>, model: any, context: Context): T {
  if (typeof value !== 'object' || value === null) {
    return value
  } else if (isValueFromModel(value)) {
    const result = resolveModelPath(value._modelPath, model, context)
    if (result !== undefined && result !== null) {
      return result
    } else {
      throw new ModelValueUndefinedError(value._modelPath, context, result)
    }
  } else if (isValueBuilder(value)) {
    const initialValue = _resolveValue(value._buildFrom, model, context)
    return resolveModifierChain(initialValue, value._actions, model, context)
  } else {
    return value
  }
}

export function resolveValue<T> (value: Value<T>, model: any, context: Context): T
export function resolveValue<T> (value: Value<T>, model: any, context: Context, options: { returnUndefined: false }): T
export function resolveValue<T> (value: Value<T>, model: any, context: Context, options: { returnUndefined: true }): T | null | undefined
export function resolveValue<T> (value: Value<T>, model: any, context: Context, options: { returnUndefined: boolean } = { returnUndefined: false }): T | null | undefined {
  if (options.returnUndefined) {
    try {
      return _resolveValue(value, model, context)
    } catch (e) {
      if (e instanceof ValueUndefinedError) {
        return e.value
      } else {
        throw e
      }
    }
  } else {
    return _resolveValue(value, model, context)
  }
}
