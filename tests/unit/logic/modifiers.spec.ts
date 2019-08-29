import { ModifierChain } from '@/components/form-generator/logic/modifiers'

describe('Value modification', () => {
  it('Should modify a specified value', () => {
    const chain: ModifierChain = [
      ['add', 5],
      ['sub', 2],
      ['double'],
      [
        ['div', { modelPath: 'otherValue' }],
        ['sub', 4]
      ]
    ]

    const level = {
      type: 'if',
      level: 'test',
      modelPath: 'value',
      predicate: {
        type: 'number',
        lhsMod: chain
      }
    }
  })
})
