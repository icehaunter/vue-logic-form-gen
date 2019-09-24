import Vue, { VueConstructor, FunctionalComponentOptions } from 'vue'
import { WidgetParams, PrepareParams } from './types'
import { PropsDefinition, ComponentOptions } from 'vue/types/options'
import { Value } from '../logic/value'
import { resolveValue } from '../logic'
import { Context } from '../resolution'

interface WidgetBinding {
  component:
    | VueConstructor<Vue>
    | FunctionalComponentOptions<any, PropsDefinition<any>>
    | ComponentOptions<never, any, any, any, any, Record<string, any>>
  options?: Record<string, any>
  valueProp: string
  eventName: string
}

interface RegisterOptions {
  valueProp?: string
  eventName?: string
  force?: boolean
}

class WidgetRegistry {
  private bindings: Partial<{ [k in keyof WidgetParams]: WidgetBinding }>

  constructor () {
    this.bindings = {}
  }

  register (
    name: keyof WidgetParams,
    component: WidgetBinding['component'],
    componentOptions?: WidgetBinding['options'],
    {
      valueProp = 'value',
      eventName = 'input',
      force = false
    }: RegisterOptions = {}
  ) {
    if (force || !(name in this.bindings)) {
      this.bindings[name] = {
        component,
        options: componentOptions,
        eventName: eventName,
        valueProp: valueProp
      }
    } else {
      throw new Error(
        'Widget with this name already registered. Use "force" if you want to overwrite the provided widget.'
      )
    }
  }

  lookup (name: string) {
    const result: WidgetBinding | undefined = this.bindings[name as keyof WidgetParams]
    if (result !== undefined) {
      return result
    } else {
      throw new Error(`Widget with name "${name}" is not available`)
    }
  }

  list () {
    return Object.keys(this.bindings)
  }

  unregister (name: string) {
    if (this.bindings[name as keyof WidgetParams] !== undefined) {
      delete this.bindings[name as keyof WidgetParams]
    } else {
      throw new Error(`Widget with name "${name}" is not available`)
    }
  }
}

// type ResolvedParams<K, T> = T extends object ? ({} extends T ? { type: K } : { type: K, params: T }): { type: K }

export type PreparedWidget = { type: string; params?: { [k: string]: any } }

export function prepareWidget (
  widget: { type: string; params?: { [k: string]: Value<any> } },
  model: any,
  context: Context
): PreparedWidget {
  if (widget.params !== undefined) {
    let preparedParams: any = {}
    for (const [key, value] of Object.entries(widget.params)) {
      preparedParams[key] = resolveValue(value, model, context)
    }
    return {
      type: widget.type,
      params: preparedParams
    }
  } else {
    return widget
  }
}

const registry = new WidgetRegistry()

export { registry }
