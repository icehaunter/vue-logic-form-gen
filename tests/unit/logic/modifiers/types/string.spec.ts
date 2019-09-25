import { modifiers } from '@/form-generator/logic/modifiers/type/string'

describe('Modifier actions for string type', () => {
  it('should have a join-operator', () => {
    expect(modifiers.join('a', 'b')).toBe('ab')
    expect(modifiers.join('a', '')).toBe('a')
  })

  it('should have a length-operator', () => {
    expect(modifiers.length('')).toBe(0)
    expect(modifiers.length('10 symbols')).toBe(10)
  })

  it('should have a lowercase-operator', () => {
    expect(modifiers.lowercase('')).toBe('')
    expect(modifiers.lowercase('проверка')).toBe('проверка')
    expect(modifiers.lowercase('ПроверкА')).toBe('проверка')
    expect(modifiers.lowercase('ПРОВЕРКА')).toBe('проверка')
    expect(modifiers.lowercase('ПРОВЕРКА?!')).toBe('проверка?!')
  })

  it('should have an uppercase-operator', () => {
    expect(modifiers.uppercase('')).toBe('')
    expect(modifiers.uppercase('проверка')).toBe('ПРОВЕРКА')
    expect(modifiers.uppercase('ПроверкА')).toBe('ПРОВЕРКА')
    expect(modifiers.uppercase('ПРОВЕРКА')).toBe('ПРОВЕРКА')
    expect(modifiers.uppercase('ПРОВЕРКА?!')).toBe('ПРОВЕРКА?!')
  })

  it('should have a titlecase-operator', () => {
    expect(modifiers.titlecase('')).toBe('')
    expect(modifiers.titlecase('проверка')).toBe('Проверка')
    expect(modifiers.titlecase('ПроверкА')).toBe('Проверка')
    expect(modifiers.titlecase('ПРОВЕРКА проверка')).toBe('Проверка Проверка')
    expect(modifiers.titlecase('ПРОВЕРКА?!ПРОВЕРКА!')).toBe('Проверка?!Проверка!')
  })

  it('should have a slice-operator', () => {
    expect(modifiers.slice('', 0, 10)).toBe('')
    expect(modifiers.slice('проверка', 0, 1)).toBe('п')
    expect(modifiers.slice('проверка', 0, 1)).toBe('п')
    expect(modifiers.slice('проверка', 1, 3)).toBe('ро')
    expect(modifiers.slice('проверка', 0, 100)).toBe('проверка')
  })

  it('should have a split-operator', () => {
    expect(modifiers.split('', '')).toEqual([])
    expect(modifiers.split('проверка', 'е')).toEqual(['пров', 'рка'])
  })

  it('should have an isEqual-operator', () => {
    expect(modifiers.isEqual('', '')).toBe(true)
    expect(modifiers.isEqual('проверка', 'е')).toBe(false)
  })

  it('should have an isSubstring-operator', () => {
    expect(modifiers.isSubstring('', '')).toBe(true)
    expect(modifiers.isSubstring('проверка', 'е')).toBe(false)
    expect(modifiers.isSubstring('е', 'проверка')).toBe(true)
  })

  it('should have a containsSubstring-operator', () => {
    expect(modifiers.containsSubstring('', '')).toBe(true)
    expect(modifiers.containsSubstring('проверка', 'е')).toBe(true)
    expect(modifiers.containsSubstring('е', 'проверка')).toBe(false)
  })

  it('should have a testRegex-operator', () => {
    expect(modifiers.testRegex('abc', /^abc$/)).toBe(true)
    expect(modifiers.testRegex('abc', '^abc$')).toBe(true)
    expect(modifiers.testRegex('abc', 'bbb')).toBe(false)
  })
})
