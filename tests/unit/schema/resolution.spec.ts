import {
  prepareBranch,
  resolveTree,
  resolveModelPath
} from '@/components/form-generator/schema/resolution'

describe.only('resolveModelPath', () => {
  it('should return a basic value based on the path', () => {
    const model = {
      value: true
    }

    const result = resolveModelPath('value', model, [])

    expect(result).toBe(true)
  })

  it('should work for a nested path', () => {
    const model = {
      deeply: {
        nested: {
          value: true
        }
      }
    }

    const result = resolveModelPath('deeply.nested.value', model, [])

    expect(result).toBe(true)
  })

  it('should work for a path with explicit array index', () => {
    const model = {
      deeply: {
        nested: [
          {
            value: true
          }
        ]
      }
    }

    const result = resolveModelPath('deeply.nested.0.value', model, [])

    expect(result).toBe(true)
  })
})

describe('prepareBranch', () => {
  it('should build a prepare a simple branch', () => {
    const prepared = prepareBranch({
      type: 'level',
      children: [],
      level: 'test'
    })

    expect(prepared.type).toBe('simple')

    const resolved = prepared.resolver(undefined)

    expect(resolved).toEqual({
      type: 'level',
      children: [],
      level: 'test'
    })
  })

  it('should build a prepare a branch with children', () => {
    const prepared = prepareBranch({
      type: 'level',
      children: [
        {
          type: 'level',
          children: [],
          level: 'child'
        }
      ],
      level: 'test'
    })

    expect(prepared.type).toBe('simple')
  })
})

