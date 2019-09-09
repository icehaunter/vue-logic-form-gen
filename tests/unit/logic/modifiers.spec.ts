import {
  ModifierChain,
  resolveModifierChain
} from '@/components/form-generator/logic/modifiers'
import { ModifierValueUndefinedError } from '@/components/form-generator/logic/errors'

describe('Modifier chain resolution', () => {
  it('should resolve a basic modifier chain from one link', () => {
    const chain: ModifierChain<'string'> = [
      ['string', 'join', [' appended'], 'string']
    ]

    const result = resolveModifierChain('initial', chain, {}, [])

    expect(result).toBe('initial appended')
  })

  it('should resolve a basic modifier chain from multiple links', () => {
    const chain: ModifierChain<'string'> = [
      ['string', 'join', ['10 symbols'], 'string'],
      ['string', 'length', [], 'number']
    ]

    const result = resolveModifierChain('10 symbols', chain, {}, []) as number

    expect(result).toBe(20)
  })

  it('should work with multiple type conversions along the line', () => {
    const chain: ModifierChain<'object'> = [
      ['object', 'get', ['key'], 'string'],
      ['string', 'length', [], 'number'],
      ['number', 'add', [5], 'number'],
      ['number', 'toString', [], 'string']
    ]

    const result = resolveModifierChain({ key: 'four' }, chain, {}, []) as string

    expect(result).toBe('9')
  })

  it('should resolve throw an error if modifier chain is invalid', () => {
    const chain: ModifierChain<'string'> = [
      ['string', 'join', ['10 symbols'], 'string'],
      ['number', 'double', [], 'number']
    ]
    expect(() => resolveModifierChain('10 symbols', chain, {}, [])).toThrowError(TypeError)
  })

  it('should end early with the undefined value if one of the steps is undefined', () => {
    const chain: ModifierChain<'object'> = [
      ['object', 'get', ['key'], 'number'],
      ['number', 'double', [], 'number']
    ]
    expect(() => resolveModifierChain({}, chain, {}, [])).toThrowError(ModifierValueUndefinedError)
  })
})
