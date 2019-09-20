import { prepareValidator, collectValidators, PreparedValidator } from '@/components/form-generator/validation'
import { prepareBranch, resolveTree } from '@/components/form-generator/resolution'

describe('validator preparation', () => {
  it('should properly prepare a simple validator', () => {
    const preparer = prepareValidator({}, [])

    const result = preparer({
      type: 'always',
      errorMessage: 'pls',
      level: 'error'
    })

    expect(result).toHaveProperty('type', 'always')
    expect(result).toHaveProperty('errorMessage', 'pls')
    expect(result).toHaveProperty('level', 'error')
    expect(result).toHaveProperty('predicate')

    expect(result.predicate('test')).toBe(true)
    expect(result.predicate(false)).toBe(true)
  })

  it('should properly prepare a predicate with plain parameters', () => {
    const preparer = prepareValidator({}, [])

    const result = preparer({
      type: 'maxLength',
      errorMessage: 'pls',
      level: 'error',
      params: {
        max: 2
      }
    })

    expect(result).toHaveProperty('type', 'maxLength')
    expect(result).toHaveProperty('errorMessage', 'pls')
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
      errorMessage: 'pls',
      level: 'error',
      params: {
        max: {
          _modelPath: 'value'
        }
      }
    })

    expect(result).toHaveProperty('type', 'maxLength')
    expect(result).toHaveProperty('errorMessage', 'pls')
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
      errorMessage: 'pls',
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
    expect(result).toHaveProperty('errorMessage', 'pls')
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
          errorMessage: 'always error'
        }
      ]
    })

    const resolved = resolveTree(prepared, {})

    const validations = collectValidators(resolved)

    expect(validations).toHaveLength(1)
    expect(validations[0]).toHaveLength(2)
    expect(validations[0][0]).toBe('test')
    expect(validations[0][1]).toHaveLength(1)
    expect(validations[0][1][0]).toMatchObject({
      errorMessage: 'always error',
      level: 'error',
      type: 'always'
    })
    expect(validations[0][1][0]).toHaveProperty('predicate')
    expect(validations[0][1][0].predicate(true)).toBe(true)
    expect(validations[0][1][0].predicate(false)).toBe(true)
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
              errorMessage: 'always error'
            }
          ]
        }
      ]
    })

    const resolved = resolveTree(prepared, {})

    const validations = collectValidators(resolved)

    expect(validations).toHaveLength(1)
    expect(validations[0]).toHaveLength(2)
    expect(validations[0][0]).toBe('test')
    expect(validations[0][1]).toHaveLength(1)
    expect(validations[0][1][0]).toMatchObject({
      errorMessage: 'always error',
      level: 'error',
      type: 'always'
    })
    expect(validations[0][1][0]).toHaveProperty('predicate')
    expect(validations[0][1][0].predicate(true)).toBe(true)
    expect(validations[0][1][0].predicate(false)).toBe(true)
  })

  it('should return an empty array if no validations were specified', () => {
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

    expect(validations).toEqual([])
  })

  it('should return all validators if for-loop is present', () => {
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
          { type: 'always', level: 'error', errorMessage: 'error' }
        ]
      }
    })

    const resolved = resolveTree(prepared, {
      arr: ['a', 'b']
    })

    const validations = collectValidators(resolved)

    expect(validations).toHaveLength(2)
    expect(validations.map(([path]) => path)).toEqual(['arr.0', 'arr.1'])
  })

  it('should return empty array if tree was resolved to `undefined`', () => {
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
            errorMessage: 'error',
            level: 'error'
          }
        ]
      }
    })

    const resolved = resolveTree(prepared, {})

    const validations = collectValidators(resolved)

    expect(validations).toEqual([])
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
            errorMessage: 'error',
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
            errorMessage: 'error',
            level: 'error'
          }
        ]
      }
    })

    const resolved = resolveTree(prepared, {})

    const validations = collectValidators(resolved)

    expect(validations).toHaveLength(1)
    expect(validations[0]).toHaveLength(2)
    expect(validations[0][0]).toBe('other')
    expect(validations[0][1]).toHaveLength(1)
    expect(validations[0][1][0]).toMatchObject({
      errorMessage: 'error',
      level: 'error',
      type: 'always'
    })
    expect(validations[0][1][0]).toHaveProperty('predicate')
    expect(validations[0][1][0].predicate(true)).toBe(true)
    expect(validations[0][1][0].predicate(false)).toBe(true)
  })
})
