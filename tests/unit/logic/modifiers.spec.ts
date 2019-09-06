import {
  ModifierChain,
  resolveModifierChain
} from '@/components/form-generator/logic/modifiers'

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

  it('should resolve throw an error if modifier chain is invalid', () => {
    const chain: ModifierChain<'string'> = [
      ['string', 'join', ['10 symbols'], 'string'],
      ['number', 'double', [], 'number']
    ]
    expect(() => resolveModifierChain('10 symbols', chain, {}, [])).toThrowError(TypeError)
  })
})
