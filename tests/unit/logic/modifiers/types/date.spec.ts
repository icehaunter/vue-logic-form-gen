import { modifiers } from '@/components/form-generator/logic/modifiers/type/date'

describe('Modifier actions for date type', () => {
  it('should have an isAfter-operator', () => {
    expect(modifiers.isAfter(new Date('2019-02-02'), new Date('2019-02-03'))).toBe(false)
    expect(modifiers.isAfter(new Date('2019-02-02'), new Date('2019-02-01'))).toBe(true)
  })

  it('should have an isBefore-operator', () => {
    expect(modifiers.isBefore(new Date('2019-02-02'), new Date('2019-02-03'))).toBe(true)
    expect(modifiers.isBefore(new Date('2019-02-02'), new Date('2019-02-01'))).toBe(false)
  })

  it('should have a difference-operator', () => {
    expect(modifiers.difference(new Date('2019-02-02'), new Date('2019-02-03'), 'day')).toBe(-1)
    expect(modifiers.difference(new Date('2019-02-02'), new Date('2019-02-01'), 'day')).toBe(1)

    expect(modifiers.difference(new Date('2019-02-01'), new Date('2019-02-08'), 'week')).toBe(-1)
    expect(modifiers.difference(new Date('2019-02-08'), new Date('2019-02-01'), 'week')).toBe(1)

    expect(modifiers.difference(new Date('2019-02-01'), new Date('2019-03-01'), 'month')).toBe(-1)
    expect(modifiers.difference(new Date('2019-03-01'), new Date('2019-02-01'), 'month')).toBe(1)

    expect(modifiers.difference(new Date('2019-02-02'), new Date('2020-02-02'), 'year')).toBe(-1)
    expect(modifiers.difference(new Date('2020-02-02'), new Date('2019-02-02'), 'year')).toBe(1)
  })

  it('should have an add-operator', () => {
    expect(modifiers.add(new Date('2019-02-02'), 1, 'day')).toEqual(new Date('2019-02-03'))
    expect(modifiers.add(new Date('2019-02-02'), 1, 'week')).toEqual(new Date('2019-02-09'))
    expect(modifiers.add(new Date('2019-02-02'), 1, 'month')).toEqual(new Date('2019-03-02'))
    expect(modifiers.add(new Date('2019-02-02'), 1, 'year')).toEqual(new Date('2020-02-02'))
  })

  it('should have an sub-operator', () => {
    expect(modifiers.subtract(new Date('2019-02-03'), 1, 'day')).toEqual(new Date('2019-02-02'))
    expect(modifiers.subtract(new Date('2019-02-09'), 1, 'week')).toEqual(new Date('2019-02-02'))
    expect(modifiers.subtract(new Date('2019-03-02'), 1, 'month')).toEqual(new Date('2019-02-02'))
    expect(modifiers.subtract(new Date('2020-02-02'), 1, 'year')).toEqual(new Date('2019-02-02'))
  })

  it('should properly handle the string date representation', () => {
    expect(modifiers.difference(new Date('2019-01-01'), '2019-01-01', 'day')).toBe(0)
  })

  it('should properly handle the "now" date tag', () => {
    expect(modifiers.isBefore(new Date('1996-01-01'), 'now')).toBe(true)
  })
})
