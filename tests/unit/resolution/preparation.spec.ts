import { prepareBranch } from '@/components/form-generator/resolution'

describe('prepareBranch', () => {
  it('should prepare a simple branch', () => {
    const prepared = prepareBranch({
      type: 'level',
      children: [],
      level: 'test'
    })

    expect(prepared._tag).toBe('level')

    const resolved = prepared.resolver({}, [])

    expect(resolved).toEqual({
      type: 'level',
      children: [],
      level: 'test'
    })
  })

  it('should prepare a field', () => {
    const prepared = prepareBranch({
      type: 'field',
      modelPath: ''
    })

    expect(prepared._tag).toBe('field')

    const resolved = prepared.resolver({}, [])

    expect(resolved).toEqual({
      type: 'field',
      modelPath: ''
    })
  })

  it('should prepare a branch with children', () => {
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

    expect(prepared._tag).toBe('level')
  })

  describe('resolution memoization', () => {
    it('should properly memoize basic model-dependant branching', () => {
      const prepared = prepareBranch({
        type: 'if',
        predicate: {
          _modelPath: 'value'
        },
        then: {
          type: 'level',
          level: 'then',
          children: []
        }
      })

      let resolved = prepared.resolver({ value: true, other: true }, [])

      expect(resolved).toHaveProperty('_tag', 'level')

      resolved = prepared.resolver({ value: true, other: false }, [])

      const { cacheHit, cacheMiss } = (prepared.resolver as any).cacheStatistics

      expect(cacheHit).toBe(1)
      expect(cacheMiss).toBe(1)
    })

    it('should properly memoize basic model-dependant branching if undefined or null', () => {
      const prepared = prepareBranch({
        type: 'if',
        predicate: {
          _modelPath: 'value'
        },
        then: {
          type: 'level',
          level: 'then',
          children: []
        },
        else: {
          type: 'level',
          level: 'else',
          children: []
        }
      })

      let resolved = prepared.resolver({ other: true }, [])

      expect(resolved).toHaveProperty('_tag', 'level')

      resolved = prepared.resolver({ other: false }, [])

      resolved = prepared.resolver({ value: null, other: true }, [])

      resolved = prepared.resolver({ value: null, other: false }, [])

      const { cacheHit, cacheMiss } = (prepared.resolver as any).cacheStatistics

      expect(cacheHit).toBe(2)
      expect(cacheMiss).toBe(2)
    })

    // TODO: Reenable skipped test after resolution of underlying issue in the library https://github.com/theKashey/memoize-state/issues/35
    it.skip('should properly memoize basic model-dependant branching if result is undefined', () => {
      const prepared = prepareBranch({
        type: 'if',
        predicate: {
          _modelPath: 'value'
        },
        then: {
          type: 'level',
          level: 'then',
          children: []
        }
      })

      let resolved = prepared.resolver({ value: false, other: true }, [])

      expect(resolved).toBeUndefined()

      resolved = prepared.resolver({ value: false, other: false }, [])

      const { cacheHit, cacheMiss } = (prepared.resolver as any).cacheStatistics

      expect(cacheHit).toBe(1)
      expect(cacheMiss).toBe(1)
    })

    it('should properly memoize model-dependant branching with complex actions', () => {
      const prepared = prepareBranch({
        type: 'if',
        predicate: {
          _buildFrom: false,
          _actions: [
            ['boolean', 'or', [{ _modelPath: 'value' }], 'boolean']
          ]
        },
        then: {
          type: 'level',
          level: 'then',
          children: []
        }
      })

      let resolved = prepared.resolver({ value: true, other: true }, [])

      expect(resolved).toHaveProperty('_tag', 'level')

      resolved = prepared.resolver({ value: true, other: false }, [])

      const { cacheHit, cacheMiss } = (prepared.resolver as any).cacheStatistics

      expect(cacheHit).toBe(1)
      expect(cacheMiss).toBe(1)
    })

    it('should properly memoize model-dependant branching with actions and arrays', () => {
      const prepared = prepareBranch({
        type: 'if',
        predicate: {
          _buildFrom: {
            _modelPath: 'value'
          },
          _actions: [
            ['array', 'at', [1], 'boolean'],
            ['boolean', 'not', [], 'boolean']
          ]
        },
        then: {
          type: 'level',
          level: 'then',
          children: []
        }
      })

      let resolved = prepared.resolver({ value: [true, false], other: true }, [])

      expect(resolved).toHaveProperty('_tag', 'level')

      resolved = prepared.resolver({ value: [true, false, true], other: false }, [])

      const { cacheHit, cacheMiss } = (prepared.resolver as any).cacheStatistics

      expect(cacheHit).toBe(1)
      expect(cacheMiss).toBe(1)
    })

    it('should properly memoize model-dependant branching with arrays and context', () => {
      const prepared = prepareBranch({
        type: 'if',
        predicate: {
          _buildFrom: {
            _modelPath: 'value.$each'
          },
          _actions: [
            ['boolean', 'not', [], 'boolean']
          ]
        },
        then: {
          type: 'level',
          level: 'then',
          children: []
        }
      })

      let resolved = prepared.resolver({ value: [true, false], other: true }, [
        {
          splitPoint: 'value',
          index: 1
        }
      ])

      expect(resolved).toHaveProperty('_tag', 'level')

      resolved = prepared.resolver({ value: [true, false, true], other: false }, [
        {
          splitPoint: 'value',
          index: 1
        }
      ])

      const { cacheHit, cacheMiss } = (prepared.resolver as any).cacheStatistics

      expect(cacheHit).toBe(1)
      expect(cacheMiss).toBe(1)
    })
  })
})
