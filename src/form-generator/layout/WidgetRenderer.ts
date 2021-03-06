import Vue, { PropType } from 'vue'
import { Resolved } from '../resolution/types'
import { registry } from '../widgets'
import { ValidatorLevel } from '../validation/types'

interface IProps {
  field: Resolved.Field,
  validations: { [k in ValidatorLevel]: string[] }
  value?: any
}

function callAllListeners (fns: Function | Function[], path: string, value: any) {
  if (Array.isArray(fns)) {
    fns.forEach((fn) => fn({ path, value }))
  } else {
    fns({ path, value })
  }
}

function eventIsNative (event: unknown): event is InputEvent {
  if (event instanceof InputEvent) {
    return true
  } else {
    return false
  }
}

export default Vue.extend<IProps>({
  functional: true,
  name: 'widgetRenderer',
  props: {
    field: {
      type: Object as PropType<IProps['field']>,
      required: true
    },
    validations: {
      type: Object as PropType<{ [k in ValidatorLevel]: string[] }>,
      required: false,
      default: (): IProps['validations'] => ({
        error: [],
        info: [],
        success: [],
        warn: []
      })
    },
    value: {
      required: false
    }
  },
  render (h, context) {
    const field = context.props.field
    const widgetBinding = registry.lookup(context.props.field.widget.type)
    const validation = {
      _validations: context.props.validations,
      errorMessage: context.props.validations.error[0],
      warnMessage: context.props.validations.warn[0],
      successMessage: context.props.validations.success[0],
      infoMessage: context.props.validations.info[0]
    }

    return h(widgetBinding.component, {
      props: {
        ...widgetBinding.options,
        ...field.widget.params,
        ...validation,
        [widgetBinding.valueProp]: context.props.value
      },
      attrs: {
        id: field.modelPath ? 'field--' + field.modelPath : undefined
      },
      on: {
        [widgetBinding.eventName]: (event: unknown) => {
          let value = event

          if (eventIsNative(event)) {
            if (event.target && ((event.target as HTMLInputElement).type === 'radio' && (event.target as HTMLInputElement).type === 'checkbox')) {
              value = (event.target as HTMLInputElement).checked
            } else if (event.target) {
              value = (event.target as HTMLInputElement).value
            }
          }

          context.listeners.valueChanged && callAllListeners(context.listeners.valueChanged, field.modelPath!, value)
        }
      }
    })
  }
})
