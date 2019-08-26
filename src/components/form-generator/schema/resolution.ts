import { LogicalBranch, Level, If, Elif, Switch, For, Field } from './types'
import { isEqual } from 'lodash'
import memoize from 'memoize-one'

/**
 * Resolution context for all `$each` parts of the model path
 */
export type Context = Array<{
  splitPoint: string
  index: number
}>

interface PreparedDependentBranch {
  /**
   * A type of the prepared branch. Used for a TypeScript discriminated union
   */
  type: 'dependent'
  /**
   * Dependency specification.
   */
  modelPath: string
  /**
   * Resolver function. Must be memoized.
   */
  resolver: (value: any) => PreparedBranch[] | PreparedBranch | undefined
}

/**
 * Prepared simple branch (simple here means it is not dependent on the model)
 */
interface PreparedSimpleBranch {
  /**
   * A type of the prepared branch. Used for a TypeScript discriminated union
   */
  type: 'simple'
  /**
   * Resolver function. Must be memoized.
   */
  resolver: () => PreparedLevel | Field
}

/**
 * Prepared level, which has prepared branches as children.
 */
interface PreparedLevel extends Omit<Level, 'children'> {
  children: PreparedBranch[]
}

/**
 * Branch after preparation.
 * 
 * Necessarily has a `resolver` field with a memoized function.
 */
type PreparedBranch = PreparedDependentBranch | PreparedSimpleBranch

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
interface ResolvedLevel extends Level, Contextualized {
  /**
   * Resolved children of the level
   */
  children: (ResolvedField | ResolvedLevel)[]
}

/**
 * Resolved field, but with resolution context added
 */
interface ResolvedField extends Field, Contextualized {}

/**
 * Prepare a tree for resolution.
 * 
 * Essentially, this function converts the schema into a tree of functions,
 * where each function represents a branching of some kind and is memoized.
 * This allows for a quick resolution with no recalculation of the
 * entire tree on each model change.
 * 
 * @param branch branch to be a root of preparation
 */
export function prepareBranch (branch: LogicalBranch): PreparedBranch {
  switch (branch.type) {
    case 'if':
      return prepareIfBranch(branch)
    case 'elif':
      return prepareElifBranch(branch)
    case 'switch':
      return prepareSwitchBranch(branch)
    case 'for':
      return prepareForBranch(branch)
    case 'level':
      return prepareLevelBranch(branch)
    case 'field':
      return prepareField(branch)
  }
}

/**
 * Prepare an if branch for resolution.
 * 
 * Prepared function is memoized as to avoid recalculation of this part of the schema
 * if the model didn't change.
 * @param branch if-branch for preparation
 */
function prepareIfBranch (branch: If): PreparedBranch {
  const thenBranch = prepareBranch(branch.then)
  const elseBranch = branch.else && prepareBranch(branch.else)

  return {
    type: 'dependent',
    modelPath: branch.modelPath,
    resolver: memoize((value: any) => {
      if (branch.predicate(value)) return thenBranch
      else return elseBranch
    }, isEqual)
  }
}

/**
 * Prepare an elif branch for resolution.
 * 
 * Prepared function is memoized as to avoid recalculation of this part of the schema
 * if the model didn't change.
 * @param branch elif-branch for preparation
 */
function prepareElifBranch (branch: Elif): PreparedBranch {
  const thenBranches = branch.elifs.map(({ predicate, then }) => ({
    predicate,
    then: prepareBranch(then)
  }))
  const elseBranch = branch.else && prepareBranch(branch.else)

  const resolver = memoize((value: any) => {
    for (const { predicate, then } of thenBranches) {
      if (predicate(value)) return then
    }

    return elseBranch
  }, isEqual)

  return {
    type: 'dependent',
    modelPath: branch.modelPath,
    resolver
  }
}

/**
 * Prepare a switch branch for resolution.
 * 
 * Prepared function is memoized as to avoid recalculation of this part of the schema
 * if the model didn't change.
 * @param branch switch-branch for preparation
 */
function prepareSwitchBranch (branch: Switch): PreparedBranch {
  const cases = Object.keys(branch.cases).reduce(
    (agg, key) => {
      agg[key] = prepareBranch(branch.cases[key])
      return agg
    },
    {} as { [k: string]: PreparedBranch }
  )

  const fallback = branch.default && prepareBranch(branch.default)

  const resolver = memoize((value: any) => {
    const result = cases[value]
    if (result !== undefined) {
      return result
    } else {
      return fallback
    }
  }, isEqual)

  return {
    type: 'dependent',
    modelPath: branch.modelPath,
    resolver
  }
}

/**
 * Prepare a for branch for resolution.
 * 
 * Prepared function is memoized as to avoid recalculation of this part of the schema
 * if the model didn't change.
 * @param branch for-branch for preparation
 */
function prepareForBranch (branch: For): PreparedBranch {
  const branchTemplate = prepareBranch(branch.schema)

  const resolver = memoize((value: any) => {
    if (Array.isArray(value)) {
      return value.map(() => branchTemplate)
    }

    return undefined
  }, isEqual)

  return {
    type: 'dependent',
    modelPath: branch.modelPath,
    resolver
  }
}

