import '../../form-generator/widgets/types'
import { registry } from '../../form-generator/widgets'
import Vue from 'vue'

declare module '../../form-generator/widgets/types' {
  interface WidgetParams {
    span: {}
  }
}

export const component = Vue.extend<{}>({
  functional: true,
  props: {},
  render: (h, context) => h('span', [])
})

registry.register('span', component)
