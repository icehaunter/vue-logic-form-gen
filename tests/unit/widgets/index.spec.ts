import { registry, prepareWidget } from '@/form-generator/widgets'

describe('widget registry', () => {
  it('should properly register an expose a widget', () => {
    registry.register('span', {})

    expect(registry.lookup('span')).toEqual({
      component: {},
      options: undefined,
      eventName: 'input',
      valueProp: 'value'
    })
    expect(registry.list()).toEqual(['span'])

    registry.unregister('span')
  })

  it('should properly register an expose a widget with options', () => {
    registry.register('span', {}, { type: 'a' })

    expect(registry.lookup('span')).toEqual({
      component: {},
      options: { type: 'a' },
      eventName: 'input',
      valueProp: 'value'
    })
    expect(registry.list()).toEqual(['span'])
    registry.unregister('span')
  })

  it('should fail to register a widget if registered previously', () => {
    registry.register('span', {})

    expect(() => registry.register('span', {})).toThrow(/^Widget with this name already registered/)
    registry.unregister('span')
  })

  it('should reregister a widget if forced', () => {
    registry.register('span', {})

    expect(() => registry.register('span', {}, undefined, { force: true })).not.toThrowError()
    registry.unregister('span')
  })

  it('should throw an error if looking up non-existant widget', () => {
    expect(() => registry.lookup('test')).toThrowError('Widget with name "test" is not available')
  })

  it('should throw an error if unregistering non-existant widget', () => {
    expect(() => registry.unregister('test')).toThrowError('Widget with name "test" is not available')
  })

  it('list all registered widget names', () => {
    registry.register('span', {})
    registry.register('heading', {})

    expect(registry.list()).toEqual(['span', 'heading'])
    registry.unregister('span')
    registry.unregister('heading')
  })
})

describe('widget preparation', () => {
  it('should just return the widget if no params are needed', () => {
    const prepared = prepareWidget({ type: 'test' }, {}, [])

    expect(prepared).toEqual({ type: 'test' })
  })

  it('should properly handle empty params', () => {
    const prepared = prepareWidget({ type: 'test', params: {} }, {}, [])

    expect(prepared).toEqual({ type: 'test', params: {} })
  })

  it('should properly treat actual params', () => {
    const prepared = prepareWidget({ type: 'test', params: { text: 'test' } }, {}, [])

    expect(prepared).toEqual({ type: 'test', params: { text: 'test' } })
  })

  it('should properly resolve actual params', () => {
    const prepared = prepareWidget({ type: 'test', params: { text: { _modelPath: 'paramText' } } }, { paramText: 'test' }, [])

    expect(prepared).toEqual({ type: 'test', params: { text: 'test' } })
  })
})
