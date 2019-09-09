import { resolveValue } from '@/components/form-generator/logic'
import { Value } from '@/components/form-generator/logic/value'

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

    it('Should properly unwrap an object', () => {
      const source: Value<{ _buildFrom: string, a: string }> = {
        _buildFrom: 'block',
        a: '1'
      }
      const result = resolveValue(source, {}, [])

      expect(result).toEqual({ _buildFrom: 'block', a: '1' })
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
      const result = resolveValue(source as Value<string[]>, { value: ['a'] }, [])

      expect(result).toEqual(['a'])
    })

    it('Should get an object from the model', () => {
      const source: Value<string[]> = {
        _modelPath: 'value'
      }
      const result = resolveValue(source as Value<string[]>, { value: { a: 1 } }, [])

      expect(result).toEqual({ a: 1 })
    })
  })
})
