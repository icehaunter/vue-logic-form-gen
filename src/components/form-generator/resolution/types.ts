import { Level as SchemaLevel, Field as SchemaField } from '../schema/types'
import { PreparedValidator } from '../validation'
import { PreparedWidget } from '../widgets'

/**
 * Resolution context for all `$each` parts of the model path
 */
export type Context = Array<{
  splitPoint: string
  index: number
}>

export namespace Prepared {
  interface PreparedField extends Omit<SchemaField, 'validation' | 'classList' | 'widget'> {
    widget: PreparedWidget
    validation?: Array<PreparedValidator>
    classList?: string[]
  }

  interface PreparedLevel extends Omit<SchemaLevel, 'children' | 'classList'> {
    children: Any[],
    classList?: string[]
  }

  export interface Branch {
    _tag: 'branch'
    resolver: (model: any, context: Context) => Any | undefined
  }

  export interface BranchArray {
    _tag: 'array'
    resolver: (model: any, context: Context) => Any[] | undefined
    splitPoint: string
  }

  export interface Level {
    _tag: 'level'
    resolver: (model: any, context: Context) => PreparedLevel
  }

  export interface Field {
    _tag: 'field'
    resolver: (model: any, context: Context) => PreparedField
  }

  export type Any = Branch | BranchArray | Level | Field
}

export namespace Resolved {
  /**
   * Extension interface to add a resolution context to anything
   */
  interface Contextualized {
    /**
     * Context for all the modelPath resolution
     */
    _resolutionContext: Context
  }

  /**
   * Resolved level, which is like the regular level,
   * but with two changes:
   * - It's children are resolved as well (no `if`s or `for`s or other logical splits)
   * - It has a resolution context for the model paths.
   */
  export interface Level extends Omit<SchemaLevel, 'children' | 'classList'>, Contextualized {
    /**
     * Resolved children of the level
     */
    children: (Field | Level)[],
    classList?: string[]
  }

  /**
   * Resolved field, but with resolution context added
   */
  export interface Field extends Omit<SchemaField, 'validation' | 'classList' | 'widget'>, Contextualized {
    widget: PreparedWidget
    validation?: Array<PreparedValidator> | undefined
    classList?: string[]
  }
}