describe('resolveTree', () => {
  it('should build a real tree based on the simple prepared one', () => {
    const prepared = prepareBranch({
      type: 'level',
      level: 'parent',
      children: [
        {
          type: 'level',
          children: [],
          level: 'child'
        }
      ]
    })

    const resolved = resolveTree(prepared, {})

    expect(resolved).toEqual({
      _resolutionContext: [],
      type: 'level',
      level: 'parent',
      children: [
        {
          _resolutionContext: [],
          type: 'level',
          children: [],
          level: 'child'
        }
      ]
    })
  })

  describe('tree building with if branching', () => {
    it('should resolve "then" branch if value is true', () => {
      const prepared = prepareBranch({
        type: 'if',
        modelPath: 'value',
        predicate: (k: boolean) => k,
        then: {
          type: 'level',
          children: [],
          level: 'true'
        }
      })

      const resolved = resolveTree(prepared, { value: true })

      expect(resolved).toEqual({
        _resolutionContext: [],
        type: 'level',
        children: [],
        level: 'true'
      })
    })

    it('should resolve to `undefined` if value is false and else branch is missing', () => {
      const prepared = prepareBranch({
        type: 'if',
        modelPath: 'value',
        predicate: (k: boolean) => k,
        then: {
          type: 'level',
          children: [],
          level: 'true'
        }
      })

      const resolved = resolveTree(prepared, { value: false })

      expect(resolved).toBeUndefined()
    })

    it('should resolve to else branch if value is false', () => {
      const prepared = prepareBranch({
        type: 'if',
        modelPath: 'value',
        predicate: (k: boolean) => k,
        then: {
          type: 'level',
          children: [],
          level: 'true'
        },
        else: {
          type: 'level',
          children: [],
          level: 'false'
        }
      })

      const resolved = resolveTree(prepared, { value: false })

      expect(resolved).toEqual({
        _resolutionContext: [],
        type: 'level',
        children: [],
        level: 'false'
      })
    })
  })

  describe('tree building with elif branching', () => {
    it('should should resolve to a truthful predicate', () => {
      const prepared = prepareBranch({
        type: 'elif',
        modelPath: 'value',
        elifs: [
          {
            predicate: (x: boolean) => !x,
            then: {
              type: 'level',
              level: 'First child',
              children: []
            }
          },
          {
            predicate: (x: boolean) => x,
            then: {
              type: 'level',
              level: 'Second child',
              children: []
            }
          }
        ]
      })

      const resolved = resolveTree(prepared, { value: true })

      expect(resolved).toEqual({
        _resolutionContext: [],
        type: 'level',
        level: 'Second child',
        children: []
      })
    })

    it('should should resolve to a first truthful predicate', () => {
      const prepared = prepareBranch({
        type: 'elif',
        modelPath: 'value',
        elifs: [
          {
            predicate: (x: boolean) => x,
            then: {
              type: 'level',
              level: 'First child',
              children: []
            }
          },
          {
            predicate: (x: boolean) => x,
            then: {
              type: 'level',
              level: 'Second child',
              children: []
            }
          }
        ]
      })

      const resolved = resolveTree(prepared, { value: true })

      expect(resolved).toEqual({
        _resolutionContext: [],
        type: 'level',
        level: 'First child',
        children: []
      })
    })

    it('should should resolve to `undefined` if else is not present and nothing matched', () => {
      const prepared = prepareBranch({
        type: 'elif',
        modelPath: 'value',
        elifs: [
          {
            predicate: (x: boolean) => !x,
            then: {
              type: 'level',
              level: 'First child',
              children: []
            }
          },
          {
            predicate: (x: boolean) => !x,
            then: {
              type: 'level',
              level: 'Second child',
              children: []
            }
          }
        ]
      })

      const resolved = resolveTree(prepared, { value: true })

      expect(resolved).toBeUndefined()
    })

    it('should should resolve to an else branch if all else fails', () => {
      const prepared = prepareBranch({
        type: 'elif',
        modelPath: 'value',
        elifs: [
          {
            predicate: (x: boolean) => false,
            then: {
              type: 'level',
              level: 'First child',
              children: []
            }
          },
          {
            predicate: (x: boolean) => false,
            then: {
              type: 'level',
              level: 'Second child',
              children: []
            }
          }
        ],
        else: {
          type: 'level',
          level: 'Else',
          children: []
        }
      })

      const resolved = resolveTree(prepared, { value: true })

      expect(resolved).toEqual({
        _resolutionContext: [],
        type: 'level',
        level: 'Else',
        children: []
      })
    })
  })

  describe('tree building with switch branching', () => {
    it('should properly present the branch based on the model value', () => {
      const prepared = prepareBranch({
        type: 'switch',
        modelPath: 'value',
        cases: {
          first: {
            type: 'level',
            level: 'first',
            children: []
          },
          second: {
            type: 'level',
            level: 'second',
            children: []
          }
        }
      })

      const resolved = resolveTree(prepared, { value: 'second' })

      expect(resolved).toEqual({
        _resolutionContext: [],
        type: 'level',
        level: 'second',
        children: []
      })
    })

    it('should resolve to `undefined` if value is not present in cases', () => {
      const prepared = prepareBranch({
        type: 'switch',
        modelPath: 'value',
        cases: {
          first: {
            type: 'level',
            level: 'first',
            children: []
          },
          second: {
            type: 'level',
            level: 'second',
            children: []
          }
        }
      })

      const resolved = resolveTree(prepared, { value: 'third' })

      expect(resolved).toBeUndefined()
    })

    it('should resolve to default branch if value is not present in cases and default is given', () => {
      const prepared = prepareBranch({
        type: 'switch',
        modelPath: 'value',
        cases: {
          first: {
            type: 'level',
            level: 'first',
            children: []
          },
          second: {
            type: 'level',
            level: 'second',
            children: []
          }
        },
        default: {
          type: 'level',
          level: 'default',
          children: []
        }
      })

      const resolved = resolveTree(prepared, { value: 'third' })

      expect(resolved).toEqual({
        _resolutionContext: [],
        type: 'level',
        level: 'default',
        children: []
      })
    })
  })

  describe('tree building with for branching', () => {
    it('should resolve to an array of branches with proper context', () => {
      const prepared = prepareBranch({
        type: 'for',
        modelPath: 'value',
        schema: {
          type: 'level',
          level: 'forChild',
          children: []
        }
      })

      const resolved = resolveTree(prepared, {
        value: ['first', 'second']
      })

      expect(resolved).toEqual([
        {
          _resolutionContext: [0],
          type: 'level',
          level: 'forChild',
          children: []
        },
        {
          _resolutionContext: [1],
          type: 'level',
          level: 'forChild',
          children: []
        }
      ])
    })

    it('should resolve to `undefined` if value is not an array', () => {
      const prepared = prepareBranch({
        type: 'for',
        modelPath: 'value',
        schema: {
          type: 'level',
          level: 'forChild',
          children: []
        }
      })

      const resolved = resolveTree(prepared, {
        value: false
      })

      expect(resolved).toBeUndefined()
    })
  })

  describe('complex cases', () => {
    it('should filter out children resolved ot undefined', () => {
      const prepared = prepareBranch({
        type: 'level',
        level: 'parent',
        children: [
          {
            type: 'if',
            modelPath: 'value',
            predicate: (x: boolean) => x,
            then: {
              type: 'level',
              level: 'child',
              children: []
            }
          },
          {
            type: 'level',
            level: 'child2',
            children: []
          }
        ]
      })

      const resolved = resolveTree(prepared, { value: false })

      expect(resolved).toEqual({
        _resolutionContext: [],
        type: 'level',
        level: 'parent',
        children: [
          {
            _resolutionContext: [],
            type: 'level',
            level: 'child2',
            children: []
          }
        ]
      })
    })
  })
})
