import { modifiers } from '@/components/form-generator/logic/modifiers/type/string'

describe('Modifier actions for string type', () => {
  it('should have a join-operator', () => {
    expect(modifiers.join('a', 'b')).toBe('ab')
    expect(modifiers.join('a', '')).toBe('a')
  })

  it('should have a length-operator', () => {
    expect(modifiers.length('')).toBe(0)
    expect(modifiers.length('10 symbols')).toBe(10)
  })

  it('should have a mul-operator', () => {
    expect(modifiers.testRegex('abc', /^abc$/)).toBe(true)
    expect(modifiers.testRegex('abc', '^abc$')).toBe(true)
    expect(modifiers.testRegex('abc', 'bbb')).toBe(false)
  })
})
