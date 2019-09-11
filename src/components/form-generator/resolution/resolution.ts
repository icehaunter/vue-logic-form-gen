import { Prepared, Context, Resolved } from './types'

/**
 * Possible values after the resolution.
 *
 * Can be either a field, a level (both with context and more runtime info)
 * or `undefined` in case the branch must be omitted (like an `else` branch in an if
 * statement which is true)
 */
type ResolutionOptions = Resolved.Field | Resolved.Level | undefined

/**
 * Resolution of the prepared branch. This means we don't know anything
 * about the branch at this point and it requires further resolution
 * 
 * @param branch Prepared branch - any generic branch
 * @param model Model for dependecies resolution
 * @param context Context for model path resolution
 */
function resolvePreparedBranch (branch: Prepared.Branch, model: any, context: Context) {
  const resolved = branch.resolver(model, context)

  return (resolved && resolveBranch(resolved, model, context))
}

/**
 * Resolution of prepared branch, containing an array of branches.
 * 
 * Means resolving each branch within the array with updated context.
 * 
 * @param branch Prepared branch array
 * @param model Model for dependecies resolution
 * @param context Context for model path resolution
 */
function resolvePreparedBranchArray (branch: Prepared.BranchArray, model: any, context: Context) {
  const resolved = branch.resolver(model, context)

  return (
    resolved &&
    resolved.flatMap((leaf, index) =>
      resolveBranch(leaf, model, [
        ...context,
        { splitPoint: branch.splitPoint, index }
      ])
    )
  )
}

/**
 * Resolution of prepared level, with resolution of all its children
 * 
 * @param branch Prepared level
 * @param model Model for dependecies resolution
 * @param context Context for model path resolution
 */
function resolvePreparedLevel (branch: Prepared.Level, model: any, context: Context) {
  const resolved = branch.resolver(model, context)

  const resolvedChildren = resolved.children
    .flatMap(val => resolveBranch(val, model, context))
    .filter(<T>(val: T | undefined): val is T => val !== undefined)
  return {
    ...resolved,
    children: resolvedChildren,
    _resolutionContext: context
  }
}

/**
 * Resolution of prepared field, with addition of the context
 * 
 * @param branch Prepared level
 * @param model Model for dependecies resolution
 * @param context Context for model path resolution
 */
function resolvePreparedField (branch: Prepared.Field, model: any, context: Context) {
  const resolved = branch.resolver(model, context)

  return {
    ...resolved,
    _resolutionContext: context
  }
}

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
  branch: Prepared.Any,
  model: any,
  context: Context
): ResolutionOptions | ResolutionOptions[] {
  switch (branch._tag) {
    case 'branch':
      return resolvePreparedBranch(branch, model, context)
    case 'array':
      return resolvePreparedBranchArray(branch, model, context)
    case 'level':
      return resolvePreparedLevel(branch, model, context)
    case 'field':
      return resolvePreparedField(branch, model, context)
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
export function resolveTree (
  root: Prepared.Any,
  model: any
): ResolutionOptions | ResolutionOptions[] {
  return resolveBranch(root, model, [])
}
