import {
  LogicalBranch,
  If,
  Elif,
  Switch,
  For,
  Level,
  Field
} from '../schema/types'
import { Prepared, Context } from './types'
import memoize from 'memoize-state'
import { resolveValue } from '../logic'

type PreparedBranch = Prepared.Any

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
    _tag: 'branch',
    resolver: memoize((model: any, context: Context) => {
      const value = resolveValue(branch.predicate, model, context, {
        returnUndefined: true
      })
      if (value) return thenBranch
      else return elseBranch
    })
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

  const resolver = memoize((model: any, context: Context) => {
    for (const { predicate, then } of thenBranches) {
      if (resolveValue(predicate, model, context, { returnUndefined: true })) {
        return then
      }
    }

    return elseBranch
  })

  return {
    _tag: 'branch',
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

  const resolver = memoize((model: any, context: Context) => {
    const key = resolveValue(branch.value, model, context, {
      returnUndefined: true
    })

    const result = key !== undefined ? cases[key] : undefined
    if (result !== undefined) {
      return result
    } else {
      return fallback
    }
  })

  return {
    _tag: 'branch',
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

  const resolver = memoize((model: any, context: Context) => {
    const value = resolveValue(
      { _modelPath: branch.modelPath },
      model,
      context,
      { returnUndefined: true }
    )
    if (Array.isArray(value)) {
      return value.map(() => branchTemplate)
      // return undefined
    }

    return undefined
  })

  return {
    _tag: 'array',
    resolver,
    splitPoint: branch.modelPath
  }
}

/**
 * Prepare a level for resolution. Level resolution itself is not dependent on the model,
 * but all the children must be prepared.
 * @param level level for preparation
 */
function prepareLevelBranch (level: Level): PreparedBranch {
  return {
    _tag: 'level',
    resolver: memoize(() => ({
      ...level,
      children: level.children.map(v => prepareBranch(v))
    }))
  }
}

/**
 * Prepare a field for the resolution. For now, it is not model-dependent.
 * @param field field for preparation
 */
function prepareField (field: Field): PreparedBranch {
  return {
    _tag: 'field',
    resolver: () => field
  }
}
