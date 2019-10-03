import { registry } from '../../form-generator/widgets'
import Vue from 'vue'
import { BaseProps } from '../../form-generator/widgets/types'
import { ValidatorLevel } from '../../form-generator/validation/types'

interface InputParams {
  required?: true
  type: 'text' | 'email' | 'number' | 'tel'
}

declare module '../../form-generator/widgets/types' {
  interface WidgetParams {
    basicInput: InputParams
  }
}

export const component = Vue.extend<InputParams & BaseProps & { value: string }>({
  functional: true,
  render: (h, context) => [
    h('input', { attrs: { type: context.props.type, value: context.props.value }, on: context.listeners }),
    h(
      'div',
      { staticClass: 'validations' },
      Object.keys(context.props._validations).flatMap(k =>
        context.props._validations[k as ValidatorLevel].map(msg =>
          h('div', { staticClass: k }, msg)
        )
      )
    )
  ]
})

registry.register('basicInput', component)
