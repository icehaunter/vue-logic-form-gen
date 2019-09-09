import { BasicType, ConvertAnyToBasic, ConvertBasicToAny } from '../types'
import { BuildModifiers } from './baseTypes'
import { BooleanModifierTypes, modifiers as booleanModifiers } from './type/boolean'
import { StringModifierTypes, modifiers as stringModifiers } from './type/string'
import { DateModifierTypes, modifiers as dateModifiers } from './type/date'
import { NumberModifierTypes, modifiers as numberModifiers } from './type/number'
import { ArrayModifierTypes, modifiers as arrayModifiers } from './type/array'
import { ObjectModifierTypes, modifiers as objectModifiers } from './type/object'
import { Context } from '../../schema/resolution'
import { resolveValue } from '..'
import { Value, UnwrapValueArray } from '../value'
import { ModifierValueUndefinedError } from '../errors'

type BooleanModifiers = BuildModifiers<BooleanModifierTypes>
type StringModifiers = BuildModifiers<StringModifierTypes>
type DateModifiers = BuildModifiers<DateModifierTypes>
type NumberModifiers = BuildModifiers<NumberModifierTypes>
type ArrayModifiers = BuildModifiers<ArrayModifierTypes>
type ObjectModifiers = BuildModifiers<ObjectModifierTypes>

type Modifiers = {
  'boolean': BooleanModifiers,
  'string': StringModifiers,
  'date': DateModifiers,
  'number': NumberModifiers
  'array': ArrayModifiers
  'object': ObjectModifiers
}

const modifiers = {
  'boolean': booleanModifiers,
  'string': stringModifiers,
  'date': dateModifiers,
  'number': numberModifiers,
  'array': arrayModifiers,
  'object': objectModifiers
}

export type Modifier = BooleanModifiers | StringModifiers | DateModifiers | NumberModifiers | ArrayModifiers | ObjectModifiers

export type ModifierChain<T extends BasicType> = [Modifiers[T], ...Array<Modifier>]

function convertValues<K extends Array<any>> (values: K, model: any, context: Context): UnwrapValueArray<K> {
  return values.map(<T>(v: Value<T>): T => resolveValue(v, model, context)) as UnwrapValueArray<K>
}

const modifierReduce = (model: any, context: Context) => <T extends Modifier> (
  { value, type }: { value: ConvertBasicToAny<T[0]>, type: BasicType | undefined },
  [ fromType, command, args, nextType ]: T,
  index: number
) => {
  if (type !== undefined && type !== fromType) {
    throw new TypeError(`Modifier chain is invalid: expected command for type "${type}", recieved for type "${fromType}" at action #${index}`)
  }

  const resolvedArgs = convertValues(args, model, context)
  const newValue = (modifiers[fromType] as any)[command](value, ...resolvedArgs)

  if (newValue === undefined) {
    throw new ModifierValueUndefinedError(fromType, command, value, resolvedArgs, nextType)
  }

  return {
    value: newValue,
    type: nextType
  }
}

export function resolveModifierChain<T> (initialValue: T, chain: ModifierChain<ConvertAnyToBasic<T>>, model: any, context: Context): any {
  const reducer = modifierReduce(model, context)
  return chain.reduce(reducer, { value: initialValue as any, type: undefined as BasicType | undefined })['value']
}
