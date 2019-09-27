import {
  resolveValue
} from '@/form-generator/logic'
import { Value } from '@/form-generator/logic/value'
import { ModifierValueUndefinedError, ModelValueUndefinedError } from '@/form-generator/logic/errors'
import { isBefore } from 'date-fns'

describe('Value unwrapping', () => {
  describe('Basic types', () => {
    it('Should properly unwrap a plain number', () => {
      const source: Value<number> = 1
      const result = resolveValue(source, {}, [])

      expect(result).toBe(1)
    })

    it('Should properly unwrap a plain boolean', () => {
      const source: Value<boolean> = true
      const result = resolveValue(source, {}, [])

      expect(result).toBe(true)
    })

    it('Should properly unwrap a plain string', () => {
      const source: Value<string> = 'true'
      const result = resolveValue(source, {}, [])

      expect(result).toBe('true')
    })

    it('Should properly unwrap a plain date', () => {
      const source: Value<Date> = new Date('2019-01-01')
      const result = resolveValue(source, {}, [])

      expect(result).toEqual(new Date('2019-01-01'))
    })

    it('Should properly unwrap an array', () => {
      const source: Value<string[]> = ['a', 'b']
      const result = resolveValue(source, {}, [])

      expect(result).toEqual(['a', 'b'])
    })

    it('Should properly unwrap an object', () => {
      const source: Value<{ a: string }> = {
        a: '1'
      }
      const result = resolveValue(source, {}, [])

      expect(result).toEqual({ a: '1' })
    })

    it('Should properly unwrap an object with some predefined props', () => {
      const source: Value<{ _buildFrom: string; a: string }> = {
        _buildFrom: 'block',
        a: '1'
      }
      const result = resolveValue(source, {}, [])

      expect(result).toEqual({ _buildFrom: 'block', a: '1' })
    })

    it('Should properly unwrap a `null`', () => {
      const source: Value<null> = null
      const result = resolveValue(source, {}, [])

      expect(result).toBeNull()
    })

    it('Should properly unwrap an `undefined`', () => {
      const source: Value<undefined> = undefined
      const result = resolveValue(source, {}, [])

      expect(result).toBeUndefined()
    })
  })

  describe('Model path usage', () => {
    it('Should get a number from the model', () => {
      const source: Value<number> = {
        _modelPath: 'value'
      }
      const result = resolveValue(source as Value<number>, { value: 1 }, [])

      expect(result).toBe(1)
    })

    it('Should get an array from the model', () => {
      const source: Value<string[]> = {
        _modelPath: 'value'
      }
      const result = resolveValue(
        source as Value<string[]>,
        { value: ['a'] },
        []
      )

      expect(result).toEqual(['a'])
    })

    it('Should get an object from the model', () => {
      const source: Value<string[]> = {
        _modelPath: 'value'
      }
      const result = resolveValue(
        source as Value<string[]>,
        { value: { a: 1 } },
        []
      )

      expect(result).toEqual({ a: 1 })
    })

    it('Should throw an error if resolved value is undefined', () => {
      expect(() =>
        resolveValue({ _modelPath: 'value' } as Value<string[]>, {}, [])
      ).toThrowError(ModelValueUndefinedError)
    })
  })

  describe('Value building', () => {
    it('Should build from a basic value, applying the modifiers', () => {
      const source: Value<number> = {
        _buildFrom: 'test',
        _actions: [['string', 'length', [], 'number']]
      }

      const result = resolveValue(source, {}, [])

      expect(result).toBe(4)
    })

    it('Should build a date from string, applying the modifiers', () => {
      const source: Value<Date> = {
        _buildFrom: 'now',
        _actions: [
          ['string', 'toDate', [], 'date'],
          ['date', 'subtract', [4, 'day'], 'date']
        ]
      }

      const result = resolveValue(source, {}, [])

      expect(isBefore(result, new Date())).toBe(true)
    })

    it('Should build from a model-sourced value, applying the modifiers', () => {
      const source: Value<number> = {
        _buildFrom: {
          _modelPath: 'value'
        },
        _actions: [['string', 'length', [], 'number']]
      }

      const result = resolveValue(source, { value: 'test' }, [])

      expect(result).toBe(4)
    })

    it('Should fail if modifiers return null or undefined at any point', () => {
      const source: Value<number> = {
        _buildFrom: {
          _modelPath: 'value'
        },
        _actions: [['object', 'get', ['any'], 'number']]
      }

      expect(() => resolveValue(source, { value: { from: 'to' } }, [])).toThrowError(ModifierValueUndefinedError)
      expect(() => resolveValue(source, { value: { any: null } }, [])).toThrowError(ModifierValueUndefinedError)
    })

    it('Should fail if starting from null or undefined', () => {
      const source: Value<number> = {
        _buildFrom: {
          _modelPath: 'value'
        },
        _actions: [['string', 'uppercase', [], 'string']]
      }

      expect(() => resolveValue(source, { value: null }, [])).toThrowError(ModelValueUndefinedError)
      expect(() => resolveValue(source, { value: undefined }, [])).toThrowError(ModelValueUndefinedError)
      expect(resolveValue(source, { value: null }, [], { returnUndefined: true })).toBeNull()
      expect(resolveValue(source, { value: undefined }, [], { returnUndefined: true })).toBeUndefined()
    })
  })
})
