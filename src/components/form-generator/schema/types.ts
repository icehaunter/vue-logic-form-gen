import { ModifierChain } from '../logic/modifiers'
import { Value } from '../logic/value'

/**
 * This module contains the types for the building blocks of the
 * schema for the form tree.
 *
 * Form tree has three main types of building blocks: a level, a field
 * and a logical block.
 *
 * Levels are the most basic of concepts. They are defined in the interface `Level`,
 * and essentially represent a `<div>` in the final markup. They can have context to render
 * header/footer and have children, but that's it.
 *
 * Fields are the meat of the schema - those represent an actual input of some kind on the
 * form. Fields are bound to the properties of the model - think of this field as a v-model.
 * Field rendering is defined by the widget property. Any validations for the specified model
 * are also defined here. If multiple fields in the schema point to the same `modelPath`, their
 * validations are collected and merged together, although it is recommended to define all validations
 * on one field in such case - for maintainability.
 *
 * Logical blocks are the most interesting part of the schema - they allow for creation of complex and
 * dynamic layouts. They come in four types: `If`, `Elif`, `Switch` and `For`. First three allow branching
 * or conditional rendering of parts of the schema tree, while `For` gives an ability to render fields
 * for each item of an array of values. All logical blocks are dependent on one field by default. This
 * is by design, as it allows to keep parts of the schema from recalculation.
 * @module
 */

interface TypedBlock {
  /**
   * A tag to differentiate between possible blocks at render
   */
  type: string
}

/**
 * A level in the form tree.
 */
export interface Level extends TypedBlock {
  type: 'level'
  /**
   * Can be anything. Affects only the class of the rendered div.
   */
  level: string
  /**
   * Can be anything. Is passed to the header and footer slot at rendering.
   */
  context?: any
  /**
   * Children of the level.
   */
  children: LogicalBranch[]
}

export interface ModelDependent extends TypedBlock {
  /**
   * Dot-separated path within the model object. This is the
   * path to be bound to the field and updated accordingly
   *
   * If the leaf is within a `For` construct, current array index can
   * be referenced by `$each` in place of the index.
   *
   * Examples:
   * ```
   * path.within.object
   * path.within.array.$each
   * array.$each.object
   * ```
   */
  modelPath: string
}

/**
 * A leaf in the form tree. Represents the actual field to be rendered
 * within the markup.
 */
export interface Field extends ModelDependent {
  type: 'field'
  widget?: any
  validation?: any
  transform?: any
  logic?: any
}

/**
 * Anything branch within the form tree
 */
export type Branch = Level | Field

/**
 * A conditional split within the form tree.
 *
 * This block represents a simple if-else branching within the
 * tree. `else` branch is optional.
 *
 * If `else` branch is not present and the predicate evaluated to `false`,
 * nothing is rendered in the tree.
 */
export interface If {
  type: 'if'
  /**
   * Predicate based on the value from `modelPath`.
   * Will be reevaluated only on change of the underlying model value
   */
  predicate: Value<boolean>
  /**
   * Branch to follow if the predicate is true
   */
  then: LogicalBranch
  /**
   * Branch to follow if the predicate is false
   */
  else?: LogicalBranch
}

/**
 * A complex conditional split within the tree
 *
 * This block represents a series of if-else-if cases against the
 * same value. `elifs` are evaluated in the order they are in the array.
 * Final `else` branch is optional
 *
 * If `else` branch is not present and all predicates evaluated to `false`,
 * nothing is rendered in the tree.
 */
export interface Elif {
  type: 'elif'
  /**
   * Array of predicates and corresponding branches
   */
  elifs: Array<{
    predicate: Value<boolean>
    then: LogicalBranch
  }>
  /**
   * Fallback if nothing from `elifs` was appropriate
   */
  else?: LogicalBranch
}

/**
 * A value-based split within the tree.
 *
 * This block represents a switch-case style branching within the tree.
 * Value is taken from the model by the `modelPath`. The value is then used as a key
 * for a `cases` object. If the branch for that value is present, it is rendered,
 * overwise `default` is rendered if it is present.
 *
 * If no default branch is provided, and nothing matched the value within the `cases` object,
 * nothing is rendered.
 */
export interface Switch {
  type: 'switch'

  value: Value<string>

  /**
   * Cases from which to choose a branch based on the value from the model
   */
  cases: {
    [k: string]: LogicalBranch
  }
  /**
   * Fallback for when nothing matched the value in `cases`
   */
  default?: LogicalBranch
}

/**
 * A block to render a branch for each array element
 *
 * This blocks represent a for loop within the tree. It renders
 * a subtree for each value within the array from the model
 * (accessed by `modelPath`).
 *
 * Anything model-dependent inside the schema can use a special `$each`
 * keyword within the dot notaion, which will be appropriately replaced by the
 * index of the array element.
 */
export interface For extends ModelDependent {
  type: 'for'
  schema: LogicalBranch
}

/**
 * Any part of the schema tree.
 */
export type LogicalBranch = Branch | If | Elif | Switch | For
