import { modifiers } from '@/form-generator/logic/modifiers/type/number'

describe('Modifier actions for number type', () => {
  it('should have a add-operator', () => {
    expect(modifiers.add(1, 1)).toBe(2)
    expect(modifiers.add(1, -1)).toBe(0)
  })

  it('should have a sub-operator', () => {
    expect(modifiers.sub(1, 1)).toBe(0)
    expect(modifiers.sub(1, -1)).toBe(2)
  })

  it('should have a mul-operator', () => {
    expect(modifiers.mul(1, 1)).toBe(1)
    expect(modifiers.mul(1, -1)).toBe(-1)
    expect(modifiers.mul(2, 2)).toBe(4)
  })

  it('should have a div-operator', () => {
    expect(modifiers.div(2, 1)).toBe(2)
    expect(modifiers.div(2, 2)).toBe(1)
    expect(modifiers.div(2, -2)).toBe(-1)
  })

  it('should have a double-operator', () => {
    expect(modifiers.double(1)).toBe(1)
    expect(modifiers.double(2)).toBe(4)
    expect(modifiers.double(-2)).toBe(4)
  })

  it('should have a toString-operator', () => {
    expect(modifiers.toString(1)).toBe('1')
    expect(modifiers.toString(2)).toBe('2')
    expect(modifiers.toString(-2)).toBe('-2')
  })
})
