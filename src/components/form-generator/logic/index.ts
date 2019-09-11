import { Context, resolveModelPath } from '../resolution'
import { Value, isValueFromModel, isValueBuilder } from './value'
import { resolveModifierChain } from './modifiers'
import { ModelValueUndefinedError } from './errors'

function _resolveValue<T> (value: Value<T>, model: any, context: Context): T {
  if (typeof value !== 'object' || value === null) {
    return value
  } else if (isValueFromModel(value)) {
    const result = resolveModelPath(value._modelPath, model, context)
    if (result !== undefined) {
      return result
    } else {
      throw new ModelValueUndefinedError(value._modelPath, context)
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
export function resolveValue<T> (value: Value<T>, model: any, context: Context, options: { returnUndefined: true }): T | undefined
export function resolveValue<T> (value: Value<T>, model: any, context: Context, options: { returnUndefined: boolean } = { returnUndefined: false }): T | undefined {
  if (options.returnUndefined) {
    try {
      return _resolveValue(value, model, context)
    } catch (_) {
      return undefined
    }
  } else {
    return _resolveValue(value, model, context)
  }
}
