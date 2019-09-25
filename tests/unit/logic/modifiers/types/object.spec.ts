import { modifiers } from '@/form-generator/logic/modifiers/type/object'

describe('Modifier actions for object type', () => {
  it('should have a get-operator', () => {
    expect(modifiers.get({ a: 1 }, 'a')).toBe(1)
    expect(modifiers.get({ a: { b: 1 } }, 'a')).toEqual({ b: 1 })
    expect(modifiers.get({ a: 1 }, 'b')).toBe(undefined)
  })

  it('should have a keys-operator', () => {
    expect(modifiers.keys({ a: 1 })).toEqual(['a'])
    expect(modifiers.keys({ a: { b: 1 } })).toEqual(['a'])
    expect(modifiers.keys({ a: 1, b: 1 })).toEqual(['a', 'b'])
  })

  it('should have a path-operator', () => {
    expect(modifiers.path({ a: 1 }, 'a')).toBe(1)
    expect(modifiers.path({ a: { b: 1 } }, 'a.b')).toBe(1)
    expect(modifiers.path({ a: 1 }, 'a.b')).toBe(undefined)
  })
})