/**
 * Prepare a level for resolution. Level resolution itself is not dependent on the model,
 * but all the children must be prepared.
 * @param level level for preparation
 */
function prepareLevelBranch (level: Level): PreparedBranch {
  return {
    type: 'simple',
    resolver: memoize(() => ({
      ...level,
      children: level.children.map(v => prepareBranch(v))
    }), isEqual)
  }
}

/**
 * Prepare a field for the resolution. For now, it is not model-dependent.
 * @param field field for preparation
 */
function prepareField (field: Field): PreparedBranch {
  return {
    type: 'simple',
    resolver: memoize(() => field, isEqual)
  }
}

/**
 * Return a value from the model based on the given dot-separated path.
 * 
 * `$each` parts are replaced with the appropriate index based on the context.
 * 
 * @param modelPath Dot-separated path within the model.
 * Array indexing is also dot-based, so `array.3` means `array[3]`.
 * Also, if an `$each` part is encountered instead of the array index, it
 * is replaced (if possible) based on the context
 * 
 * @param model Model, within which the path should be resolved
 * 
 * @param context Context for `$each` parts resolution
 */
export function resolveModelPath (
  modelPath: string | string[],
  model: any,
  context: Context
) {
  const unpreparedPath = Array.isArray(modelPath)
    ? modelPath.join('.')
    : modelPath

  /**
  * This is not a very obvious piece of code.
  * It is here to achieve one thing: replace parts of the path based on the context
  * even if parts of the actual path contain indexes instead of `$each` blocks.
  *
  * This is achieved by taking each split point from the end, and converting it
  * to a regexp, where each `$each` part is replaced by a (\d+|\$each) regex block
  * to account for the possible index in place of the `$each`. Moreover, this split point
  * has to be followed by an `$each` block, which will be replaced by the index - so
  * this part is appended to the regex as well
  * 
  */
  const path = context
    .reduceRight((agg, { index, splitPoint }) => {
      const replaceable =
        '(' +
        splitPoint.replace(/(\$each)/g, '(\\d+|\\$each)').replace('.', '\\.') +
        '\\.)\\$each'
      const replacer = RegExp(replaceable)
      return agg.replace(replacer, '$1' + String(index))
    }, unpreparedPath)
    .split('.')

  return path.reduce((agg, pathPart, currentIndex) => {
    return agg && agg[pathPart]
  }, model)
}

/**
 * Possible values after the resolution.
 * 
 * Can be either a field, a level (both with context and more runtime info)
 * or `undefined` in case the branch must be omitted (like an `else` branch in an if
 * statement which is true)
 */
type ResolutionOptions = ResolvedField | ResolvedLevel | undefined

/**
 * Resolve branch and all its children, returning a tree with no variants within it.
 * 
 * This is a recursive function, which resolves any model-dependent branching within the schema tree
 * and leaves only produced levels and fields in the resulting tree.
 * 
 * Actual resolution is easy to do after the preparation - we only need to call the appropriate
 * function and modify the context if need be. Again, the resolution is quick if only one part
 * of the model changes because each branching path is memoized separately.
 * 
 * @param branch Prepared branch, which needs resolution
 * @param model Model for the values
 * @param context Context, if an `$each` part is present in any path down the line
 */
function resolveBranch (
  branch: PreparedBranch,
  model: any,
  context: Context
): ResolutionOptions | ResolutionOptions[] {
  if (branch.type === 'dependent') {
    const value = resolveModelPath(branch.modelPath, model, context)
    const resolved = branch.resolver(value)

    if (Array.isArray(resolved)) {
      return resolved.flatMap((child, index) =>
        resolveBranch(child, model, [
          ...context,
          {
            splitPoint: branch.modelPath,
            index
          }
        ])
      )
    } else if (resolved !== undefined) {
      return resolveBranch(resolved, model, context)
    }

    return undefined
  } else {
    const resolved = branch.resolver()
    if (resolved.type === 'level') {
      const resolvedChildren = resolved.children
        .flatMap(val => resolveBranch(val, model, context))
        .filter(<T>(val: T | undefined): val is T => val !== undefined)
      return {
        ...resolved,
        children: resolvedChildren,
        _resolutionContext: context
      }
    } else {
      return {
        ...resolved,
        _resolutionContext: context
      }
    }
  }
}

/**
 * Resolve the prepared tree against the actual model.
 * 
 * This function returns a tree, which has no dependencies or variations - every branching
 * option has been resolved at this point, so we can traverse this tree with certainty that
 * only `levels` and `fields` are present.
 * 
 * @param root Prepared root of the tree. Actual schema tree should be
 * ran through the `prepareBranch` before being given to this function
 * @param model Full model against which to resolve all the model-dependent branching.
 */
export function resolveTree (root: PreparedBranch, model: any): ResolutionOptions | ResolutionOptions[] {
  return resolveBranch(root, model, [])
}
