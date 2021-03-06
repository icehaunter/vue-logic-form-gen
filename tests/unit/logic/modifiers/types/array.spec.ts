import { modifiers } from '@/form-generator/logic/modifiers/type/array'

describe('Modifier actions for array type', () => {
  it('should have a join-operator', () => {
    expect(modifiers.length(['a', 'b'])).toBe(2)
    expect(modifiers.length([])).toBe(0)
  })

  it('should have an at-operator', () => {
    expect(modifiers.at([1, 2, 3], 0)).toBe(1)
    expect(modifiers.at([1, 2, 3], 2)).toBe(3)
  })

  it('should have a debug operator', () => {
    console.log = jest.fn()

    expect(modifiers.debug([1, 2, 3], 'log', 'Prefix')).toEqual([1, 2, 3])
    expect(console.log).toHaveBeenCalledWith('Prefix', ':', [1, 2, 3])
  })
})
