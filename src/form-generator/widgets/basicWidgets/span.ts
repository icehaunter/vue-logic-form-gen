import '../types'
import { registry } from '../../widgets'
import Vue from 'vue'

declare module '../types' {
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
