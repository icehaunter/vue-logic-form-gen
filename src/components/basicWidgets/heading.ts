import '../../form-generator/widgets/types'
import { registry } from '../../form-generator/widgets'
import Vue from 'vue'

interface HeadingParams {
  level: 1 | 2 | 3 | 4 | 5 | 6
  text: string
}

declare module '../../form-generator/widgets/types' {
  interface WidgetParams {
    heading: HeadingParams
  }
}

export const component = Vue.extend<HeadingParams>({
  functional: true,
  render: (h, context) => h('h' + context.props.level, [ context.props.text ])
})

registry.register('heading', component)
