import { prepareBranch } from '@/components/form-generator/resolution'

describe('prepareBranch', () => {
  it('should prepare a simple branch', () => {
    const prepared = prepareBranch({
      type: 'level',
      children: [],
      level: 'test'
    })

    expect(prepared._tag).toBe('level')

    const resolved = prepared.resolver({}, [])

    expect(resolved).toEqual({
      type: 'level',
      children: [],
      level: 'test'
    })
  })

  it('should prepare a field', () => {
    const prepared = prepareBranch({
      type: 'field',
      modelPath: ''
    })

    expect(prepared._tag).toBe('field')

    const resolved = prepared.resolver({}, [])

    expect(resolved).toEqual({
      type: 'field',
      modelPath: ''
    })
  })

  it('should prepare a branch with children', () => {
    const prepared = prepareBranch({
      type: 'level',
      children: [
        {
          type: 'level',
          children: [],
          level: 'child'
        }
      ],
      level: 'test'
    })

    expect(prepared._tag).toBe('level')
  })
})
