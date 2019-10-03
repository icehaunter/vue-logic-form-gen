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

  it('should have a comparison operator: eq', () => {
    expect(modifiers.eq(5, 5)).toBe(true)
    expect(modifiers.eq(5, 7)).toBe(false)
    expect(modifiers.eq(5, 3)).toBe(false)
  })

  it('should have a comparison operator: lt', () => {
    expect(modifiers.lt(5, 5)).toBe(false)
    expect(modifiers.lt(5, 7)).toBe(true)
    expect(modifiers.lt(5, 3)).toBe(false)
  })

  it('should have a comparison operator: lte', () => {
    expect(modifiers.lte(5, 5)).toBe(true)
    expect(modifiers.lte(5, 7)).toBe(true)
    expect(modifiers.lte(5, 3)).toBe(false)
  })

  it('should have a comparison operator: gt', () => {
    expect(modifiers.gt(5, 5)).toBe(false)
    expect(modifiers.gt(5, 7)).toBe(false)
    expect(modifiers.gt(5, 3)).toBe(true)
  })

  it('should have a comparison operator: gte', () => {
    expect(modifiers.gte(5, 5)).toBe(true)
    expect(modifiers.gte(5, 7)).toBe(false)
    expect(modifiers.gte(5, 3)).toBe(true)
  })

  it('should have a debug operator', () => {
    console.log = jest.fn()

    expect(modifiers.debug(1, 'log', 'Prefix')).toEqual(1)
    expect(console.log).toHaveBeenCalledWith('Prefix', ':', 1)
  })
})
