import Vue, { CreateElement, RenderContext, VNode, PropType } from 'vue'
import { ResolutionOptions } from '../resolution/resolution'
import { Resolved } from '../resolution/types'

type ResolvedBranch = NonNullable<ResolutionOptions>

interface IProps {
  tree: ResolutionOptions | ResolvedBranch[]
}

function buildLevelLayout (
  branch: Resolved.Level,
  children: VNode[],
  h: CreateElement,
  context: RenderContext<IProps>
) {
  let layout = children

  if (
    `${branch.level}.header` in context.scopedSlots ||
    `${branch.level}.footer` in context.scopedSlots
  ) {
    layout = [
      h(
        'div',
        {
          staticClass: `level--${branch.level}--children`
        },
        children
      )
    ]

    if (`${branch.level}.header` in context.scopedSlots) {
      layout.unshift(
        h(
          'div',
          {
            staticClass: `level--${branch.level}--header`
          },
          context.scopedSlots[`${branch.level}.header`]({
            ...branch.context,
            _resolutionContext: branch._resolutionContext
          })
        )
      )
    }

    if (`${branch.level}.footer` in context.scopedSlots) {
      layout.unshift(
        h(
          'div',
          {
            staticClass: `level--${branch.level}--footer`
          },
          context.scopedSlots[`${branch.level}.footer`]({
            ...branch.context,
            _resolutionContext: branch._resolutionContext
          })
        )
      )
    }
  }

  return h(
    'div',
    {
      staticClass: `level--${branch.level}`,
      class: branch.classList,
      attrs: branch.attrs
    },
    layout
  )
}

function branchRender (
  branch: ResolvedBranch,
  h: CreateElement,
  context: RenderContext<IProps>
): VNode {
  if (branch.type === 'field') {
    return h(
      'div',
      {
        class: branch.classList,
        attrs: branch.attrs
      },
      context.scopedSlots.field(branch)
    )
  } else {
    const children = branch.children.map(l => branchRender(l, h, context))
    return buildLevelLayout(branch, children, h, context)
  }
}

export default Vue.extend<IProps>({
  functional: true,
  props: {
    tree: {
      type: [Object, Array] as PropType<ResolutionOptions | ResolvedBranch[]>
    }
  },
  render (h, context) {
    if (!('field' in context.scopedSlots)) {
      throw new TypeError('`field` scoped slot must be provided')
    }

    if (context.props.tree === undefined) {
      return []
    } else if (Array.isArray(context.props.tree)) {
      return context.props.tree.map((v) => branchRender(v, h, context))
    } else {
      return branchRender(context.props.tree, h, context)
    }
  }
})
