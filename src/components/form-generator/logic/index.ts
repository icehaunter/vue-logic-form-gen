import { resolveModelPath, Context } from '../schema/resolution'
import { Value, isValueFromModel, isValueBuilder } from './value'
import { resolveModifierChain } from './modifiers'
import { ModelValueUndefinedError } from './errors'

export function resolveValue<T> (value: Value<T>, model: any, context: Context): T {
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
    const initialValue = resolveValue(value._buildFrom, model, context)
    return resolveModifierChain(initialValue, value._actions, model, context)
  } else {
    return value
  }
}
