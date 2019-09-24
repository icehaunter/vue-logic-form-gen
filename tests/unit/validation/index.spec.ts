import { prepareValidator, collectValidators, PreparedValidator, getValidity } from '@/components/form-generator/validation'
import { prepareBranch, resolveTree } from '@/components/form-generator/resolution'

describe('validator preparation', () => {
  it('should properly prepare a simple validator', () => {
    const preparer = prepareValidator({}, [])

    const result = preparer({
      type: 'always',
      message: 'pls',
      level: 'error'
    })

    expect(result).toHaveProperty('type', 'always')
    expect(result).toHaveProperty('message', 'pls')
    expect(result).toHaveProperty('level', 'error')
    expect(result).toHaveProperty('predicate')

    expect(result.predicate('test')).toBe(false)
    expect(result.predicate(false)).toBe(false)
  })

  it('should properly prepare a predicate with plain parameters', () => {
    const preparer = prepareValidator({}, [])

    const result = preparer({
      type: 'maxLength',
      message: 'pls',
      level: 'error',
      params: {
        max: 2
      }
    })

    expect(result).toHaveProperty('type', 'maxLength')
    expect(result).toHaveProperty('message', 'pls')
    expect(result).toHaveProperty('level', 'error')
    expect(result).toHaveProperty('predicate')

    expect(result.predicate('1')).toBe(true)
    expect(result.predicate('12')).toBe(true)
    expect(result.predicate('123')).toBe(false)
  })

  it('should properly prepare a predicate with model-dependent parameter', () => {
    const preparer = prepareValidator({ value: 2 }, [])

    const result = preparer({
      type: 'maxLength',
      message: 'pls',
      level: 'error',
      params: {
        max: {
          _modelPath: 'value'
        }
      }
    })

    expect(result).toHaveProperty('type', 'maxLength')
    expect(result).toHaveProperty('message', 'pls')
    expect(result).toHaveProperty('level', 'error')
    expect(result).toHaveProperty('predicate')

    expect(result.predicate('1')).toBe(true)
    expect(result.predicate('12')).toBe(true)
    expect(result.predicate('123')).toBe(false)
  })

  it('should properly prepare a predicate with value builder as a parameter', () => {
    const preparer = prepareValidator({ divideBy: 5, multiplyBy: 2 }, [])

    const result = preparer({
      type: 'maxLength',
      message: 'pls',
      level: 'error',
      params: {
        max: {
          _buildFrom: 10,
          _actions: [
            ['number', 'div', [{ _modelPath: 'divideBy' }], 'number'],
            ['number', 'mul', [{ _modelPath: 'multiplyBy' }], 'number'],
            ['number', 'sub', [2], 'number']
          ]
        }
      }
    })

    expect(result).toHaveProperty('type', 'maxLength')
    expect(result).toHaveProperty('message', 'pls')
    expect(result).toHaveProperty('level', 'error')
    expect(result).toHaveProperty('predicate')

    expect(result.predicate('1')).toBe(true)
    expect(result.predicate('12')).toBe(true)
    expect(result.predicate('123')).toBe(false)
  })
})

