<template>
  <div ref="root">
    <layout-builder :tree="resolvedSchema">
      <template v-slot:field="field">
        <widget-renderer
          :field="field"
          :validations="errorObject[field.modelPath]"
          :value="field.modelPath !== undefined ? getByPath(field.modelPath) : undefined"
          @valueChanged="doUpdate"
        />
      </template>
      <template v-for="slot in availableSlots" v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </layout-builder>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import cloneDeep from 'clone-deep'
import LayoutBuilder from './layout/LayoutBuilder'
import WidgetRenderer from './layout/WidgetRenderer'
import { LogicalBranch } from './schema/types'
import { prepareBranch, resolveTree } from './resolution'
import { Prepared } from './resolution/types'
import { ResolutionResult } from './resolution/resolution'
import { registry } from './widgets'
import { ValidatorLevel } from './validation/types'
import { collectValidators, CollectedValidators, getValidity } from './validation'
import { getByPath } from './utils/objectTraversal'

type ValidationResults = {
  [k: string]: {
    [l in ValidatorLevel]: string[]
  }
}

export default Vue.extend({
  props: {
    schema: {
      type: Object as () => LogicalBranch,
      required: true
    },
    model: {
      type: Object,
      required: true
    },
    errorLevels: {
      type: Array as PropType<ValidatorLevel[]>,
      required: false,
      default: () => ['error'] as ValidatorLevel[],
      validator: (val): boolean => {
        return val.every((v) => (['error', 'warn', 'info', 'success'] as ValidatorLevel[]).includes(v))
      }
    },
    noUpdate: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data () {
    return {
      touched: {} as { [k: string]: boolean }
    }
  },
  components: { LayoutBuilder, WidgetRenderer },
  methods: {
    validateAll () {
      for (const key of Object.keys(this.collectedValidators)) {
        this.touched[key] = true
      }
    },
    lookup (key: string) {
      return registry.lookup(key).component
    },
    getByPath (path: string) {
      return getByPath(this.model, path)
    },
    doUpdate ({ path, value }: { path: string; value: any }) {
      this.touched[path] = true
      this.$emit('update', {
        path,
        value
      })

      if (!this.noUpdate) {
        const splitPath = path.split('.')

        const lhs = getByPath<any>(this.model, splitPath.slice(0, -1))
        const accessor = splitPath[splitPath.length - 1]
        lhs[accessor] = value
      }
    }
  },
  computed: {
    preparedSchema (): Prepared.Any {
      return prepareBranch(this.schema)
    },
    cleanedModel (): any {
      // return JSON.parse(JSON.stringify(this.model))
      return cloneDeep(this.model)
    },
    resolvedSchema (): ResolutionResult {
      // return resolveTree(this.preparedSchema, this.model)
      // ^
      // Doesn't work, because the `this.model` is wrapped into a proxy under the hood
      // which breaks both Vue and memoize-state reactivity
      return resolveTree(this.preparedSchema, this.cleanedModel)
      // ^
      // Works, because this causes resolution to trigger on each deep model change
      // and drops Vue's getter/setter wrappings, so Proxy-based memoization works properly
    },
    collectedValidators (): CollectedValidators {
      return collectValidators(this.resolvedSchema)
    },
    errorObject (): ValidationResults {
      return Object.keys(this.collectedValidators).reduce(
        (agg, key) => {
          agg[key] = this.collectedValidators[key](this.touched[key] || false)
          return agg
        },
        {} as ValidationResults
      )
    },
    validated (): { allValid: boolean; valid: number; total: number } {
      return getValidity(this.collectedValidators, this.errorLevels)
    },
    availableSlots (): string[] {
      return Object.keys(this.$scopedSlots).filter(name => name !== 'field')
    }
  }
})
</script>

<style>
</style>
