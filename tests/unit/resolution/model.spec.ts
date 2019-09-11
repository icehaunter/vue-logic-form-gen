import { resolveModelPath } from '@/components/form-generator/resolution'

describe('resolveModelPath', () => {
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

  it('should work for a nested path with array as an argument', () => {
    const model = {
      deeply: {
        nested: {
          value: true
        }
      }
    }

    const result = resolveModelPath(['deeply', 'nested', 'value'], model, [])

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

  it('should work with an "$each" keyword and proper context', () => {
    const model = {
      deeply: {
        nested: [
          {
            value: true
          }
        ]
      }
    }

    const result = resolveModelPath('deeply.nested.$each.value', model, [
      {
        index: 0,
        splitPoint: 'deeply.nested'
      }
    ])

    expect(result).toBe(true)
  })

  it('should work with an "$each" keyword and proper context with multiple arrays', () => {
    const model = {
      deeply: {
        nested: [
          {
            array: [
              {
                value: true
              }
            ]
          }
        ]
      }
    }

    const result = resolveModelPath(
      'deeply.nested.$each.array.$each.value',
      model,
      [
        {
          index: 0,
          splitPoint: 'deeply.nested'
        },
        {
          index: 0,
          splitPoint: 'deeply.nested.$each.array'
        }
      ]
    )

    expect(result).toBe(true)
  })

  it('should work with an "$each" keyword and use proper context if one $each is hardcoded', () => {
    const model = {
      deeply: {
        nested: [
          {
            array: [
              {
                value: false
              }
            ]
          },
          {
            array: [
              {
                value: true
              }
            ]
          }
        ]
      }
    }

    const result = resolveModelPath(
      'deeply.nested.1.array.$each.value',
      model,
      [
        {
          index: 0,
          splitPoint: 'deeply.nested'
        },
        {
          index: 0,
          splitPoint: 'deeply.nested.$each.array'
        }
      ]
    )

    expect(result).toBe(true)
  })
})
