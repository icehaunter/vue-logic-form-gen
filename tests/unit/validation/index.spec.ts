import { prepareValidator } from '@/components/form-generator/validation'

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