describe('validator collection', () => {
  it('should properly collect a validator from a prepared field', () => {
    const prepared = prepareBranch({
      type: 'field',
      modelPath: 'test',
      widget: {
        type: 'span'
      },
      validation: [
        {
          type: 'always',
          level: 'error',
          message: 'always error'
        }
      ]
    })

    const resolved = resolveTree(prepared, { test: 'any' })

    const validations = collectValidators(resolved)

    expect(validations).toHaveProperty('test')

    expect(validations.test(false).error).toHaveLength(0)
    expect(validations.test(false).warn).toHaveLength(0)
    expect(validations.test(false).info).toHaveLength(0)
    expect(validations.test(false).success).toHaveLength(0)

    expect(validations.test(true).error).toHaveLength(1)
    expect(validations.test(true).warn).toHaveLength(0)
    expect(validations.test(true).info).toHaveLength(0)
    expect(validations.test(true).success).toHaveLength(0)

    expect(validations.test(true).error[0]).toEqual('always error')
  })

  it('should properly collect a validator from a prepared level', () => {
    const prepared = prepareBranch({
      type: 'level',
      level: 'top',
      children: [
        {
          type: 'field',
          modelPath: 'test',
          widget: {
            type: 'span'
          },
          validation: [
            {
              type: 'always',
              level: 'error',
              message: 'always error'
            }
          ]
        }
      ]
    })

    const resolved = resolveTree(prepared, {})

    const validations = collectValidators(resolved)

    expect(validations).toHaveProperty('test')

    expect(validations.test(false).error).toHaveLength(0)
    expect(validations.test(false).warn).toHaveLength(0)
    expect(validations.test(false).info).toHaveLength(0)
    expect(validations.test(false).success).toHaveLength(0)

    expect(validations.test(true).error).toHaveLength(1)
    expect(validations.test(true).warn).toHaveLength(0)
    expect(validations.test(true).info).toHaveLength(0)
    expect(validations.test(true).success).toHaveLength(0)

    expect(validations.test(true).error[0]).toEqual('always error')
  })

  it('should collect nothing if no validations were specified', () => {
    const prepared = prepareBranch({
      type: 'level',
      level: 'top',
      children: [
        {
          type: 'field',
          modelPath: 'test',
          widget: {
            type: 'span'
          }
        }
      ]
    })

    const resolved = resolveTree(prepared, {})

    const validations = collectValidators(resolved)

    expect(validations).toEqual({})
  })

  it('should collect all validators if for-loop is present', () => {
    const prepared = prepareBranch({
      type: 'for',
      modelPath: 'arr',
      schema: {
        type: 'field',
        modelPath: 'arr.$each',
        widget: {
          type: 'span'
        },
        validation: [
          { type: 'always', level: 'error', message: 'error' }
        ]
      }
    })

    const resolved = resolveTree(prepared, {
      arr: ['a', 'b']
    })

    const validations = collectValidators(resolved)

    expect(Object.keys(validations)).toEqual(['arr.0', 'arr.1'])
  })

  it('should return empty object if tree was resolved to `undefined`', () => {
    const prepared = prepareBranch({
      type: 'if',
      predicate: false,
      then: {
        type: 'field',
        modelPath: 'test',
        widget: {
          type: 'span'
        },
        validation: [
          {
            type: 'always',
            message: 'error',
            level: 'error'
          }
        ]
      }
    })

    const resolved = resolveTree(prepared, {})

    const validations = collectValidators(resolved)

    expect(validations).toEqual({})
  })

  it('should collect and apply all validators if multiple fields specify them', () => {
    const prepared = prepareBranch({
      type: 'level',
      level: 'test',
      children: [{
        type: 'field',
        modelPath: 'arr',
        widget: {
          type: 'span'
        },
        validation: [
          { type: 'always', level: 'error', message: 'error' },
          { type: 'always', level: 'info', message: 'info' }
        ]
      },
      {
        type: 'field',
        modelPath: 'arr',
        widget: {
          type: 'span'
        },
        validation: [
          { type: 'always', level: 'error', message: 'other error' }
        ]
      }]
    })

    const resolved = resolveTree(prepared, {
      arr: ['a', 'b']
    })

    const validations = collectValidators(resolved)

    expect(validations).toHaveProperty('arr')

    const applied = validations.arr(true)

    expect(applied.error).toHaveLength(2)
    expect(applied.error).toContain('error')
    expect(applied.error).toContain('other error')
    expect(applied.info).toHaveLength(1)
  })

  it('should properly collect only validators in resolved branches', () => {
    const prepared = prepareBranch({
      type: 'if',
      predicate: false,
      then: {
        type: 'field',
        modelPath: 'test',
        widget: {
          type: 'span'
        },
        validation: [
          {
            type: 'always',
            message: 'error',
            level: 'error'
          }
        ]
      },
      else: {
        type: 'field',
        modelPath: 'other',
        widget: {
          type: 'span'
        },
        validation: [
          {
            type: 'always',
            message: 'error',
            level: 'error'
          }
        ]
      }
    })

    const resolved = resolveTree(prepared, {})

    const validations = collectValidators(resolved)

    expect(validations).toHaveProperty('other')
    expect(validations.other(false).error).toHaveLength(0)
    expect(validations.other(false).warn).toHaveLength(0)
    expect(validations.other(false).info).toHaveLength(0)
    expect(validations.other(false).success).toHaveLength(0)

    expect(validations.other(true).error).toHaveLength(1)
    expect(validations.other(true).warn).toHaveLength(0)
    expect(validations.other(true).info).toHaveLength(0)
    expect(validations.other(true).success).toHaveLength(0)

    expect(validations.other(true).error[0]).toEqual('error')
  })
})

describe('validity test', () => {
  it('should count error messages for "error" level by default', () => {
    const result = getValidity({
      'a': () => ({
        error: ['error'],
        warn: ['warn'],
        info: ['info'],
        success: ['success']
      }),

      'b': () => ({
        error: [],
        warn: [],
        info: [],
        success: []
      })
    })

    expect(result.valid).toEqual(1)
    expect(result.total).toEqual(2)
    expect(result.allValid).toBe(false)
  })
})
