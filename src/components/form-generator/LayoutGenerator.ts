import Vue, { PropType } from 'vue'
import { Prepared } from './resolution/types'
import Builder from './LayoutBuilder'
import { resolveTree } from './resolution'

interface IProps {
  prepared: Prepared.Any,
  model: any
}

export default Vue.extend<IProps>({
  functional: true,
  props: {
    prepared: {
      type: Object as PropType<Prepared.Any>,
      required: true
    },
    model: {
      type: Object,
      required: true
    }
  },
  render (h, context) {
    console.log('Component render', context.props.model.deeply.nested.value)
    const resolved = resolveTree(context.props.prepared, context.props.model)
    console.log(resolved)

    return [h(Builder, {
      props: {
        tree: resolved
      },
      scopedSlots: context.scopedSlots
    }), h('div', {}, [JSON.stringify(resolved)])]
  }
})
