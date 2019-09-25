import { req, len, regex } from '@/form-generator/validation/helpers'

describe('required helper', () => {
  it('should properly check if value is present for any type', () => {
    expect(req([1])).toBe(true)
    expect(req(true)).toBe(true)
    expect(req(false)).toBe(true)
    expect(req(new Date('2019-01-01'))).toBe(true)
    expect(req({ a: 1 })).toBe(true)
    expect(req('yay')).toBe(true)
  })

  it('should properly check if value is not present for any type', () => {
    expect(req([])).toBe(false)
    expect(req(new Date('oops'))).toBe(false)
    expect(req({})).toBe(false)
    expect(req('')).toBe(false)
  })
})

describe('len helper', () => {
  it('should properly get all the lengths', () => {
    expect(len([1])).toBe(1)
    expect(len('123')).toBe(3)
    expect(len({ a: 1, b: 2 })).toBe(2)
    expect(len(true)).toBe(4)
    expect(len(null)).toBe(4)
  })
})

describe('regex helper', () => {
  it('should apply a regex if string is not empty', () => {
    expect(regex(/^a$/)('')).toBe(true)
    expect(regex(/^a$/)('a')).toBe(true)
    expect(regex(/^a$/)('b')).toBe(false)
  })
})
