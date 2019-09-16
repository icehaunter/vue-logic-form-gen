import '../types'
import { registry } from '..'
import Vue from 'vue'

declare module '../types' {
  interface WidgetParams {
    paragraph: {
      text: string
    }
  }
}

export const component = Vue.extend<{ text: string }>({
  functional: true,
  props: {
    text: {
      type: String,
      required: true
    }
  },
  render: (h, context) => h('p', [ context.props.text ])
})

registry.register('paragraph', component)
