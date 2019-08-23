import { LogicalBranch, Level, If, Elif, Switch, For, Field } from './types'
import { memoize } from 'lodash'

type Context = Array<{
  splitPoint: string,
  index: number
}>

interface PreparedDependentBranch {
  type: 'dependent'
  modelPath: string

  resolver: (value: any) => PreparedBranch[] | PreparedBranch | undefined
}

interface PreparedSimpleBranch {
  type: 'simple'
  resolver: () => PreparedLevel | Field
}

interface PreparedLevel extends Omit<Level, 'children'> {
  children: PreparedBranch[]
}

type PreparedBranch = PreparedDependentBranch | PreparedSimpleBranch

interface Contextualized {
  _resolutionContext: Context
}

interface ResolvedLevel extends Level, Contextualized {
  children: (ResolvedField | ResolvedLevel)[]
}
interface ResolvedField extends Field, Contextualized {}

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

function prepareIfBranch (branch: If): PreparedBranch {
  const thenBranch = prepareBranch(branch.then)
  const elseBranch = branch.else && prepareBranch(branch.else)

  return {
    type: 'dependent',
    modelPath: branch.modelPath,
    resolver: memoize((value: any) => {
      if (branch.predicate(value)) return thenBranch
      else return elseBranch
    })
  }
}

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
  })

  return {
    type: 'dependent',
    modelPath: branch.modelPath,
    resolver
  }
}

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
  })

  return {
    type: 'dependent',
    modelPath: branch.modelPath,
    resolver
  }
}

function prepareForBranch (branch: For): PreparedBranch {
  const branchTemplate = prepareBranch(branch.schema)

  const resolver = memoize((value: any) => {
    if (Array.isArray(value)) {
      return value.map(() => branchTemplate)
    }

    return undefined
  })

  return {
    type: 'dependent',
    modelPath: branch.modelPath,
    resolver
  }
}

function prepareLevelBranch (branch: Level): PreparedBranch {
  return {
    type: 'simple',
    resolver: () => ({
      ...branch,
      children: branch.children.map(v => prepareBranch(v))
    })
  }
}

function prepareField (field: Field): PreparedBranch {
  return {
    type: 'simple',
    resolver: () => field
  }
}

export function resolveModelPath (
  modelPath: string | string[],
  model: any,
  context: Context
) {
  const copiedContext = [...context]
  const path = Array.isArray(modelPath) ? [...modelPath] : modelPath.split('.')

  return path.reduce((agg, pathPart, currentIndex) => {
    const pathUntilNow = path.slice(0, currentIndex).join('.')

    let resolvedContextPath: string | number | undefined

    if (copiedContext.length && copiedContext[0].splitPoint === pathUntilNow) {
      const contextPoint = copiedContext.shift()

      if (pathPart === '$each' && contextPoint !== undefined) {
        resolvedContextPath = contextPoint.index
      } else {
        resolvedContextPath = pathPart
      }
    } else {
      resolvedContextPath = pathPart
    }

    return agg && agg[resolvedContextPath]
  }, model)
}

type ResolutionOptions = ResolvedField | ResolvedLevel | undefined

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
        resolveBranch(child, model, [...context, {
          splitPoint: branch.modelPath,
          index
        }])
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

export function resolveTree (root: PreparedBranch, model: any) {
  return resolveBranch(root, model, [])
}
