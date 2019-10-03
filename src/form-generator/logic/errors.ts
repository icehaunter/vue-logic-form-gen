import { Context, resolveContextPath } from '../resolution'
import { BasicType } from './types'

export class ValueUndefinedError extends Error {
  value: null | undefined

  constructor (reason: string, contextMessage: string, value: null | undefined) {
    super(`Value resolution failed: ${reason}; ${contextMessage}`)
    this.value = value
  }
}

export class ModelValueUndefinedError extends ValueUndefinedError {
  path: string
  context: Context

  constructor (path: string, context: Context, value: null | undefined) {
    super(
      'property on the model is undefined',
      `resolved path: ${resolveContextPath(path, context)}`,
      value
    )

    this.path = path
    this.context = context
  }
}

export class ModifierValueUndefinedError extends ValueUndefinedError {
  fromType: BasicType
  command: string
  value: any
  resolvedArgs: any[]
  expectedType: BasicType

  constructor (
    fromType: BasicType,
    command: string,
    value: any,
    resolvedArgs: any[],
    expectedType: BasicType,
    realValue: null | undefined
  ) {
    super(
      'modifier chain led to undefined',
      `on type "${fromType}" executed command "${command}" as (${String(
        value
      )}, ...[${resolvedArgs
        .map(v => JSON.stringify(v))
        .join(', ')}]), expecting ${expectedType}`,
      realValue
    )
    this.fromType = fromType
    this.command = command
    this.value = value
    this.resolvedArgs = resolvedArgs
    this.expectedType = expectedType
  }
}
