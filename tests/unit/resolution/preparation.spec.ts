import { prepareBranch } from '@/components/form-generator/resolution'
import { Prepared } from '@/components/form-generator/resolution/types'

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

  describe('Field preparation', () => {
    it('should prepare a field', () => {
      const prepared = prepareBranch({
        type: 'field',
        widget: {
          type: 'span'
        },
        modelPath: 'value'
      })

      expect(prepared._tag).toBe('field')

      const resolved = prepared.resolver({}, [])

      expect(resolved).toEqual({
        type: 'field',
        modelPath: 'value',
        validation: undefined,
        widget: {
          type: 'span'
        }
      })
    })

    it('should prepare modelPath based on context', () => {
      const prepared = prepareBranch({
        type: 'field',
        widget: {
          type: 'span'
        },
        modelPath: 'value.$each.test'
      })

      expect(prepared._tag).toBe('field')

      const resolved = prepared.resolver({}, [
        {
          index: 2,
          splitPoint: 'value'
        }
      ])

      expect(resolved).toEqual({
        type: 'field',
        modelPath: 'value.2.test',
        validation: undefined,
        widget: {
          type: 'span'
        }
      })
    })

    it('should prepare validations', () => {
      const prepared = prepareBranch({
        type: 'field',
        modelPath: 'value',
        widget: {
          type: 'span'
        },
        validation: [
          {
            type: 'minLength',
            message: 'test',
            level: 'error',
            params: { min: { _modelPath: 'min' } }
          }
        ]
      }) as Prepared.Field

      expect(prepared._tag).toBe('field')

      const resolved = prepared.resolver({ min: 2 }, [
        {
          index: 2,
          splitPoint: 'value'
        }
      ])

      expect(resolved).toHaveProperty('type', 'field')
      expect(resolved).toHaveProperty('modelPath', 'value')
      expect(resolved).toHaveProperty('validation')

      expect(resolved.validation).toBeDefined()

      const result = resolved.validation!({ value: 'a' }, [])(true)
      expect(result.info).toHaveLength(0)
      expect(result.warn).toHaveLength(0)
      expect(result.success).toHaveLength(0)
      expect(result.error).toHaveLength(1)

      expect(result.error[0]).toEqual('test')
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

    it('should properly memoize basic model-dependant branching if result is undefined', () => {
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
          _actions: [['boolean', 'or', [{ _modelPath: 'value' }], 'boolean']]
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

      let resolved = prepared.resolver(
        { value: [true, false], other: true },
        []
      )

      expect(resolved).toHaveProperty('_tag', 'level')

      resolved = prepared.resolver(
        { value: [true, false, true], other: false },
        []
      )

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
          _actions: [['boolean', 'not', [], 'boolean']]
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

      resolved = prepared.resolver(
        { value: [true, false, true], other: false },
        [
          {
            splitPoint: 'value',
            index: 1
          }
        ]
      )

      const { cacheHit, cacheMiss } = (prepared.resolver as any).cacheStatistics

      expect(cacheHit).toBe(1)
      expect(cacheMiss).toBe(1)
    })

    it('should properly memoize field resolution', () => {
      const prepared = prepareBranch({
        type: 'field',
        modelPath: 'value.$each.me',
        widget: {
          type: 'span'
        },
        validation: [
          {
            type: 'minLength',
            message: 'test',
            level: 'error',
            params: { min: { _modelPath: 'min' } }
          }
        ]
      }) as Prepared.Field

      expect(prepared._tag).toBe('field')

      let resolved = prepared.resolver({ min: 2, other: 'test' }, [
        {
          index: 2,
          splitPoint: 'value'
        }
      ])

      resolved = prepared.resolver({ min: 2, other: 'please' }, [
        {
          index: 2,
          splitPoint: 'value'
        }
      ])

      expect((prepared.resolver as any).cacheStatistics.cacheHit).toBe(1)
      expect((prepared.resolver as any).cacheStatistics.cacheMiss).toBe(1)

      resolved = prepared.resolver({ min: 3, other: 'please' }, [
        {
          index: 2,
          splitPoint: 'value'
        }
      ])

      expect((prepared.resolver as any).cacheStatistics.cacheHit).toBe(1)
      expect((prepared.resolver as any).cacheStatistics.cacheMiss).toBe(2)

      resolved = prepared.resolver({ min: 3, other: 'ok' }, [
        {
          index: 2,
          splitPoint: 'value'
        }
      ])

      expect((prepared.resolver as any).cacheStatistics.cacheHit).toBe(2)
      expect((prepared.resolver as any).cacheStatistics.cacheMiss).toBe(2)

      resolved = prepared.resolver({ min: 3, other: 'please' }, [
        {
          index: 3,
          splitPoint: 'value'
        }
      ])

      expect((prepared.resolver as any).cacheStatistics.cacheHit).toBe(2)
      expect((prepared.resolver as any).cacheStatistics.cacheMiss).toBe(3)

      resolved = prepared.resolver({ min: 3, other: 'ok' }, [
        {
          index: 3,
          splitPoint: 'value'
        }
      ])

      expect((prepared.resolver as any).cacheStatistics.cacheHit).toBe(3)
      expect((prepared.resolver as any).cacheStatistics.cacheMiss).toBe(3)
    })
  })
})
