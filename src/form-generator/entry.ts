import Generator from '../form-generator/Generator.vue'
import { registry as WidgetRegistry } from './widgets'
import { BaseProps } from './widgets/types'
import { LogicalBranch as SchemaBranch } from './schema/types'

declare module './widgets' {
  interface WidgetBinding {
    noop: undefined
  }
}

export {
  Generator,
  WidgetRegistry,
  BaseProps,
  SchemaBranch
}
