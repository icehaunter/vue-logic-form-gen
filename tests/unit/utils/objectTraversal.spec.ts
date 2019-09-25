import { getByPath } from '@/form-generator/utils/objectTraversal'

describe('Test getting object property by path', () => {
  it('should get a basic property at object root', () => {
    const target = {
      a: 1
    }

    const result = getByPath<number>(target, 'a')

    expect(result).toBe(1)
  })

  it('should get a basic property under nested objects', () => {
    const target = {
      a: {
        b: {
          c: 2
        }
      }
    }

    const result = getByPath<number>(target, 'a.b.c')

    expect(result).toBe(2)
  })

  it('should return undefined if path cannot be traversed', () => {
    const target = {
      a: {
        c: {
          d: 2
        }
      }
    }

    const result = getByPath<number>(target, 'a.b.c')

    expect(result).toBe(undefined)
  })

  it('should work with array as the path', () => {
    const target = {
      a: {
        c: {
          d: 2
        }
      }
    }

    const result = getByPath<number>(target, ['a', 'b', 'c'])
    const normalResult = getByPath<number>(target, ['a', 'c', 'd'])

    expect(result).toBe(undefined)
    expect(normalResult).toBe(2)
  })
})
