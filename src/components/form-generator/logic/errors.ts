import { Context, resolveContextPath } from '../schema/resolution'
import { BasicType } from './types'

export class ValueUndefinedError extends Error {
  constructor (reason: string, contextMessage: string) {
    super(`Value resolution failed: ${reason}; ${contextMessage}`)
  }
}

export class ModelValueUndefinedError extends ValueUndefinedError {
  path: string
  context: Context

  constructor (path: string, context: Context) {
    super(
      'property on the model is undefined',
      `resolved path: ${resolveContextPath(path, context)}`
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
    expectedType: BasicType
  ) {
    super(
      'modifier chain led to undefined',
      `on type "${fromType}" executed command "${command}" as (${String(
        value
      )}, ...[${resolvedArgs
        .map(v => JSON.stringify(v))
        .join(', ')}]), expecting ${expectedType}`
    )
    this.fromType = fromType
    this.command = command
    this.value = value
    this.resolvedArgs = resolvedArgs
    this.expectedType = expectedType
  }
}
