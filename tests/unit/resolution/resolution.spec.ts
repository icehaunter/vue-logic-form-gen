import {
  prepareBranch,
  resolveTree
} from '@/components/form-generator/resolution'

describe('resolveTree', () => {
  it('should build a real tree based on the simple prepared one', () => {
    const prepared = prepareBranch({
      type: 'level',
      level: 'parent',
      children: [
        {
          type: 'level',
          children: [
            {
              type: 'field',
              modelPath: ''
            }
          ],
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
          children: [
            {
              _resolutionContext: [],
              type: 'field',
              modelPath: ''
            }
          ],
          level: 'child'
        }
      ]
    })
  })

  describe('tree building with if branching', () => {
    it('should resolve "then" branch if value is true', () => {
      const prepared = prepareBranch({
        type: 'if',
        predicate: {
          _modelPath: 'value'
        },
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
        predicate: {
          _modelPath: 'value'
        },
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
        predicate: {
          _modelPath: 'value'
        },
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

    it('should resolve to else branch if value is missing altogether', () => {
      const prepared = prepareBranch({
        type: 'if',
        predicate: {
          _modelPath: 'value'
        },
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

      const resolved = resolveTree(prepared, {})
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
        elifs: [
          {
            predicate: {
              _buildFrom: {
                _modelPath: 'value'
              },
              _actions: [['boolean', 'not', [], 'boolean']]
            },
            then: {
              type: 'level',
              level: 'First child',
              children: []
            }
          },
          {
            predicate: {
              _modelPath: 'value'
            },
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
        elifs: [
          {
            predicate: {
              _modelPath: 'value'
            },
            then: {
              type: 'level',
              level: 'First child',
              children: []
            }
          },
          {
            predicate: {
              _modelPath: 'value'
            },
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
        elifs: [
          {
            predicate: {
              _modelPath: 'value'
            },
            then: {
              type: 'level',
              level: 'First child',
              children: []
            }
          },
          {
            predicate: {
              _modelPath: 'value'
            },
            then: {
              type: 'level',
              level: 'Second child',
              children: []
            }
          }
        ]
      })

      const resolved = resolveTree(prepared, { value: false })

      expect(resolved).toBeUndefined()
    })

    it('should should resolve to an else branch if all else fails', () => {
      const prepared = prepareBranch({
        type: 'elif',
        elifs: [
          {
            predicate: false,
            then: {
              type: 'level',
              level: 'First child',
              children: []
            }
          },
          {
            predicate: false,
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
        value: {
          _modelPath: 'value'
        },
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
        value: {
          _modelPath: 'value'
        },
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

    it('should resolve to `undefined` if value is not present on the model', () => {
      const prepared = prepareBranch({
        type: 'switch',
        value: {
          _modelPath: 'value'
        },
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

      const resolved = resolveTree(prepared, { })

      expect(resolved).toBeUndefined()
    })

    it('should resolve to default branch if value is not present in cases and default is given', () => {
      const prepared = prepareBranch({
        type: 'switch',
        value: {
          _modelPath: 'value'
        },
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
          _resolutionContext: [
            {
              index: 0,
              splitPoint: 'value'
            }
          ],
          type: 'level',
          level: 'forChild',
          children: []
        },
        {
          _resolutionContext: [
            {
              index: 1,
              splitPoint: 'value'
            }
          ],
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
    it('should filter out children resolved to undefined', () => {
      const prepared = prepareBranch({
        type: 'level',
        level: 'parent',
        children: [
          {
            type: 'if',
            predicate: {
              _modelPath: 'value'
            },
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
