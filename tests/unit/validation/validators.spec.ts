import { validators } from '@/components/form-generator/validation/validators'

describe('all possible validators', () => {
  describe('validator: always', () => {
    it('should always be false', () => {
      expect(validators.always()(true)).toBe(false)
      expect(validators.always()(false)).toBe(false)
      expect(validators.always()(undefined)).toBe(false)
    })
  })
  describe('validator: required', () => {
    it('should properly check if value is present for any type', () => {
      expect(validators.required()([1])).toBe(true)
      expect(validators.required()(true)).toBe(true)
      expect(validators.required()(false)).toBe(true)
      expect(validators.required()(new Date('2019-01-01'))).toBe(true)
      expect(validators.required()({ a: 1 })).toBe(true)
      expect(validators.required()('yay')).toBe(true)
    })

    it('should properly check if value is not present for any type', () => {
      expect(validators.required()([])).toBe(false)
      expect(validators.required()(new Date('oops'))).toBe(false)
      expect(validators.required()({})).toBe(false)
      expect(validators.required()('')).toBe(false)
    })
  })
  describe('validator: isTrue', () => {
    it('should recognise only `true` as a valid value', () => {
      expect(validators.isTrue()(true)).toBe(true)
      expect(validators.isTrue()('true')).toBe(false)
    })
  })
  describe('validator: isTruthy', () => {
    it('should recognise anything truthy as a valid value', () => {
      expect(validators.isTruthy()(true)).toBe(true)
      expect(validators.isTruthy()('true')).toBe(true)
      expect(validators.isTruthy()('')).toBe(false)
      expect(validators.isTruthy()({})).toBe(true)
    })
  })
  describe('validator: isFalse', () => {
    it('should recognise only `false` as a valid value', () => {
      expect(validators.isFalse()(false)).toBe(true)
      expect(validators.isFalse()('true')).toBe(false)
    })
  })
  describe('validator: isFalsy', () => {
    it('should recognise anything truthy as a valid value', () => {
      expect(validators.isFalsy()(false)).toBe(true)
      expect(validators.isFalsy()('')).toBe(true)
      expect(validators.isFalsy()('true')).toBe(false)
      expect(validators.isFalsy()({})).toBe(false)
    })
  })
  describe('validator: maxLength', () => {
    it('should ignore empty value', () => {
      expect(validators.maxLength({ max: 2 })('')).toBe(true)
      expect(validators.maxLength({ max: 2 })(null)).toBe(true)
      expect(validators.maxLength({ max: 2 })(undefined)).toBe(true)
    })

    it('should properly check string length', () => {
      expect(validators.maxLength({ max: 2 })('1')).toBe(true)
      expect(validators.maxLength({ max: 2 })('12')).toBe(true)
      expect(validators.maxLength({ max: 2 })('123')).toBe(false)
    })

    it('should properly check array length', () => {
      expect(validators.maxLength({ max: 2 })([1])).toBe(true)
      expect(validators.maxLength({ max: 2 })([1, 2])).toBe(true)
      expect(validators.maxLength({ max: 2 })([1, 2, 3])).toBe(false)
    })

    it('should properly check object key size length', () => {
      expect(validators.maxLength({ max: 2 })({ a: 1 })).toBe(true)
      expect(validators.maxLength({ max: 2 })({ a: 1, b: 2 })).toBe(true)
      expect(validators.maxLength({ max: 2 })({ a: 1, b: 2, c: 3 })).toBe(false)
    })
  })
  describe('validator: minLength', () => {
    it('should ignore empty value', () => {
      expect(validators.minLength({ min: 2 })('')).toBe(true)
      expect(validators.minLength({ min: 2 })(null)).toBe(true)
      expect(validators.minLength({ min: 2 })(undefined)).toBe(true)
    })

    it('should properly check string length', () => {
      expect(validators.minLength({ min: 2 })('1')).toBe(false)
      expect(validators.minLength({ min: 2 })('12')).toBe(true)
      expect(validators.minLength({ min: 2 })('123')).toBe(true)
    })

    it('should properly check array length', () => {
      expect(validators.minLength({ min: 2 })([1])).toBe(false)
      expect(validators.minLength({ min: 2 })([1, 2])).toBe(true)
      expect(validators.minLength({ min: 2 })([1, 2, 3])).toBe(true)
    })

    it('should properly check object key size length', () => {
      expect(validators.minLength({ min: 2 })({ a: 1 })).toBe(false)
      expect(validators.minLength({ min: 2 })({ a: 1, b: 2 })).toBe(true)
      expect(validators.minLength({ min: 2 })({ a: 1, b: 2, c: 3 })).toBe(true)
    })
  })
  describe('validator: lengthBetween', () => {
    it('should ignore empty value', () => {
      expect(validators.lengthBetween({ min: 2, max: 3 })('')).toBe(true)
      expect(validators.lengthBetween({ min: 2, max: 3 })(null)).toBe(true)
      expect(validators.lengthBetween({ min: 2, max: 3 })(undefined)).toBe(true)
    })

    it('should properly check string length', () => {
      expect(validators.lengthBetween({ min: 2, max: 3 })('1')).toBe(false)
      expect(validators.lengthBetween({ min: 2, max: 3 })('12')).toBe(true)
      expect(validators.lengthBetween({ min: 2, max: 3 })('123')).toBe(true)
      expect(validators.lengthBetween({ min: 2, max: 3 })('1234')).toBe(false)
    })

    it('should properly check array length', () => {
      expect(validators.lengthBetween({ min: 2, max: 3 })([1])).toBe(false)
      expect(validators.lengthBetween({ min: 2, max: 3 })([1, 2])).toBe(true)
      expect(validators.lengthBetween({ min: 2, max: 3 })([1, 2, 3])).toBe(true)
      expect(validators.lengthBetween({ min: 2, max: 3 })([1, 2, 3, 4])).toBe(
        false
      )
    })

    it('should properly check object key size length', () => {
      expect(validators.lengthBetween({ min: 2, max: 3 })({ a: 1 })).toBe(false)
      expect(validators.lengthBetween({ min: 2, max: 3 })({ a: 1, b: 2 })).toBe(
        true
      )
      expect(
        validators.lengthBetween({ min: 2, max: 3 })({ a: 1, b: 2, c: 3 })
      ).toBe(true)
      expect(
        validators.lengthBetween({ min: 2, max: 3 })({ a: 1, b: 2, c: 3, g: 4 })
      ).toBe(false)
    })
  })
  describe('validator: minValue', () => {
    it('should ignore empty value', () => {
      expect(validators.minValue({ min: 2 })(null)).toBe(true)
      expect(validators.minValue({ min: 2 })(undefined)).toBe(true)
    })

    it('should properly check number value', () => {
      expect(validators.minValue({ min: 2 })(1)).toBe(false)
      expect(validators.minValue({ min: 2 })(2)).toBe(true)
      expect(validators.minValue({ min: 2 })(3)).toBe(true)
    })
  })
  describe('validator: maxValue', () => {
    it('should ignore empty value', () => {
      expect(validators.maxValue({ max: 2 })(null)).toBe(true)
      expect(validators.maxValue({ max: 2 })(undefined)).toBe(true)
    })

    it('should properly check number value', () => {
      expect(validators.maxValue({ max: 2 })(1)).toBe(true)
      expect(validators.maxValue({ max: 2 })(2)).toBe(true)
      expect(validators.maxValue({ max: 2 })(3)).toBe(false)
    })
  })
  describe('validator: between', () => {
    it('should ignore empty value', () => {
      expect(validators.between({ min: 2, max: 3 })(null)).toBe(true)
      expect(validators.between({ min: 2, max: 3 })(undefined)).toBe(true)
    })

    it('should properly check number value', () => {
      expect(validators.between({ min: 2, max: 3 })(1)).toBe(false)
      expect(validators.between({ min: 2, max: 3 })(2)).toBe(true)
      expect(validators.between({ min: 2, max: 3 })(2.5)).toBe(true)
      expect(validators.between({ min: 2, max: 3 })(3)).toBe(true)
      expect(validators.between({ min: 2, max: 3 })(4)).toBe(false)
    })
  })
  describe('validator: alpha', () => {
    it('should ignore empty value', () => {
      expect(validators.alpha()('')).toBe(true)
      expect(validators.alpha()(null)).toBe(true)
      expect(validators.alpha()(undefined)).toBe(true)
    })

    it('should validate only latin letters', () => {
      expect(validators.alpha()('test')).toBe(true)
      expect(validators.alpha()('tEst')).toBe(true)
      expect(validators.alpha()('нет')).toBe(false)
      expect(validators.alpha()('яz')).toBe(false)
    })
  })
  describe('validator: alphaNum', () => {
    it('should ignore empty value', () => {
      expect(validators.alphaNum()('')).toBe(true)
      expect(validators.alphaNum()(null)).toBe(true)
      expect(validators.alphaNum()(undefined)).toBe(true)
    })

    it('should validate only latin letters and numbers', () => {
      expect(validators.alphaNum()('test123')).toBe(true)
      expect(validators.alphaNum()('tEst')).toBe(true)
      expect(validators.alphaNum()('нет123')).toBe(false)
      expect(validators.alphaNum()('яz12')).toBe(false)
    })
  })
  describe('validator: numeric', () => {
    it('should ignore empty value', () => {
      expect(validators.numeric()('')).toBe(true)
      expect(validators.numeric()(null)).toBe(true)
      expect(validators.numeric()(undefined)).toBe(true)
    })

    it('should validate only numbers', () => {
      expect(validators.numeric()('123')).toBe(true)
      expect(validators.numeric()('tEst')).toBe(false)
      expect(validators.numeric()('нет123')).toBe(false)
    })
  })
  describe('validator: integer', () => {
    it('should ignore empty value', () => {
      expect(validators.integer()('')).toBe(true)
      expect(validators.integer()(null)).toBe(true)
      expect(validators.integer()(undefined)).toBe(true)
    })

    it('should validate only proper integers', () => {
      expect(validators.integer()('123')).toBe(true)
      expect(validators.integer()('-1')).toBe(true)
      expect(validators.integer()('нет123')).toBe(false)
      expect(validators.integer()('яz12')).toBe(false)
    })
  })
  describe('validator: decimal', () => {
    it('should ignore empty value', () => {
      expect(validators.decimal()('')).toBe(true)
      expect(validators.decimal()(null)).toBe(true)
      expect(validators.decimal()(undefined)).toBe(true)
    })

    it('should validate only decimals', () => {
      expect(validators.decimal()('-1')).toBe(true)
      expect(validators.decimal()('1.2')).toBe(true)
      expect(validators.decimal()('-.2')).toBe(true)
      expect(validators.decimal()('нет123')).toBe(false)
      expect(validators.decimal()('яz12')).toBe(false)
    })
  })
  describe('validator: email', () => {
    it('should ignore empty value', () => {
      expect(validators.email()('')).toBe(true)
      expect(validators.email()(null)).toBe(true)
      expect(validators.email()(undefined)).toBe(true)
    })

    it('should validate correct emails', () => {
      expect(validators.email()('test@me.com')).toBe(true)
      expect(validators.email()('probably not')).toBe(false)
    })
  })
  describe('validator: regex', () => {
    it('should ignore empty value', () => {
      expect(validators.regex({ pattern: /^1$/ })('')).toBe(true)
      expect(validators.regex({ pattern: /^1$/ })(null)).toBe(true)
      expect(validators.regex({ pattern: /^1$/ })(undefined)).toBe(true)
    })

    it('should test a given regex', () => {
      expect(validators.regex({ pattern: /^1$/ })('1')).toBe(true)
      expect(validators.regex({ pattern: /^1$/ })('12')).toBe(false)
      expect(validators.regex({ pattern: '^1$' })('1')).toBe(true)
      expect(validators.regex({ pattern: '^1$' })('12')).toBe(false)
    })
  })
  describe('validator: minDate', () => {
    it('should ignore empty value', () => {
      expect(
        validators.minDate({ min: new Date('2019-01-01') })(new Date('what'))
      ).toBe(true)
      expect(validators.minDate({ min: new Date('2019-01-01') })(null)).toBe(
        true
      )
      expect(
        validators.minDate({ min: new Date('2019-01-01') })(undefined)
      ).toBe(true)
    })

    it('should properly check date value', () => {
      expect(
        validators.minDate({ min: new Date('2019-01-01') })(
          new Date('2019-01-10')
        )
      ).toBe(true)
      expect(
        validators.minDate({ min: '2019-01-01' })(new Date('2019-01-10'))
      ).toBe(true)
      expect(
        validators.minDate({ min: new Date('2019-01-15') })(
          new Date('2019-01-10')
        )
      ).toBe(false)
      expect(validators.minDate({ min: 'now' })(new Date('2019-01-10'))).toBe(
        false
      )
    })

    it('should fail for invalid values', () => {
      expect(
        validators.minDate({ min: new Date('what') })(new Date('2019-01-10'))
      ).toBe(false)
    })
  })
  describe('validator: maxDate', () => {
    it('should ignore empty value', () => {
      expect(
        validators.maxDate({ max: new Date('2019-01-01') })(new Date('what'))
      ).toBe(true)
      expect(validators.maxDate({ max: new Date('2019-01-01') })(null)).toBe(
        true
      )
      expect(
        validators.maxDate({ max: new Date('2019-01-01') })(undefined)
      ).toBe(true)
    })

    it('should properly check date value', () => {
      expect(
        validators.maxDate({ max: new Date('2019-01-01') })(
          new Date('2019-01-10')
        )
      ).toBe(false)
      expect(
        validators.maxDate({ max: '2019-01-01' })(new Date('2019-01-10'))
      ).toBe(false)
      expect(
        validators.maxDate({ max: new Date('2019-01-15') })(
          new Date('2019-01-10')
        )
      ).toBe(true)
      expect(validators.maxDate({ max: 'now' })(new Date('2019-01-10'))).toBe(
        true
      )
    })

    it('should fail for invalid values', () => {
      expect(
        validators.maxDate({ max: new Date('what') })(new Date('2019-01-10'))
      ).toBe(false)
    })
  })
  describe('validator: pathIsNotNull', () => {
    it('should ignore empty value', () => {
      expect(validators.pathIsNotNull({ path: '' })({})).toBe(true)
      expect(validators.pathIsNotNull({ path: '' })(null)).toBe(true)
      expect(validators.pathIsNotNull({ path: '' })(undefined)).toBe(true)
    })

    it('should properly validate a value under the path', () => {
      expect(validators.pathIsNotNull({ path: 'value' })({ value: '' })).toBe(
        true
      )
      expect(validators.pathIsNotNull({ path: 'value' })({})).toBe(true)
      expect(validators.pathIsNotNull({ path: 'value' })({ value: null })).toBe(
        false
      )
      expect(
        validators.pathIsNotNull({ path: 'value' })({ value: undefined })
      ).toBe(false)
    })

    it('should return false if value is not an object', () => {
      expect(validators.pathIsNotNull({ path: '' })('what')).toBe(false)
    })
  })
  describe('validator: predicate', () => {
    it('should just depend on the test value', () => {
      expect(validators.predicate({ test: true })('whatever')).toBe(true)
      expect(validators.predicate({ test: true })('')).toBe(true)
      expect(validators.predicate({ test: true })(false)).toBe(true)

      expect(validators.predicate({ test: false })('whatever')).toBe(false)
      expect(validators.predicate({ test: false })('')).toBe(false)
      expect(validators.predicate({ test: false })(false)).toBe(false)
    })
  })
})
