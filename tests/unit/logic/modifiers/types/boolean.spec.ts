import { modifiers } from '@/form-generator/logic/modifiers/type/boolean'

describe('Modifier actions for boolean type', () => {
  it('should have a not-operator', () => {
    expect(modifiers.not(true)).toBe(false)
    expect(modifiers.not(false)).toBe(true)
  })

  it('should have an or-operator', () => {
    expect(modifiers.or(true, true)).toBe(true)
    expect(modifiers.or(false, false)).toBe(false)
    expect(modifiers.or(false, true)).toBe(true)
    expect(modifiers.or(true, false)).toBe(true)
  })

  it('should have an and-operator', () => {
    expect(modifiers.and(true, true)).toBe(true)
    expect(modifiers.and(false, false)).toBe(false)
    expect(modifiers.and(false, true)).toBe(false)
    expect(modifiers.and(true, false)).toBe(false)
  })

  it('should have a xor-operator', () => {
    expect(modifiers.xor(true, true)).toBe(false)
    expect(modifiers.xor(false, false)).toBe(false)
    expect(modifiers.xor(false, true)).toBe(true)
    expect(modifiers.xor(true, false)).toBe(true)
  })

  it('should have a debug operator', () => {
    console.log = jest.fn()

    expect(modifiers.debug(true, 'log', 'Prefix')).toEqual(true)
    expect(console.log).toHaveBeenCalledWith('Prefix', ':', true)
  })
})
